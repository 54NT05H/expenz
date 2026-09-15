import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Wallet, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.9rem 2rem',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: 'var(--shadow-xs)',
    }}>
      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
        }}>
          <Wallet size={20} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Expenz
            </h1>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent-primary)' }}>PRO</span>
          </div>
          <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Smart Budget & Expense Tracker</p>
        </div>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          padding: '0.35rem 0.85rem',
          background: '#f8fafc',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: 'var(--accent-gradient)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 800,
          }}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.name || user?.email || 'User'}
          </span>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          title="Logout"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
