const isValidDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  // "2026-02-30" parses into March, so compare the round trip.
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

// Checks and cleans an expense. Returns { error } or { value }.
export const validateExpense = (input) => {
  const title = String(input.title ?? '').trim();
  const category = String(input.category ?? '').trim();
  const notes = String(input.notes ?? '').trim();
  const amount = Number(input.amount);

  if (!title) return { error: 'Title is required' };
  if (title.length > 120) return { error: 'Title must be 120 characters or fewer' };
  if (!Number.isFinite(amount) || amount <= 0) return { error: 'Amount must be a number greater than zero' };
  if (amount > 1_000_000_000) return { error: 'Amount is too large' };
  if (!category) return { error: 'Category is required' };
  if (!isValidDate(input.date)) return { error: 'Date must be a real date in YYYY-MM-DD format' };
  if (notes.length > 500) return { error: 'Notes must be 500 characters or fewer' };

  return { value: { title, amount, category, date: input.date, notes } };
};

export const validateBudgetLimit = (input) => {
  const limit = Number(input);
  if (!Number.isFinite(limit) || limit <= 0 || limit > 1_000_000_000) {
    return { error: 'Budget limit must be a number greater than zero' };
  }
  return { value: limit };
};
