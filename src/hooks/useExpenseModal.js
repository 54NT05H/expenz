import { useState, useCallback } from 'react';
import { useExpenses } from '../context/ExpenseContext';

// Everything a page needs to open the Add/Edit expense popup.
export const useExpenseModal = () => {
  const { addExpense, updateExpense } = useExpenses();
  const [isOpen, setIsOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const openAdd = useCallback(() => {
    setEditingExpense(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((expense) => {
    setEditingExpense(expense);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingExpense(null);
  }, []);

  // Add or update depending on whether we're editing something.
  const submit = useCallback(
    async (payload) => {
      if (editingExpense) {
        await updateExpense(editingExpense.id ?? editingExpense._id, payload);
      } else {
        await addExpense(payload);
      }
    },
    [editingExpense, addExpense, updateExpense]
  );

  return {
    openAdd,
    openEdit,
    // Spread these onto <ExpenseFormModal {...modalProps} />
    modalProps: {
      isOpen,
      onClose: close,
      onSubmit: submit,
      initialData: editingExpense,
      isEditMode: Boolean(editingExpense),
    },
  };
};