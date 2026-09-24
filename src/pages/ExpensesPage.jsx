import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { ExpenseFilters } from '../components/expenses/ExpenseFilters';
import { ExpenseTable } from '../components/expenses/ExpenseTable';
import { ExpenseFormModal } from '../components/expenses/ExpenseFormModal';
import { formatCurrency } from '../utils/currencyFormatter';
import { PlusCircle, Receipt, Download } from 'lucide-react';

export const ExpensesPage = () => {
  const { expenses, addExpense, updateExpense } = useExpenses();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingExpense(null);
  };

  const handleAddExpense = async (payload) => {
    await addExpense(payload);
  };

  const handleUpdateExpense = async (payload) => {
    if (!editingExpense) return;
    const id = editingExpense.id || editingExpense._id;
    await updateExpense(id, payload);
  };

  // Quick export CSV helper
  const exportCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['Title', 'Category', 'Date', 'Amount', 'Notes'];
    const rows = expenses.map((e) => [
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${e.date}"`,
      e.amount,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fintrack_expenses_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Expenses Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            View, search, categorize, and manage all your expense records
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={exportCSV} className="btn btn-secondary" title="Export as CSV">
            <Download size={16} />
            <span className="hide-mobile">Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingExpense(null);
              setIsAddModalOpen(true);
            }}
            className="btn btn-gradient"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <PlusCircle size={18} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <ExpenseFilters />

      {/* Table */}
      <ExpenseTable onEditExpense={(expense) => {
        setEditingExpense(expense);
        setIsAddModalOpen(true);
      }} />

      <ExpenseFormModal
        isOpen={isAddModalOpen}
        onClose={closeModal}
        onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
        initialData={editingExpense}
        isEditMode={Boolean(editingExpense)}
      />
    </div>
  );
};
