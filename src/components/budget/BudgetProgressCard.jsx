import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/currencyFormatter';
import { SetBudgetModal } from './SetBudgetModal';
import { Target, AlertTriangle, CheckCircle2, Edit3 } from 'lucide-react';

export const BudgetProgressCard = () => {
  const { stats, updateBudget } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { totalSpent, budgetLimit, remainingBudget, percentageUsed, isOverBudget } = stats;

  const getProgressColor = () => {
    if (isOverBudget || percentageUsed >= 90) return '#ef4444';
    if (percentageUsed >= 70) return '#f59e0b';
    return '#10b981';
  };

  return (
    <>
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
              <Target size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Budget Tracker</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target allowance vs actual expenditure</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Edit3 size={14} />
            <span>Set Limit</span>
          </button>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.6rem' }}>
            <div>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {formatCurrency(totalSpent)}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginLeft: '0.45rem' }}>
                of {formatCurrency(budgetLimit)}
              </span>
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: getProgressColor() }}>
              {percentageUsed}%
            </span>
          </div>

          {/* Progress Bar Track */}
          <div style={{
            width: '100%',
            height: '10px',
            backgroundColor: '#f1f5f9',
            borderRadius: '9999px',
            overflow: 'hidden',
          }}>
            <div
              style={{
                width: `${Math.min(percentageUsed, 100)}%`,
                height: '100%',
                backgroundColor: getProgressColor(),
                borderRadius: '9999px',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {isOverBudget ? (
              <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                <AlertTriangle size={16} /> Over budget by {formatCurrency(Math.abs(remainingBudget))}
              </span>
            ) : (
              <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                <CheckCircle2 size={16} /> {formatCurrency(remainingBudget)} remaining allowance
              </span>
            )}
          </div>
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
            {stats.expenseCount} transactions logged
          </span>
        </div>
      </div>

      <SetBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentBudget={budgetLimit}
        onSave={updateBudget}
      />
    </>
  );
};
