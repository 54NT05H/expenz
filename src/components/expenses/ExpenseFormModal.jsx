import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { getCurrentISODate } from '../../utils/dateHelper';

const createEmptyFormData = () => ({
  title: '',
  amount: '',
  category: EXPENSE_CATEGORIES[0].label,
  date: getCurrentISODate(),
  notes: '',
});

export const ExpenseFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isEditMode = false }) => {
  const [formData, setFormData] = useState(createEmptyFormData());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && initialData) {
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount ?? '',
        category: initialData.category || EXPENSE_CATEGORIES[0].label,
        date: initialData.date || getCurrentISODate(),
        notes: initialData.notes || '',
      });
      return;
    }

    setFormData(createEmptyFormData());
  }, [isOpen, isEditMode, initialData]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please enter an expense title.');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSubmit({
        ...formData,
        amount: Number(formData.amount),
      });
      setFormData(createEmptyFormData());
      onClose();
    } catch (err) {
      setError('Failed to save expense. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Expense' : 'Add New Expense'}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Expense Title *</label>
          <input
            type="text"
            name="title"
            required
            className="form-input"
            placeholder="e.g., Grocery shopping, Metro pass"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Amount (₹) *</label>
            <input
              type="number"
              name="amount"
              min="1"
              step="any"
              required
              className="form-input"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date *</label>
            <input
              type="date"
              name="date"
              required
              className="form-input"
              value={formData.date}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Category *</label>
          <select
            name="category"
            className="form-select"
            value={formData.category}
            onChange={handleChange}
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.label}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Notes (Optional)</label>
          <textarea
            name="notes"
            rows="2"
            className="form-input"
            placeholder="Add any extra notes..."
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? 'Saving...' : isEditMode ? 'Update Expense' : 'Add Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
