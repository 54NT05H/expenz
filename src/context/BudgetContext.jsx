import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { budgetApi } from '../api/budgetApi';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getErrorMessage } from '../utils/errorHelper';
import { DEFAULT_BUDGET } from '../utils/constants';

const BudgetContext = createContext(null);

export const BudgetProvider = ({ children }) => {
  const { user } = useAuth();
  const toast = useToast();
  const userId = user?.id;

  const [budgetLimit, setBudgetLimit] = useState(DEFAULT_BUDGET);

  // Load this user's budget from the server whenever the logged-in user changes.
  useEffect(() => {
    setBudgetLimit(DEFAULT_BUDGET);
    if (!userId) return;

    let cancelled = false;
    budgetApi
      .getBudget()
      .then((data) => {
        const limit = Number(data?.limit);
        if (!cancelled && limit > 0) setBudgetLimit(limit);
      })
      .catch(() => {
        // A 401 is handled by the axios interceptor. Otherwise keep the default.
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Returns true if saved, false if not (so the modal knows whether to close).
  const updateBudget = useCallback(
    async (newLimit) => {
      const numericLimit = Number(newLimit);
      if (!Number.isFinite(numericLimit) || numericLimit <= 0) {
        toast.error('Enter a valid budget amount.');
        return false;
      }

      try {
        await budgetApi.setBudget({ limit: numericLimit });
        setBudgetLimit(numericLimit); // only after the server accepted it
        return true;
      } catch (error) {
        toast.error(getErrorMessage(error, 'Could not save the budget.'));
        return false;
      }
    },
    [toast]
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