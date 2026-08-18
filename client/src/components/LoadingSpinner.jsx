import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullPage = false, size = 36, text = 'Loading data...' }) => {
  if (fullPage) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          color: 'var(--primary-600)',
        }}
      >
        <Loader2 size={size} className="animate-pulse" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>{text}</span>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.5rem', color: 'var(--primary-600)' }}>
      <Loader2 size={size} style={{ animation: 'spin 1s linear infinite' }} />
      {text && <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>{text}</span>}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoadingSpinner;
