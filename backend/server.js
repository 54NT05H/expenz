import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.get("/", (req, res) => {
    res.send("Expenz Backend Running Successfully");
});
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const users = [
  {
    id: 'demo-1',
    name: 'Demo User',
    email: 'demo@fintrack.io',
    password: 'demo123',
  },
];

const sessions = new Map();

const expenses = [
  { id: '1', userId: 'demo-1', title: 'Whole Foods Grocery', amount: 3450, category: 'Food & Dining', date: '2026-09-14', notes: 'Weekly groceries' },
  { id: '2', userId: 'demo-1', title: 'Monthly Metro Pass', amount: 1200, category: 'Transportation', date: '2026-09-12', notes: 'Commute' },
  { id: '3', userId: 'demo-1', title: 'Electricity & Water Bill', amount: 2800, category: 'Bills & Utilities', date: '2026-09-10', notes: 'August bill' },
  { id: '4', userId: 'demo-1', title: 'Apartment Rent', amount: 22000, category: 'Housing & Rent', date: '2026-09-01', notes: 'Monthly rent' },
  { id: '5', userId: 'demo-1', title: 'Cinema & Dinner', amount: 1850, category: 'Entertainment', date: '2026-09-08', notes: 'Weekend outing' },
  { id: '6', userId: 'demo-1', title: 'Wireless Headphones', amount: 4999, category: 'Shopping', date: '2026-09-05', notes: 'Noise cancelling' },
  { id: '7', userId: 'demo-1', title: 'Gym Membership', amount: 2500, category: 'Healthcare & Fitness', date: '2026-09-02', notes: 'Quarterly renew' },
];

const budgets = [{ userId: 'demo-1', month: '2026-09', limit: 50000 }];

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  path: '/',
};

const createSession = (res, userId) => {
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, userId);
  res.cookie('sessionId', sessionId, cookieOptions);
  return sessionId;
};

const authMiddleware = (req, res, next) => {
  const sessionId = req.cookies?.sessionId;

  if (!sessionId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = sessions.get(sessionId);
  if (!userId) {
    return res.status(401).json({ message: 'Invalid session' });
  }

  const user = users.find((item) => item.id === userId);
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  req.user = { id: user.id, email: user.email, name: user.name };
  next();
};

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Expenz backend is running' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingUser = users.find((user) => user.email.toLowerCase() === String(email).toLowerCase());
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
    };

    users.push(newUser);

    createSession(res, newUser.id);

    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = users.find((item) => item.email.toLowerCase() === String(email).toLowerCase());
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    createSession(res, user.id);

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find((item) => item.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

app.post('/api/auth/logout', (req, res) => {
  const sessionId = req.cookies?.sessionId;
  if (sessionId) {
    sessions.delete(sessionId);
  }

  res.clearCookie('sessionId', { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/expenses', authMiddleware, (req, res) => {
  const { category, startDate, endDate, search, month } = req.query;

  let filteredExpenses = expenses.filter((expense) => expense.userId === req.user.id);

  if (category && category !== 'All') {
    filteredExpenses = filteredExpenses.filter((expense) => expense.category === category);
  }

  if (month) {
    filteredExpenses = filteredExpenses.filter((expense) => expense.date?.startsWith(month));
  }

  if (startDate) {
    filteredExpenses = filteredExpenses.filter((expense) => expense.date >= startDate);
  }

  if (endDate) {
    filteredExpenses = filteredExpenses.filter((expense) => expense.date <= endDate);
  }

  if (search) {
    const value = String(search).toLowerCase();
    filteredExpenses = filteredExpenses.filter(
      (expense) =>
        expense.title.toLowerCase().includes(value) ||
        (expense.notes && expense.notes.toLowerCase().includes(value))
    );
  }

  return res.json(filteredExpenses);
});

app.post('/api/expenses', authMiddleware, (req, res) => {
  const { title, amount, category, date, notes } = req.body;

  if (!title || !amount || !category || !date) {
    return res.status(400).json({ message: 'Title, amount, category and date are required' });
  }

  const newExpense = {
    id: crypto.randomUUID(),
    userId: req.user.id,
    title,
    amount: Number(amount),
    category,
    date,
    notes: notes || '',
  };

  expenses.push(newExpense);

  return res.status(201).json({ success: true, expense: newExpense });
});

app.put('/api/expenses/:id', authMiddleware, (req, res) => {
  const expenseIndex = expenses.findIndex(
    (expense) => expense.id === req.params.id && expense.userId === req.user.id
  );

  if (expenseIndex === -1) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  const updatedExpense = {
    ...expenses[expenseIndex],
    ...req.body,
    amount: Number(req.body.amount ?? expenses[expenseIndex].amount),
  };

  expenses[expenseIndex] = updatedExpense;
  return res.json({ success: true, expense: updatedExpense });
});

app.delete('/api/expenses/:id', authMiddleware, (req, res) => {
  const index = expenses.findIndex(
    (expense) => expense.id === req.params.id && expense.userId === req.user.id
  );

  if (index === -1) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  expenses.splice(index, 1);
  return res.json({ success: true, message: 'Expense deleted' });
});

app.get('/api/expenses/stats', authMiddleware, (req, res) => {
  const { month = '2026-09' } = req.query;
  const userExpenses = expenses.filter((expense) => expense.userId === req.user.id && expense.date?.startsWith(month));

  const totalSpent = userExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const budgetEntry = budgets.find((item) => item.userId === req.user.id && item.month === month);
  const budgetLimit = budgetEntry ? Number(budgetEntry.limit) : 0;

  const categoryTotals = {};
  userExpenses.forEach((expense) => {
    const key = expense.category || 'Other';
    categoryTotals[key] = (categoryTotals[key] || 0) + Number(expense.amount || 0);
  });

  const categoryData = Object.keys(categoryTotals).map((name) => ({
    name,
    value: categoryTotals[name],
  }));

  return res.json({
    totalSpent,
    budgetLimit,
    remainingBudget: budgetLimit - totalSpent,
    percentageUsed: budgetLimit > 0 ? Math.min(Math.round((totalSpent / budgetLimit) * 100), 100) : 0,
    expenseCount: userExpenses.length,
    categoryData,
  });
});

app.get('/api/budget', authMiddleware, (req, res) => {
  const { month = '2026-09' } = req.query;
  const budgetEntry = budgets.find((item) => item.userId === req.user.id && item.month === month);

  if (!budgetEntry) {
    return res.json({ month, limit: 0 });
  }

  return res.json(budgetEntry);
});

app.post('/api/budget', authMiddleware, (req, res) => {
  const { limit, month = '2026-09' } = req.body;

  if (!limit && limit !== 0) {
    return res.status(400).json({ message: 'Budget limit is required' });
  }

  const existingBudget = budgets.find(
    (item) => item.userId === req.user.id && item.month === month
  );

  if (existingBudget) {
    existingBudget.limit = Number(limit);
    return res.json({ success: true, budget: existingBudget });
  }

  const newBudget = {
    userId: req.user.id,
    month,
    limit: Number(limit),
  };

  budgets.push(newBudget);
  return res.status(201).json({ success: true, budget: newBudget });
});

app.get('/api/budget/summary', authMiddleware, (req, res) => {
  const userBudgetList = budgets.filter((item) => item.userId === req.user.id);
  return res.json(userBudgetList);
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
