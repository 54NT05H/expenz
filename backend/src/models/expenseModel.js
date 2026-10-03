import crypto from 'node:crypto';
import { db } from '../db.js';
import { toPaise, fromPaise } from '../utils/money.js';

// Database row → the shape the frontend expects.
const toExpense = (row) => ({
  id: row.id,
  title: row.title,
  amount: fromPaise(row.amount_paise),
  category: row.category,
  date: row.date,
  notes: row.notes,
});

const getStmt = db.prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?');
const insertStmt = db.prepare(
  'INSERT INTO expenses (id, user_id, title, amount_paise, category, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
);
const updateStmt = db.prepare(
  'UPDATE expenses SET title = ?, amount_paise = ?, category = ?, date = ?, notes = ? WHERE id = ? AND user_id = ?'
);
const deleteStmt = db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?');

// Every query includes user_id, so one user can never reach another's rows.
export const listExpenses = (userId, filters = {}) => {
  const where = ['user_id = ?'];
  const params = [userId];

  if (filters.category && filters.category !== 'All') {
    where.push('category = ?');
    params.push(filters.category);
  }
  if (filters.month) {
    where.push('substr(date, 1, 7) = ?'); // "2026-10"
    params.push(filters.month);
  }
  if (filters.startDate) {
    where.push('date >= ?');
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    where.push('date <= ?');
    params.push(filters.endDate);
  }
  if (filters.search) {
    where.push('(LOWER(title) LIKE ? OR LOWER(notes) LIKE ?)');
    const like = `%${filters.search.toLowerCase()}%`;
    params.push(like, like);
  }

  // The SQL text is built only from fixed strings; user input only goes in params.
  const sql = `SELECT * FROM expenses WHERE ${where.join(' AND ')} ORDER BY date DESC, rowid DESC`;
  return db
    .prepare(sql)
    .all(...params)
    .map(toExpense);
};

export const getExpense = (userId, id) => {
  const row = getStmt.get(id, userId);
  return row ? toExpense(row) : null;
};

export const createExpense = (userId, data) => {
  const id = crypto.randomUUID();
  insertStmt.run(id, userId, data.title, toPaise(data.amount), data.category, data.date, data.notes);
  return getExpense(userId, id);
};

export const updateExpense = (userId, id, data) => {
  const result = updateStmt.run(data.title, toPaise(data.amount), data.category, data.date, data.notes, id, userId);
  return result.changes > 0 ? getExpense(userId, id) : null;
};

// Returns true if a row was actually deleted.
export const deleteExpense = (userId, id) => deleteStmt.run(id, userId).changes > 0;