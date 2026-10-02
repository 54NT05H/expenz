import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { expenseApi } from '../api/expenseApi';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getErrorMessage } from '../utils/errorHelper';

const ExpenseContext = createContext(null);

export const ExpenseProvider = ({ children }) => {
  const { user } = useAuth();
  const toast = useToast();
  const userId = user?.id;

  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await expenseApi.getAllExpenses();
      setAllExpenses(Array.isArray(data) ? data : []);
    } catch (error) {
      // A 401 means "session expired": the axios interceptor already logs the
      // user out, so a red toast on top of that would just be noise.
      if (error.response?.status !== 401) {
        toast.error(getErrorMessage(error, 'Could not load your expenses.'));
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // One-time cleanup: delete the old browser caches from earlier versions.
  useEffect(() => {
    Object.keys(localStorage)
      .filter(
        (key) =>
          key.startsWith('expenz_expenses_') || ['fintrack_expenses', 'fintrack_budget', 'fintrack_user'].includes(key)
      )
      .forEach((key) => localStorage.removeItem(key));
  }, []);

  // Runs when the logged-in user changes: clear the list, then load the new user's.
  useEffect(() => {
    setAllExpenses([]);
    if (userId) loadExpenses();
  }, [userId, loadExpenses]);

  // Add/edit THROW on failure so the form can show the error inline.
  const addExpense = useCallback(
    async (expenseData) => {
      try {
        const data = await expenseApi.addExpense(expenseData);
        setAllExpenses((prev) => [data.expense, ...prev]);
        toast.success('Expense added');
      } catch (error) {
        throw new Error(getErrorMessage(error, 'Could not save the expense.'));
      }
    },
    [toast]
  );

  const updateExpense = useCallback(
    async (id, expenseData) => {
      try {
        const data = await expenseApi.updateExpense(id, expenseData);
        setAllExpenses((prev) => prev.map((item) => (String(item.id) === String(id) ? data.expense : item)));
        toast.success('Expense updated');
      } catch (error) {
        throw new Error(getErrorMessage(error, 'Could not update the expense.'));
      }
    },
    [toast]
  );

  // Delete has no form to show an error in, so it uses a toast.
  const deleteExpense = useCallback(
    async (id) => {
      try {
        await expenseApi.deleteExpense(id);
        setAllExpenses((prev) => prev.filter((item) => String(item.id) !== String(id)));
        toast.success('Expense deleted');
      } catch (error) {
        toast.error(getErrorMessage(error, 'Could not delete the expense.'));
      }
    },
    [toast]
  );

  const value = useMemo(
    () => ({ allExpenses, loading, loadExpenses, addExpense, updateExpense, deleteExpense }),
    [allExpenses, loading, loadExpenses, addExpense, updateExpense, deleteExpense]
  );

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
