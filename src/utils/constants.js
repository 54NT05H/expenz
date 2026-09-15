export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Dining', color: '#f59e0b', icon: 'Utensils' },
  { id: 'shopping', label: 'Shopping', color: '#ec4899', icon: 'ShoppingBag' },
  { id: 'housing', label: 'Housing & Rent', color: '#8b5cf6', icon: 'Home' },
  { id: 'transport', label: 'Transportation', color: '#3b82f6', icon: 'Car' },
  { id: 'entertainment', label: 'Entertainment', color: '#10b981', icon: 'Film' },
  { id: 'utilities', label: 'Bills & Utilities', color: '#06b6d4', icon: 'Zap' },
  { id: 'healthcare', label: 'Healthcare & Fitness', color: '#ef4444', icon: 'HeartPulse' },
  { id: 'education', label: 'Education', color: '#6366f1', icon: 'GraduationCap' },
  { id: 'other', label: 'Other', color: '#6b7280', icon: 'MoreHorizontal' },
];

export const CATEGORY_COLOR_MAP = EXPENSE_CATEGORIES.reduce((acc, cat) => {
  acc[cat.label] = cat.color;
  acc[cat.id] = cat.color;
  return acc;
}, {});

export const DEFAULT_BUDGET = 50000;
