import crypto from 'node:crypto';
import { db } from '../db.js';
import { config } from '../config.js';

const insert = db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)');
const findValid = db.prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > ?');
const remove = db.prepare('DELETE FROM sessions WHERE id = ?');
const removeExpired = db.prepare('DELETE FROM sessions WHERE expires_at <= ?');

export const createSession = (userId) => {
  const id = crypto.randomBytes(32).toString('hex'); // unguessable random token
  insert.run(id, userId, Date.now() + config.sessionMs);
  return { id };
};

export const findValidSession = (id) => findValid.get(id, Date.now());
export const deleteSession = (id) => remove.run(id);
export const deleteExpiredSessions = () => removeExpired.run(Date.now());