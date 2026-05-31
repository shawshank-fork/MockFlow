const Database = require("better-sqlite3");
const path = require('path');
require('dotenv').config();

//determine path to database.db rel to this file
const dbPath = path.resolve(__dirname, '..',
    process.env.DATABASE_URL || 'database.db');

const db = new Database(dbPath, { verbose: console.log }); // verbose: console.log means every SQL query gets printed to your terminal 

//creating mock table
db.exec(`
  CREATE TABLE IF NOT EXISTS mocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    method TEXT NOT NULL,
    status INTEGER DEFAULT 200,
    response_body TEXT,          --Will store JSON as string
    headers TEXT,                --Will store custom headers JSON as string
    delay_ms INTEGER DEFAULT 0,  -- Artificial response latency in milliseconds
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(path, method)         -- Ensures path + method combinations are unique
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS request_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mock_id INTEGER,
    method TEXT NOT NULL,
    headers TEXT,                -- Incoming headers stored as stringified JSON
    body TEXT,                   -- Incoming payload stored as stringified JSON
    query_params TEXT,           -- Query parameters stored as stringified JSON
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(mock_id) REFERENCES mocks(id) ON DELETE CASCADE
  )
`);

console.log('Database tables initialized successfully');
module.exports = db;