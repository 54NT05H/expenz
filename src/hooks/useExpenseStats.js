import { useMemo } from 'react';
import { format, subMonths } from 'date-fns';
import { useExpenses } from '../context/ExpenseContext';
import { useBudget } from '../context/BudgetContext';
import { useFilters } from '../context/FilterContext';

// Totals for the selected month, category breakdown, and the 6-month history.
export const useExpenseStats = () => {
  const { allExpenses } = useExpenses();
  const { budgetLimit } = useBudget();
  const { selectedMonth } = useFilters();

  // Spending for each of the last 6 months, from real expenses only.
  const monthlyHistory = useMemo(() => {
    const today = new Date();

    return Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(today, 5 - i);
      const key = format(monthDate, 'yyyy-MM');

      const spent = allExpenses
        .filter((e) => e.date && e.date.startsWith(key))
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      return { month: format(monthDate, 'MMM'), spent, budget: budgetLimit };
    });
  }, [allExpenses, budgetLimit]);

  return useMemo(() => {
    const monthExpenses = allExpenses.filter((e) => (selectedMonth ? e.date?.startsWith(selectedMonth) : true));

    const totalSpent = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const remainingBudget = budgetLimit - totalSpent;
    const percentageUsed = budgetLimit > 0 ? Math.min(Math.round((totalSpent / budgetLimit) * 100), 100) : 0;

    const categoryTotals = {};
    monthExpenses.forEach((exp) => {
      const cat = exp.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(exp.amount);
    });

    const categoryData = Object.keys(categoryTotals).map((name) => ({
      name,
      value: categoryTotals[name],
    }));

    return {
      totalSpent,
      budgetLimit,
      remainingBudget,
      percentageUsed,
      isOverBudget: totalSpent > budgetLimit,
      categoryData,
      expenseCount: monthExpenses.length,
      monthlyHistory,
    };
  }, [allExpenses, budgetLimit, selectedMonth, monthlyHistory]);
};
