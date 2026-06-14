import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaBrain } from 'react-icons/fa';
import { MdLock, MdArrowForward, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './AuthPage.css';

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed');
    }
    setLoading(false);
  };

  if (!token) return <div className="auth-page"><div className="auth-container"><div className="auth-card" style={{textAlign:'center',padding:'40px'}}><p style={{color:'#E50914'}}>Invalid reset link</p><Link to="/forgot-password" className="auth-link">Request new link</Link></div></div></div>;

  return (
    <div className="auth-page">
      <div className="auth-bg"><div className="auth-grid" /><div className="auth-glow" /></div>
      <div className="auth-container">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon"><FaBrain /></div>
          <div><span className="auth-logo-name">EduGuard AI</span><span className="auth-logo-sub">Student Dropout Prevention</span></div>
        </Link>
        <div className="auth-card">
          <div className="auth-card-header"><h1>Reset Password</h1><p>Enter your new password</p></div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-wrapper">
                <MdLock className="input-icon" />
                <input className="form-input with-icon" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <MdLock className="input-icon" />
                <input className="form-input with-icon" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : null}
              {loading ? 'Resetting...' : 'Reset Password'} {!loading && <MdArrowForward />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
