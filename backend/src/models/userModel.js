import crypto from 'node:crypto';
import { db } from '../db.js';

// Statements are prepared once and reused. The ? marks are placeholders.
const findByEmail = db.prepare('SELECT * FROM users WHERE email = ?');
const findById = db.prepare('SELECT * FROM users WHERE id = ?');
const insert = db.prepare('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)');

export const findUserByEmail = (email) => findByEmail.get(email);
export const findUserById = (id) => findById.get(id);

export const createUser = ({ id = crypto.randomUUID(), name, email, passwordHash }) => {
  insert.run(id, name, email, passwordHash);
  return { id, name, email };
};

// Never send password_hash to the browser.
export const toPublicUser = (row) => ({ id: row.id, name: row.name, email: row.email });