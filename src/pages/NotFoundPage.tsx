import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ backgroundColor: 'var(--color-bg-warm)', minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '48px', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-primary-green-surface)', color: 'var(--color-primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
          <Sprout size={32} />
        </div>
        <h1 style={{ fontSize: '3rem', color: 'var(--color-primary-green-dark)', marginBottom: '8px' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '28px' }}>
          The page you are looking for does not exist or has been relocated.
        </p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex' }}>
          <ArrowLeft size={16} />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
};
