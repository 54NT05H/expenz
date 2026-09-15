import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { CATEGORY_COLOR_MAP } from '../../utils/constants';
import { formatCurrency } from '../../utils/currencyFormatter';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        padding: '0.65rem 0.9rem',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
          {data.name}
        </p>
        <p style={{ fontSize: '0.875rem', color: data.payload.fill, fontWeight: 700 }}>
          {formatCurrency(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

export const CategoryPieChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No expense data to display for this period.
      </div>
    );
  }

  const defaultColors = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#64748b'];

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={108}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => {
              const fillColor = CATEGORY_COLOR_MAP[entry.name] || defaultColors[index % defaultColors.length];
              return <Cell key={`cell-${index}`} fill={fillColor} stroke="#ffffff" strokeWidth={3} />;
            })}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
