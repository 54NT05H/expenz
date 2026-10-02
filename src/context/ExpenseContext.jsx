import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { format, subMonths } from 'date-fns';
import { expenseApi } from '../api/expenseApi';
import { budgetApi } from '../api/budgetApi';
import { useAuth } from './AuthContext';
import { DEFAULT_BUDGET } from '../utils/constants';;

const ExpenseContext = createContext(null);



// Every user gets their own storage keys, so accounts never see each other's cache.
const expensesKey = (userId) => `expenz_expenses_${userId}`;
const budgetKey = (userId) => `expenz_budget_${userId}`;

const readCache = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback; // corrupted data → ignore it
  }
};

export const ExpenseProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;

  const [expenses, setExpenses] = useState([]);
  const [budgetLimit, setBudgetLimit] = useState(DEFAULT_BUDGET);
  // Whose data is currently in `expenses` and `budgetLimit`?
  // Stops us saving user A's data under user B's key during a switch.
  const [dataOwner, setDataOwner] = useState(null);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseApi.getAllExpenses();
      if (Array.isArray(data)) {
        setExpenses(data);
      }
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  // One-time cleanup of the old shared keys that leaked between accounts.
  useEffect(() => {
    ['fintrack_expenses', 'fintrack_budget', 'fintrack_user'].forEach((key) =>
      localStorage.removeItem(key)
    );
  }, []);

  // Runs whenever the logged-in user changes (login, logout, switching accounts).
  useEffect(() => {
    if (!userId) {
      // Logged out: wipe the screen state.
      setExpenses([]);
      setBudgetLimit(DEFAULT_BUDGET);
      setDataOwner(null);
      return;
    }

    // Logged in: show THIS user's cache instantly, then refresh from the server.
    setExpenses(readCache(expensesKey(userId), []));
    setBudgetLimit(Number(readCache(budgetKey(userId), DEFAULT_BUDGET)));
    setDataOwner(userId);
    loadExpenses();
  }, [userId]);

  // Save to THIS user's keys, but only if the data on screen really belongs to them.
  useEffect(() => {
    if (!userId || dataOwner !== userId) return;
    localStorage.setItem(expensesKey(userId), JSON.stringify(expenses));
  }, [expenses, userId, dataOwner]);

  useEffect(() => {
    if (!userId || dataOwner !== userId) return;
    localStorage.setItem(budgetKey(userId), JSON.stringify(budgetLimit));
  }, [budgetLimit, userId, dataOwner]);

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

  const updateExpense = async (id, expenseData) => {
    try {
      const updated = await expenseApi.updateExpense(id, expenseData);
      const updatedExp = updated?.expense || { ...expenseData, id };
      setExpenses((prev) =>
        prev.map((item) => (String(item.id ?? item._id) === String(id) ? { ...item, ...updatedExp } : item))
      );
      await loadExpenses();
      return { success: true };
    } catch {
      setExpenses((prev) =>
        prev.map((item) => (String(item.id ?? item._id) === String(id) ? { ...item, ...expenseData, id } : item))
      );
      await loadExpenses();
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
  setBudgetLimit(numericLimit); // the effect above saves it under this user's key
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
  // Spending for each of the last 6 months (ending with the current month),
// calculated only from real expenses.
const monthlyHistory = useMemo(() => {
  const today = new Date();

  return Array.from({ length: 6 }, (_, i) => {
    const monthDate = subMonths(today, 5 - i);     // i=0 → 5 months ago, i=5 → this month
    const key = format(monthDate, 'yyyy-MM');      // e.g. "2026-10"

    const spent = expenses
      .filter((e) => e.date && e.date.startsWith(key))
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    return {
      month: format(monthDate, 'MMM'),             // e.g. "Oct"
      spent,
      budget: budgetLimit,
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
        updateExpense,
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
