import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBrain } from 'react-icons/fa';
import { MdEmail, MdArrowForward, MdCheckCircle, MdArrowBack } from 'react-icons/md';
import api from '../../services/api';
import './AuthPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg"><div className="auth-grid" /><div className="auth-glow" /></div>
      <div className="auth-container">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon"><FaBrain /></div>
          <div>
            <span className="auth-logo-name">EduGuard AI</span>
            <span className="auth-logo-sub">Student Dropout Prevention</span>
          </div>
        </Link>
        <div className="auth-card">
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <MdCheckCircle style={{ fontSize: 64, color: '#22C55E', marginBottom: 16 }} />
              <h2 style={{ color: 'white', marginBottom: 12 }}>Check Your Email</h2>
              <p style={{ color: '#9E9E9E', marginBottom: 24 }}>If an account exists for <strong>{email}</strong>, we've sent password reset instructions.</p>
              <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', gap: 8 }}>
                <MdArrowBack /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="auth-card-header">
                <h1>Forgot Password</h1>
                <p>Enter your email and we'll send you a reset link</p>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <MdEmail className="input-icon" />
                    <input className="form-input with-icon" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                  {loading ? <span className="btn-spinner" /> : null}
                  {loading ? 'Sending...' : 'Send Reset Link'} {!loading && <MdArrowForward />}
                </button>
              </form>
              <p className="auth-footer-text">
                <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <MdArrowBack /> Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
