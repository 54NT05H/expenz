import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { createUser, findUserByEmail } from './models/userModel.js';
import { createExpense } from './models/expenseModel.js';

// "YYYY-MM" for N months ago (0 = this month).
const monthKey = (monthsAgo) => {
  const d = new Date();
  d.setDate(1); // avoids overflow like "31st → next month"
  d.setMonth(d.getMonth() - monthsAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// [title, amount, category, monthsAgo, day, notes]
const DEMO_EXPENSES = [
  ['Whole Foods Grocery', 3450, 'Food & Dining', 0, '03', 'Weekly groceries'],
  ['Monthly Metro Pass', 1200, 'Transportation', 0, '02', 'Commute'],
  ['Electricity & Water Bill', 2800, 'Bills & Utilities', 0, '01', 'Monthly bill'],
  ['Apartment Rent', 22000, 'Housing & Rent', 0, '01', 'Monthly rent'],
  ['Cinema & Dinner', 1850, 'Entertainment', 0, '03', 'Weekend outing'],
  ['Wireless Headphones', 4999, 'Shopping', 0, '02', 'Noise cancelling'],
  ['Gym Membership', 2500, 'Healthcare & Fitness', 0, '02', 'Quarterly renew'],
  ['Apartment Rent', 22000, 'Housing & Rent', 1, '01', 'Monthly rent'],
  ['Groceries', 9800, 'Food & Dining', 1, '15', ''],
  ['Apartment Rent', 22000, 'Housing & Rent', 2, '01', 'Monthly rent'],
  ['Weekend Trip', 14500, 'Entertainment', 2, '18', ''],
  ['Apartment Rent', 22000, 'Housing & Rent', 3, '01', 'Monthly rent'],
  ['Online Course', 6500, 'Education', 3, '12', ''],
];

// Creates the demo account once. Safe to call on every start.
export const seedDemoData = () => {
  if (config.isProduction) return; // never ship a known-password account
  if (findUserByEmail('demo@fintrack.io')) return; // already seeded

  const user = createUser({
    id: 'demo-1',
    name: 'Demo User',
    email: 'demo@fintrack.io',
    passwordHash: bcrypt.hashSync('demo123', 10),
  });

  for (const [title, amount, category, monthsAgo, day, notes] of DEMO_EXPENSES) {
    createExpense(user.id, { title, amount, category, date: `${monthKey(monthsAgo)}-${day}`, notes });
  }
};