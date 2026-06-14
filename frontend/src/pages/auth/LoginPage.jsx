import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { FaBrain } from 'react-icons/fa';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowForward } from 'react-icons/md';
import './AuthPage.css';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (!result.error) navigate('/dashboard');
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@eduguard.ai', password: 'Admin@123' },
      teacher: { email: 'teacher@eduguard.ai', password: 'Teacher@123' },
      counselor: { email: 'counselor@eduguard.ai', password: 'Counselor@123' },
    };
    setForm(creds[role]);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-grid" />
        <div className="auth-glow" />
      </div>

      <div className="auth-container">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon"><FaBrain /></div>
          <div>
            <span className="auth-logo-name">EduGuard AI</span>
            <span className="auth-logo-sub">Student Dropout Prevention</span>
          </div>
        </Link>

        <div className="auth-card">
          <div className="auth-card-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your EduGuard AI account</p>
          </div>

          {/* Demo credentials */}
          <div className="demo-creds">
            <span>Demo accounts:</span>
            <div className="demo-btns">
              {['admin', 'teacher', 'counselor'].map(role => (
                <button key={role} type="button" className="demo-btn" onClick={() => fillDemo(role)}>
                  {role}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <MdEmail className="input-icon" />
                <input
                  className="form-input with-icon"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Password
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </label>
              <div className="input-wrapper">
                <MdLock className="input-icon" />
                <input
                  className="form-input with-icon"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <MdArrowForward />}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/register" className="auth-link">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
