import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../store/slices/authSlice';
import { FaBrain } from 'react-icons/fa';
import { MdEmail, MdLock, MdPerson, MdWork, MdVisibility, MdVisibilityOff, MdArrowForward, MdCheckCircle } from 'react-icons/md';
import './AuthPage.css';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'teacher', department: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/.test(form.password)) e.password = 'Must include uppercase, lowercase & number';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const { confirmPassword, ...payload } = form;
    const result = await dispatch(register(payload));
    if (!result.error) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-bg"><div className="auth-glow" /></div>
        <div className="auth-container">
          <div className="success-card">
            <MdCheckCircle className="success-icon" />
            <h2>Registration Successful!</h2>
            <p>Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

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
            <h1>Create Account</h1>
            <p>Join EduGuard AI to prevent student dropout</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <MdPerson className="input-icon" />
                  <input className={`form-input with-icon ${errors.name ? 'error' : ''}`} type="text" placeholder="Dr. John Smith" value={form.name} onChange={set('name')} required />
                </div>
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={form.role} onChange={set('role')}>
                  <option value="teacher">Teacher</option>
                  <option value="counselor">Counselor</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <MdEmail className="input-icon" />
                <input className={`form-input with-icon ${errors.email ? 'error' : ''}`} type="email" placeholder="you@institution.edu" value={form.email} onChange={set('email')} required />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Department (Optional)</label>
              <div className="input-wrapper">
                <MdWork className="input-icon" />
                <input className="form-input with-icon" type="text" placeholder="Computer Science" value={form.department} onChange={set('department')} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <MdLock className="input-icon" />
                  <input className={`form-input with-icon ${errors.password ? 'error' : ''}`} type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <MdLock className="input-icon" />
                  <input className={`form-input with-icon ${errors.confirmPassword ? 'error' : ''}`} type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
                </div>
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="password-hints">
              {[
                { ok: form.password.length >= 8, text: '8+ characters' },
                { ok: /[A-Z]/.test(form.password), text: 'Uppercase letter' },
                { ok: /[a-z]/.test(form.password), text: 'Lowercase letter' },
                { ok: /\d/.test(form.password), text: 'Number' },
              ].map((h, i) => (
                <span key={i} className={`hint ${h.ok ? 'ok' : ''}`}>
                  {h.ok ? '✓' : '○'} {h.text}
                </span>
              ))}
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : null}
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <MdArrowForward />}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
