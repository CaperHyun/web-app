import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';

const DB_PATH = process.env.NODE_ENV === 'production' 
  ? '/data/items.sqlite'
  : path.join(__dirname, '../../items.sqlite');

function initializeDatabase(): Database {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      return;
    }
  });

  // Create items table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(50) NOT NULL,
      color VARCHAR(50) NOT NULL,
      description TEXT,
      image_url TEXT,
      date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

export const db = initializeDatabase(); 