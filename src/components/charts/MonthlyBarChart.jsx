import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { formatCurrency, formatCompactNumber } from '../../utils/currencyFormatter';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: entry.color, marginBottom: '0.2rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
            <span style={{ fontWeight: 700 }}>{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const MonthlyBarChart = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { month: 'Apr', spent: 38000, budget: 50000 },
    { month: 'May', spent: 44000, budget: 50000 },
    { month: 'Jun', spent: 51200, budget: 50000 },
    { month: 'Jul', spent: 42000, budget: 50000 },
    { month: 'Aug', spent: 48500, budget: 50000 },
    { month: 'Sep', spent: 38799, budget: 50000 },
  ];

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={(val) => `₹${formatCompactNumber(val)}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>{value}</span>}
          />
          <Bar dataKey="spent" name="Spent" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={32} />
          <Bar dataKey="budget" name="Budget Limit" fill="#e2e8f0" radius={[6, 6, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
