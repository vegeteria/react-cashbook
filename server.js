import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectToDb, getDb } from './src/db.js';
import { ObjectId } from 'mongodb';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const jwtSecret = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';

// Configure CORS to allow credentials
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(bodyParser.json());
app.use(cookieParser());

function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
}

function clearAuthCookie(res) {
  res.clearCookie('token');
}

function authenticate(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = { userId: decoded.userId, username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Connect to MongoDB
connectToDb().catch(err => {
  console.error('Failed to connect to the database');
  console.error(err);
  process.exit(1);
});

// User signup
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  const db = getDb();
  const existing = await db.collection('users').findOne({ username });

  if (existing) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.collection('users').insertOne({ username, password: hashedPassword });

  // Auto-login after signup
  const token = jwt.sign({ userId: result.insertedId, username }, jwtSecret, { expiresIn: '1d' });
  setAuthCookie(res, token);
  res.status(201).json({ message: 'User created successfully', userId: result.insertedId });
});

// User login
app.post('/api/login', async (req, res) => {
  const username = req.body.username ? req.body.username.trim() : '';
  const password = req.body.password ? req.body.password.trim() : '';

  const db = getDb();
  const user = await db.collection('users').findOne({ username });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  let valid = false;
  // Compare hashed password
  if (user.password && user.password.startsWith('$2')) {
    valid = await bcrypt.compare(password, user.password);
  } else {
    // Backward-compat: support legacy plaintext passwords and upgrade to hash on success
    if (user.password === password) {
      valid = true;
      const newHash = await bcrypt.hash(password, 10);
      await db.collection('users').updateOne({ _id: user._id }, { $set: { password: newHash } });
    }
  }

  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user._id, username: user.username }, jwtSecret, { expiresIn: '1d' });
  setAuthCookie(res, token);
  res.json({ message: 'Login successful', userId: user._id });
});

// Current user (from cookie)
app.get('/api/me', authenticate, (req, res) => {
  res.json({ userId: req.user.userId, username: req.user.username });
});

// Backward-compatible token verify (reads cookie)
app.post('/api/verify-token', authenticate, (req, res) => {
  res.json({ message: 'Token is valid', userId: req.user.userId, username: req.user.username });
});

// Logout
app.post('/api/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
});

// Save sheet data
app.post('/api/sheets', authenticate, async (req, res) => {
  const { sheetName, transactions, totals } = req.body;
  const db = getDb();

  const result = await db.collection('sheets').insertOne({
    userId: new ObjectId(req.user.userId),
    sheetName,
    transactions,
    totals,
    createdAt: new Date(),
  });

  res.status(201).json({ message: 'Sheet saved successfully', sheetId: result.insertedId });
});

// Get all sheets for a user
app.get('/api/sheets/:userId', authenticate, async (req, res) => {
  const { userId } = req.params;
  if (String(req.user.userId) !== String(userId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const db = getDb();
  const sheets = await db.collection('sheets').find({ userId: new ObjectId(userId) }).toArray();
  res.json(sheets);
});

// Get a single sheet
app.get('/api/sheet/:sheetId', authenticate, async (req, res) => {
    const { sheetId } = req.params;
    const db = getDb();
    try {
        const sheet = await db.collection('sheets').findOne({ _id: new ObjectId(sheetId) });
        if (sheet) {
            if (String(sheet.userId) !== String(req.user.userId)) {
              return res.status(403).json({ message: 'Forbidden' });
            }
            res.json(sheet);
        } else {
            res.status(404).json({ message: 'Sheet not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sheet', error });
    }
});

// Update a sheet (name, transactions, totals)
app.put('/api/sheets/:sheetId', authenticate, async (req, res) => {
  const { sheetId } = req.params;
  const { sheetName, transactions, totals } = req.body;
  const db = getDb();
  try {
    // Ensure ownership before update
    const existing = await db.collection('sheets').findOne({ _id: new ObjectId(sheetId) });
    if (!existing) {
      return res.status(404).json({ message: 'Sheet not found' });
    }
    if (String(existing.userId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const result = await db.collection('sheets').updateOne(
      { _id: new ObjectId(sheetId) },
      { $set: { sheetName, transactions, totals } }
    );
    if (result.matchedCount > 0) {
      res.json({ message: 'Sheet updated successfully' });
    } else {
      res.status(404).json({ message: 'Sheet not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating sheet', error });
  }
});

// Delete a sheet
app.delete('/api/sheets/:sheetId', authenticate, async (req, res) => {
  const { sheetId } = req.params;
  const db = getDb();
  try {
    // Ensure ownership before delete
    const existing = await db.collection('sheets').findOne({ _id: new ObjectId(sheetId) });
    if (!existing) {
      return res.status(404).json({ message: 'Sheet not found' });
    }
    if (String(existing.userId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const result = await db.collection('sheets').deleteOne({ _id: new ObjectId(sheetId) });
    if (result.deletedCount > 0) {
      res.json({ message: 'Sheet deleted successfully' });
    } else {
      res.status(404).json({ message: 'Sheet not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting sheet', error });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});