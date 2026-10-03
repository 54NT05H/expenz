import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBudgetLimit } from '../utils/validators.js';
import { getBudget, setBudget } from '../models/budgetModel.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  res.json({ limit: getBudget(req.user.id) }); // null until the user sets one
});

router.post('/', (req, res) => {
  const { value, error } = validateBudgetLimit(req.body?.limit);
  if (error) return res.status(400).json({ message: error });

  return res.json({ success: true, budget: { limit: setBudget(req.user.id, value) } });
});

export default router;