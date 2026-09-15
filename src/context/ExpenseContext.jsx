import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { expenseApi } from '../api/expenseApi';
import { budgetApi } from '../api/budgetApi';
import { DEFAULT_BUDGET, EXPENSE_CATEGORIES } from '../utils/constants';

const ExpenseContext = createContext(null);

const INITIAL_EXPENSES = [
  { id: '1', title: 'Whole Foods Grocery', amount: 3450, category: 'Food & Dining', date: '2026-09-14', notes: 'Weekly groceries' },
  { id: '2', title: 'Monthly Metro Pass', amount: 1200, category: 'Transportation', date: '2026-09-12', notes: 'Commute' },
  { id: '3', title: 'Electricity & Water Bill', amount: 2800, category: 'Bills & Utilities', date: '2026-09-10', notes: 'August bill' },
  { id: '4', title: 'Apartment Rent', amount: 22000, category: 'Housing & Rent', date: '2026-09-01', notes: 'Monthly rent' },
  { id: '5', title: 'Cinema & Dinner', amount: 1850, category: 'Entertainment', date: '2026-09-08', notes: 'Weekend outing' },
  { id: '6', title: 'Wireless Headphones', amount: 4999, category: 'Shopping', date: '2026-09-05', notes: 'Noise cancelling' },
  { id: '7', title: 'Gym Membership', amount: 2500, category: 'Healthcare & Fitness', date: '2026-09-02', notes: 'Quarterly renew' },
];

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('fintrack_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [budgetLimit, setBudgetLimit] = useState(() => {
    const saved = localStorage.getItem('fintrack_budget');
    return saved ? Number(saved) : DEFAULT_BUDGET;
  });

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');

  // Save to local storage for persistent frontend state
  useEffect(() => {
    localStorage.setItem('fintrack_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('fintrack_budget', budgetLimit.toString());
  }, [budgetLimit]);

  // Load from backend if available
  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseApi.getAllExpenses();
      if (Array.isArray(data) && data.length > 0) {
        setExpenses(data);
      }
    } catch {
      // Backend not running, use local state
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const created = await expenseApi.addExpense(expenseData);
      const newExp = created?.expense || { ...expenseData, id: Date.now().toString() };
      setExpenses((prev) => [newExp, ...prev]);
      return { success: true };
    } catch {
      const newExp = { ...expenseData, id: Date.now().toString() };
      setExpenses((prev) => [newExp, ...prev]);
      return { success: true };
    }
  };

  const deleteExpense = async (id) => {
    try {
      await expenseApi.deleteExpense(id);
    } catch {
      // Fallback local
    } finally {
      setExpenses((prev) => prev.filter((item) => item.id !== id && item._id !== id));
    }
  };

  const updateBudget = async (newLimit) => {
    const numericLimit = Number(newLimit);
    setBudgetLimit(numericLimit);
    localStorage.setItem('fintrack_budget', numericLimit.toString());
    try {
      await budgetApi.setBudget({ limit: numericLimit, month: selectedMonth });
    } catch {
      // Keep local state update
    }
  };

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesMonth = selectedMonth ? item.date?.startsWith(selectedMonth) : true;
      return matchesCategory && matchesSearch && matchesMonth;
    });
  }, [expenses, selectedCategory, searchQuery, selectedMonth]);

  // Dynamic Monthly History for Recharts (Spending vs Budget Limit)
  const monthlyHistory = useMemo(() => {
    const months = [
      { key: '2026-04', label: 'Apr', baseSpent: 38000 },
      { key: '2026-05', label: 'May', baseSpent: 44000 },
      { key: '2026-06', label: 'Jun', baseSpent: 51200 },
      { key: '2026-07', label: 'Jul', baseSpent: 42000 },
      { key: '2026-08', label: 'Aug', baseSpent: 48500 },
      { key: '2026-09', label: 'Sep', baseSpent: 0 },
    ];

    return months.map((m) => {
      const actualMonthSpent = expenses
        .filter((e) => e.date && e.date.startsWith(m.key))
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      const totalSpent = m.key === '2026-09' ? actualMonthSpent : (m.baseSpent + actualMonthSpent);

      return {
        month: m.label,
        spent: totalSpent,
        budget: budgetLimit, // Dynamically tracks current user budgetLimit!
      };
    });
  }, [expenses, budgetLimit]);

  // Stats Calculations
  const stats = useMemo(() => {
    const currentMonthExpenses = expenses.filter((e) => (selectedMonth ? e.date?.startsWith(selectedMonth) : true));
    const totalSpent = currentMonthExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const remainingBudget = budgetLimit - totalSpent;
    const percentageUsed = budgetLimit > 0 ? Math.min(Math.round((totalSpent / budgetLimit) * 100), 100) : 0;
    const isOverBudget = totalSpent > budgetLimit;

    // Category Breakdown for Recharts
    const categoryTotals = {};
    currentMonthExpenses.forEach((exp) => {
      const cat = exp.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(exp.amount);
    });

    const categoryData = Object.keys(categoryTotals).map((cat) => ({
      name: cat,
      value: categoryTotals[cat],
    }));

    return {
      totalSpent,
      budgetLimit,
      remainingBudget,
      percentageUsed,
      isOverBudget,
      categoryData,
      expenseCount: currentMonthExpenses.length,
      monthlyHistory,
    };
  }, [expenses, budgetLimit, selectedMonth, monthlyHistory]);

  return (
    <ExpenseContext.Provider
      value={{
        expenses: filteredExpenses,
        allExpenses: expenses,
        loading,
        budgetLimit,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedMonth,
        setSelectedMonth,
        stats,
        monthlyHistory,
        loadExpenses,
        addExpense,
        deleteExpense,
        updateBudget,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
