import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}
if (!dbName) {
    throw new Error('Please define the DB_NAME environment variable inside .env');
}

let client;
let db;

export async function connectToDb() {
  if (db) {
    return db;
  }

  client = new MongoClient(uri, {
    serverApi: {
      version: '1',
      strict: true,
      deprecationErrors: true,
    }
  });
  await client.connect();
  // Send a ping to confirm a successful connection
  await client.db("admin").command({ ping: 1 });
  db = client.db(dbName);
  console.log('Pinged your deployment. You successfully connected to MongoDB!');
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error('Call connectToDb first');
  }
  return db;
}