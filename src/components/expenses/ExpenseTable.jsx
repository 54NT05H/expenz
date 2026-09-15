import React from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { CategoryBadge } from './CategoryBadge';
import { formatCurrency } from '../../utils/currencyFormatter';
import { formatDate } from '../../utils/dateHelper';
import { Trash2, Receipt } from 'lucide-react';

export const ExpenseTable = () => {
  const { expenses, deleteExpense, loading } = useExpenses();

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading expenses...
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: 'var(--text-muted)' }}>
          <Receipt size={24} />
        </div>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          No expenses found
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Try changing your filters or add a new expense to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>Title & Notes</th>
              <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '1rem 1.25rem', fontWeight: 600, textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '1rem 1.25rem', fontWeight: 600, textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => {
              const expId = exp.id || exp._id;
              return (
                <tr
                  key={expId}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8faff')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{exp.title}</div>
                    {exp.notes && (
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {exp.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <CategoryBadge category={exp.category} />
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                    {formatDate(exp.date)}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 700, color: '#e11d48' }}>
                    - {formatCurrency(exp.amount)}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                    <button
                      onClick={() => deleteExpense(expId)}
                      className="btn btn-danger btn-sm"
                      title="Delete Expense"
                      style={{ padding: '0.4rem 0.5rem', borderRadius: '6px' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
