import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { budgetApi } from '../api/budgetApi';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useFilters } from './FilterContext';
import { getErrorMessage } from '../utils/errorHelper';
import { DEFAULT_BUDGET } from '../utils/constants';

const BudgetContext = createContext(null);

// The budget is still kept in localStorage (per user) because the app
// doesn't load it from the server yet.
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

export const BudgetProvider = ({ children }) => {
  const { user } = useAuth();
  const toast = useToast();
  const { selectedMonth } = useFilters();
  const userId = user?.id;

  const [budgetLimit, setBudgetLimit] = useState(DEFAULT_BUDGET);
  // Whose budget is on screen? Stops us saving user A's budget under user B's key.
  const [dataOwner, setDataOwner] = useState(null);

  // Runs when the logged-in user changes.
  useEffect(() => {
    if (!userId) {
      setBudgetLimit(DEFAULT_BUDGET);
      setDataOwner(null);
      return;
    }
    setBudgetLimit(readBudget(userId));
    setDataOwner(userId);
  }, [userId]);

  // Save under THIS user's key, only if the budget on screen really belongs to them.
  useEffect(() => {
    if (!userId || dataOwner !== userId) return;
    localStorage.setItem(budgetKey(userId), JSON.stringify(budgetLimit));
  }, [budgetLimit, userId, dataOwner]);

  // Returns true if saved, false if not (so the modal knows whether to close).
  const updateBudget = useCallback(
    async (newLimit) => {
      const numericLimit = Number(newLimit);
      if (!Number.isFinite(numericLimit) || numericLimit <= 0) {
        toast.error('Enter a valid budget amount.');
        return false;
      }

      try {
        await budgetApi.setBudget({ limit: numericLimit, month: selectedMonth });
        setBudgetLimit(numericLimit);
        return true;
      } catch (error) {
        toast.error(getErrorMessage(error, 'Could not save the budget.'));
        return false;
      }
    },
    [selectedMonth, toast]
  );

  const value = useMemo(() => ({ budgetLimit, updateBudget }), [budgetLimit, updateBudget]);

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
