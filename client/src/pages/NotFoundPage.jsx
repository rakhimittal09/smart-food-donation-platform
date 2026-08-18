import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Home, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        background: 'var(--bg-main)',
      }}
    >
      <div style={{ maxWidth: '480px' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--primary-50)',
            color: 'var(--primary-600)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <UtensilsCrossed size={40} />
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0 1rem 0' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          The meal or page you are looking for might have been distributed, moved, or is temporarily unavailable.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <Home size={18} /> Return Home
          </Link>
          <Link to="/donations" className="btn btn-secondary" style={{ gap: '0.5rem' }}>
            <Search size={18} /> Explore Food
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
