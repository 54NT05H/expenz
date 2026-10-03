import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { config } from './config.js';

if (config.dbPath !== ':memory:') {
  fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
}

export const db = new Database(config.dbPath);

db.pragma('journal_mode = WAL'); // faster, safer writes
db.pragma('foreign_keys = ON'); // enforce the REFERENCES rules below

// "IF NOT EXISTS" makes this safe to run on every start.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id           TEXT PRIMARY KEY,
    user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
    category     TEXT NOT NULL,
    date         TEXT NOT NULL,
    notes        TEXT NOT NULL DEFAULT ''
  );
  CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses (user_id, date);

  CREATE TABLE IF NOT EXISTS budgets (
    user_id     TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    limit_paise INTEGER NOT NULL CHECK (limit_paise > 0)
  );
`);
