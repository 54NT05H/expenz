import { describe, it, expect } from 'vitest';
import { toPaise, fromPaise } from '../src/utils/money.js';
import { validateExpense } from '../src/utils/validators.js';

describe('money', () => {
  it('avoids floating-point errors', () => {
    expect(0.1 + 0.2).not.toBe(0.3); // JavaScript floats...
    expect(toPaise(0.1 + 0.2)).toBe(30); // ...integers fix it
    expect(toPaise(10.1)).toBe(1010);
  });

  it('round-trips rupees through paise', () => {
    expect(fromPaise(toPaise(3450.75))).toBe(3450.75);
  });
});

describe('validateExpense', () => {
  const valid = { title: ' Tea ', amount: '20', category: 'Food & Dining', date: '2026-10-03' };

  it('accepts a good expense and cleans it up', () => {
    expect(validateExpense(valid).value).toEqual({
      title: 'Tea',
      amount: 20,
      category: 'Food & Dining',
      date: '2026-10-03',
      notes: '',
    });
  });

  it('rejects bad input', () => {
    expect(validateExpense({ ...valid, title: '   ' }).error).toBeTruthy();
    expect(validateExpense({ ...valid, amount: 0 }).error).toBeTruthy();
    expect(validateExpense({ ...valid, amount: 'abc' }).error).toBeTruthy();
    expect(validateExpense({ ...valid, date: '2026-02-30' }).error).toBeTruthy(); // not a real day
  });
});
