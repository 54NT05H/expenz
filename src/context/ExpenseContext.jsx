import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { format, subMonths } from 'date-fns';
import { expenseApi } from '../api/expenseApi';
import { budgetApi } from '../api/budgetApi';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getErrorMessage } from '../utils/errorHelper';
import { DEFAULT_BUDGET } from '../utils/constants';

const ExpenseContext = createContext(null);

// Expenses now come ONLY from the server. The budget is still kept in
// localStorage (per user) because the app doesn't load it from the server yet.
const budgetKey = (userId) => `expenz_budget_${userId}`;

const readBudget = (userId) => {
  try {
    const raw = localStorage.getItem(budgetKey(userId));
    const value = raw ? Number(JSON.parse(raw)) : DEFAULT_BUDGET;
    return Number.isFinite(value) && value > 0 ? value : DEFAULT_BUDGET;
  } catch {
    return DEFAULT_BUDGET; // corrupted data → ignore it
  }
};

export const ExpenseProvider = ({ children }) => {
  const { user } = useAuth();
  const toast = useToast();
  const userId = user?.id;

  const [expenses, setExpenses] = useState([]);
  const [budgetLimit, setBudgetLimit] = useState(DEFAULT_BUDGET);
  // Whose budget is currently on screen? Prevents saving user A's budget under user B's key.
  const [dataOwner, setDataOwner] = useState(null);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseApi.getAllExpenses();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (error) {
      // A 401 means "session expired": the axios interceptor already logs the
      // user out, so a red toast on top of that would just be noise.
      if (error.response?.status !== 401) {
        toast.error(getErrorMessage(error, 'Could not load your expenses.'));
      }
    } finally {
      setLoading(false);
    }
  };

  // One-time cleanup: delete the old browser caches from earlier versions.
  useEffect(() => {
    const oldKeys = Object.keys(localStorage).filter(
      (key) =>
        key.startsWith('expenz_expenses_') ||
        ['fintrack_expenses', 'fintrack_budget', 'fintrack_user'].includes(key)
    );
    oldKeys.forEach((key) => localStorage.removeItem(key));
  }, []);

  // Runs whenever the logged-in user changes (login, logout, switching accounts).
  useEffect(() => {
    if (!userId) {
      setExpenses([]);
      setBudgetLimit(DEFAULT_BUDGET);
      setDataOwner(null);
      return;
    }

    setExpenses([]); // never show the previous user's expenses
    setBudgetLimit(readBudget(userId));
    setDataOwner(userId);
    loadExpenses();
  }, [userId]);

  // Save the budget under THIS user's key, only if it really belongs to them.
  useEffect(() => {
    if (!userId || dataOwner !== userId) return;
    localStorage.setItem(budgetKey(userId), JSON.stringify(budgetLimit));
  }, [budgetLimit, userId, dataOwner]);

  // ---------- Add / edit: THROW on failure so the form can show the error ----------

  const addExpense = async (expenseData) => {
    try {
      const data = await expenseApi.addExpense(expenseData);
      setExpenses((prev) => [data.expense, ...prev]);
      toast.success('Expense added');
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Could not save the expense.'));
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const data = await expenseApi.updateExpense(id, expenseData);
      setExpenses((prev) =>
        prev.map((item) => (String(item.id) === String(id) ? data.expense : item))
      );
      toast.success('Expense updated');
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Could not update the expense.'));
    }
  };

  // ---------- Delete / budget: no form to show an error in, so use a toast ----------

  const deleteExpense = async (id) => {
    try {
      await expenseApi.deleteExpense(id);
      setExpenses((prev) => prev.filter((item) => String(item.id) !== String(id)));
      toast.success('Expense deleted');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not delete the expense.'));
    }
  };

  // Returns true if saved, false if not (so the modal knows whether to close).
  const updateBudget = async (newLimit) => {
    const numericLimit = Number(newLimit);
    if (!Number.isFinite(numericLimit) || numericLimit <= 0) {
      toast.error('Enter a valid budget amount.');
      return false;
    }

    try {
      // Server first. Only change the screen after the server accepted it.
      await budgetApi.setBudget({ limit: numericLimit, month: selectedMonth });
      setBudgetLimit(numericLimit);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save the budget.'));
      return false;
    }
  };

  // ---------- Filtered Expenses ----------
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

  // ---------- Spending for each of the last 6 months, from real expenses ----------
  const monthlyHistory = useMemo(() => {
    const today = new Date();

    return Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(today, 5 - i);
      const key = format(monthDate, 'yyyy-MM');

      const spent = expenses
        .filter((e) => e.date && e.date.startsWith(key))
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      return {
        month: format(monthDate, 'MMM'),
        spent,
        budget: budgetLimit,
      };
    });
  }, [expenses, budgetLimit]);

  // ---------- Stats ----------
  const stats = useMemo(() => {
    const currentMonthExpenses = expenses.filter((e) =>
      selectedMonth ? e.date?.startsWith(selectedMonth) : true
    );
    const totalSpent = currentMonthExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const remainingBudget = budgetLimit - totalSpent;
    const percentageUsed =
      budgetLimit > 0 ? Math.min(Math.round((totalSpent / budgetLimit) * 100), 100) : 0;
    const isOverBudget = totalSpent > budgetLimit;

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