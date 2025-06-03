// db.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv'

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME;

let db = null;

export default async function connectDB() {
  if (db) return db; // already connected

  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
  await client.connect();
  db = client.db(DATABASE_NAME);
  console.log(' MongoDB connected');
  return db;
}
