import { db } from '../db.js';
import { toPaise, fromPaise } from '../utils/money.js';

const getStmt = db.prepare('SELECT limit_paise FROM budgets WHERE user_id = ?');
// "Upsert": insert, or update if this user already has a row.
const upsertStmt = db.prepare(`
  INSERT INTO budgets (user_id, limit_paise) VALUES (?, ?)
  ON CONFLICT(user_id) DO UPDATE SET limit_paise = excluded.limit_paise
`);

export const getBudget = (userId) => {
  const row = getStmt.get(userId);
  return row ? fromPaise(row.limit_paise) : null; // null = never set
};

export const setBudget = (userId, limit) => {
  upsertStmt.run(userId, toPaise(limit));
  return getBudget(userId);
};