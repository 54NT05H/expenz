import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { BudgetProgressCard } from '../components/budget/BudgetProgressCard';
import { SetBudgetModal } from '../components/budget/SetBudgetModal';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { formatCurrency } from '../utils/currencyFormatter';
import { Target, Sparkles, Edit3, Plus, Minus } from 'lucide-react';

export const BudgetPage = () => {
  const { stats, updateBudget, budgetLimit } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleQuickStep = (amount) => {
    const nextVal = Math.max(1000, (Number(budgetLimit) || 0) + amount);
    updateBudget(nextVal);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Budget Planner & Limits
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Set monthly spending caps and inspect real-time spending against your targets
          </p>
        </div>

        {/* Quick adjust action bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleQuickStep(-5000)}
            className="btn btn-secondary btn-sm"
            title="Quick Decrease Limit by ₹5,000"
          >
            <Minus size={14} /> ₹5k
          </button>
          <button
            onClick={() => handleQuickStep(5000)}
            className="btn btn-secondary btn-sm"
            title="Quick Increase Limit by ₹5,000"
          >
            <Plus size={14} /> ₹5k
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Edit3 size={14} />
            <span>Custom Limit</span>
          </button>
        </div>
      </div>

      {/* Main Budget Progress Card */}
      <BudgetProgressCard />

      {/* Category Breakdown & Allocation */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Category Spending vs Total Budget ({formatCurrency(budgetLimit)})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {EXPENSE_CATEGORIES.map((cat) => {
            const catSpent = stats.categoryData.find((c) => c.name === cat.label)?.value || 0;
            const percentageOfBudget = budgetLimit > 0 ? Math.round((catSpent / budgetLimit) * 100) : 0;

            return (
              <div
                key={cat.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.color }} />
                    {cat.label}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: cat.color }}>
                    {formatCurrency(catSpent)}
                  </span>
                </div>

                <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(percentageOfBudget, 100)}%`,
                      height: '100%',
                      backgroundColor: cat.color,
                      borderRadius: '9999px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{percentageOfBudget}% of current budget limit</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{formatCurrency(Math.max(0, budgetLimit - catSpent))} remaining</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Insights & Tips */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.06) 0%, rgba(6, 182, 212, 0.04) 100%)', border: '1px solid rgba(79, 70, 229, 0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', color: 'var(--accent-primary)' }}>
          <Sparkles size={20} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>50/30/20 Budgeting Rule</h4>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          For a monthly budget of <strong>{formatCurrency(budgetLimit)}</strong>, aim to spend no more than <strong>{formatCurrency(budgetLimit * 0.5)}</strong> on Needs, <strong>{formatCurrency(budgetLimit * 0.3)}</strong> on Wants, and save at least <strong>{formatCurrency(budgetLimit * 0.2)}</strong>.
        </p>
      </div>

      <SetBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentBudget={budgetLimit}
        onSave={updateBudget}
      />
    </div>
  );
};
