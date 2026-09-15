import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'var(--accent-primary)', badge }) => {
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{title}</span>
        {Icon && (
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: `${color}14`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            border: `1px solid ${color}24`,
          }}>
            <Icon size={19} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          {value}
        </h2>
        {badge && (
          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', background: badge.bg, color: badge.color }}>
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
