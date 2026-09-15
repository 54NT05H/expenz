import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Plus, Minus, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyFormatter';

export const SetBudgetModal = ({ isOpen, onClose, currentBudget, onSave }) => {
  const [budget, setBudget] = useState(currentBudget || 50000);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBudget(currentBudget || 50000);
    }
  }, [isOpen, currentBudget]);

  const adjustBudget = (delta) => {
    setBudget((prev) => Math.max(1000, (Number(prev) || 0) + delta));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = Number(budget);
    if (!num || num <= 0) return;
    try {
      setSubmitting(true);
      await onSave(num);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Monthly Budget Limit">
      <form onSubmit={handleSubmit}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Define your target spending limit. All graphs, analytics, and progress bars will update in real-time.
        </p>

        <div className="form-group">
          <label className="form-label">Monthly Limit Amount (₹) *</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => adjustBudget(-5000)}
              className="btn btn-secondary"
              title="Decrease by ₹5,000"
              style={{ padding: '0.7rem' }}
            >
              <Minus size={18} />
            </button>

            <input
              type="number"
              min="1000"
              step="500"
              required
              className="form-input"
              style={{ fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', color: 'var(--accent-primary)' }}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              placeholder="e.g. 50000"
            />

            <button
              type="button"
              onClick={() => adjustBudget(5000)}
              className="btn btn-secondary"
              title="Increase by ₹5,000"
              style={{ padding: '0.7rem' }}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem', marginBottom: '1rem' }}>
          {[25000, 40000, 50000, 75000, 100000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setBudget(preset)}
              style={{
                background: budget === preset ? 'rgba(79, 70, 229, 0.12)' : '#f8fafc',
                border: `1px solid ${budget === preset ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                color: budget === preset ? 'var(--accent-primary)' : 'var(--text-secondary)',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {formatCurrency(preset)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Check size={16} />
            {submitting ? 'Updating...' : 'Save & Update'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
