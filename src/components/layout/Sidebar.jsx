import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Target, ShieldCheck } from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/expenses', label: 'Expenses', icon: ReceiptText },
    { to: '/budget', label: 'Budget Planner', icon: Target },
  ];

  return (
    <aside style={{
      width: '240px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
    }}>
      <div style={{ padding: '0 0.75rem 0.85rem 0.75rem', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
        Navigation
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.7rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.885rem',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
              border: isActive ? '1px solid rgba(79, 70, 229, 0.15)' : '1px solid transparent',
              transition: 'all 0.15s ease',
            })}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}

      <div style={{ marginTop: 'auto', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', color: 'var(--accent-primary)' }}>
          <ShieldCheck size={16} />
          <span style={{ fontSize: '0.775rem', fontWeight: 700 }}>Secure JWT Auth</span>
        </div>
        <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          HTTP-only cookies with Bcrypt password security.
        </p>
      </div>
    </aside>
  );
};
