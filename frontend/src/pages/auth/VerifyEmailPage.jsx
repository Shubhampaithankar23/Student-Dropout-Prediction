import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaBrain } from 'react-icons/fa';
import { MdCheckCircle, MdError } from 'react-icons/md';
import api from '../../services/api';
import './AuthPage.css';

const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const token = params.get('token');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-bg"><div className="auth-glow" /></div>
      <div className="auth-container">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon"><FaBrain /></div>
          <div><span className="auth-logo-name">EduGuard AI</span></div>
        </Link>
        <div className="auth-card" style={{ textAlign: 'center', padding: '48px 36px' }}>
          {status === 'loading' && <><div className="spinner" style={{ margin: '0 auto 20px' }} /><p style={{ color: '#9E9E9E' }}>Verifying your email...</p></>}
          {status === 'success' && <>
            <MdCheckCircle style={{ fontSize: 64, color: '#22C55E', marginBottom: 16 }} />
            <h2 style={{ color: 'white', marginBottom: 12 }}>Email Verified!</h2>
            <p style={{ color: '#9E9E9E', marginBottom: 24 }}>Your account is now active. You can sign in.</p>
            <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', gap: 8, justifyContent: 'center' }}>Go to Login</Link>
          </>}
          {status === 'error' && <>
            <MdError style={{ fontSize: 64, color: '#E50914', marginBottom: 16 }} />
            <h2 style={{ color: 'white', marginBottom: 12 }}>Verification Failed</h2>
            <p style={{ color: '#9E9E9E', marginBottom: 24 }}>The link is invalid or expired.</p>
            <Link to="/login" className="auth-link">Back to Login</Link>
          </>}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
