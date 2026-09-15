import React from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { Search, Filter, Calendar } from 'lucide-react';

export const ExpenseFilters = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedMonth,
    setSelectedMonth,
  } = useExpenses();

  return (
    <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search expense by title or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div style={{ position: 'relative' }}>
          <Filter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <select
            className="form-select"
            style={{ paddingLeft: '2.5rem' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.label}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Month Selector */}
        <div style={{ position: 'relative' }}>
          <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="month"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
