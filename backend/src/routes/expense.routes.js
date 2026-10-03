import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateExpense } from '../utils/validators.js';
import { listExpenses, getExpense, createExpense, updateExpense, deleteExpense } from '../models/expenseModel.js';

const router = Router();
router.use(requireAuth); // every route below needs a logged-in user

// Query strings can be arrays (?a=1&a=2); only accept plain non-empty text.
const asText = (value) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);

router.get('/', (req, res) => {
  const { category, month, startDate, endDate, search } = req.query;
  res.json(
    listExpenses(req.user.id, {
      category: asText(category),
      month: asText(month),
      startDate: asText(startDate),
      endDate: asText(endDate),
      search: asText(search),
    })
  );
});

router.post('/', (req, res) => {
  const { value, error } = validateExpense(req.body ?? {});
  if (error) return res.status(400).json({ message: error });

  const expense = createExpense(req.user.id, value);
  return res.status(201).json({ success: true, expense });
});

router.put('/:id', (req, res) => {
  const current = getExpense(req.user.id, req.params.id);
  if (!current) return res.status(404).json({ message: 'Expense not found' });

  // Whitelist: only these five fields can change. id and the owner never come from the client.
  const { title, amount, category, date, notes } = req.body ?? {};
  const { value, error } = validateExpense({
    title: title ?? current.title,
    amount: amount ?? current.amount,
    category: category ?? current.category,
    date: date ?? current.date,
    notes: notes ?? current.notes,
  });
  if (error) return res.status(400).json({ message: error });

  const expense = updateExpense(req.user.id, req.params.id, value);
  return res.json({ success: true, expense });
});

router.delete('/:id', (req, res) => {
  if (!deleteExpense(req.user.id, req.params.id)) {
    return res.status(404).json({ message: 'Expense not found' });
  }
  return res.json({ success: true, message: 'Expense deleted' });
});

export default router;
