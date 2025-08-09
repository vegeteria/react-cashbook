import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectToDb, getDb } from './src/db.js';
import { ObjectId } from 'mongodb';

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

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
  const user = await db.collection('users').findOne({ username });

  if (user) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const result = await db.collection('users').insertOne({ username, password });
  res.status(201).json({ message: 'User created successfully', userId: result.insertedId });
});

// User login
app.post('/api/login', async (req, res) => {
  // Trim whitespace from incoming data
  const username = req.body.username ? req.body.username.trim() : '';
  const password = req.body.password ? req.body.password.trim() : '';

  const db = getDb();
  // Find user with the trimmed credentials
  const user = await db.collection('users').findOne({ username, password });

  if (user) {
    res.json({ message: 'Login successful', userId: user._id });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Save sheet data
app.post('/api/sheets', async (req, res) => {
  const { userId, sheetName, transactions, totals } = req.body;
  const db = getDb();

  const result = await db.collection('sheets').insertOne({
    userId: new ObjectId(userId),
    sheetName,
    transactions,
    totals,
    createdAt: new Date(),
  });

  res.status(201).json({ message: 'Sheet saved successfully', sheetId: result.insertedId });
});

// Get all sheets for a user
app.get('/api/sheets/:userId', async (req, res) => {
  const { userId } = req.params;
  const db = getDb();
  const sheets = await db.collection('sheets').find({ userId: new ObjectId(userId) }).toArray();
  res.json(sheets);
});

// Get a single sheet
app.get('/api/sheet/:sheetId', async (req, res) => {
    const { sheetId } = req.params;
    const db = getDb();
    try {
        const sheet = await db.collection('sheets').findOne({ _id: new ObjectId(sheetId) });
        if (sheet) {
            res.json(sheet);
        } else {
            res.status(404).json({ message: 'Sheet not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sheet', error });
    }
});

// Update a sheet (name, transactions, totals)
app.put('/api/sheets/:sheetId', async (req, res) => {
  const { sheetId } = req.params;
  const { sheetName, transactions, totals } = req.body;
  const db = getDb();
  try {
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
app.delete('/api/sheets/:sheetId', async (req, res) => {
  const { sheetId } = req.params;
  const db = getDb();
  try {
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