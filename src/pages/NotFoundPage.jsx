import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '5rem', fontWeight: 900, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '1rem 0 0.5rem', color: 'var(--text-primary)' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '1.5rem' }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <Home size={18} />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
