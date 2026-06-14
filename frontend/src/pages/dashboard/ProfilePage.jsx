import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../store/slices/authSlice';
import { userApi } from '../../services/api';
import { MdPerson, MdEmail, MdPhone, MdWork, MdSave, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FaBrain } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Dashboard.css';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfile = async (e) => {
    e.preventDefault();
    await dispatch(updateProfile({ id: user.id, data: form }));
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      await userApi.updatePassword(user.id, { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password update failed');
    }
    setPwLoading(false);
  };

  const ROLE_COLORS = { admin: '#E50914', teacher: '#3B82F6', counselor: '#22C55E' };
  const roleColor = ROLE_COLORS[user?.role] || '#9E9E9E';

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <div className="profile-layout">
        {/* Left: Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{
              width: 96, height: 96,
              background: `linear-gradient(135deg, ${roleColor}, ${roleColor}99)`,
              borderRadius: 24, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 40, fontWeight: 800,
              color: 'white', margin: '0 auto 16px',
              boxShadow: `0 8px 30px ${roleColor}40`
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{user?.name}</h2>
            <p style={{ color: '#9E9E9E', fontSize: 13, marginBottom: 12 }}>{user?.email}</p>
            <span style={{
              background: `${roleColor}20`, color: roleColor,
              border: `1px solid ${roleColor}40`,
              padding: '4px 14px', borderRadius: 20,
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1
            }}>
              {user?.role}
            </span>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Department', value: user?.department || 'Not set' },
                { label: 'Phone', value: user?.phone || 'Not set' },
                { label: 'Status', value: user?.isActive ? 'Active' : 'Inactive' },
                { label: 'Verified', value: user?.isVerified ? 'Yes' : 'No' },
                { label: 'Last Login', value: user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#616161' }}>{item.label}</span>
                  <span style={{ color: '#9E9E9E' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Brain Card */}
          <div className="card" style={{ background: 'rgba(229,9,20,0.06)', border: '1px solid rgba(229,9,20,0.2)', textAlign: 'center', padding: 24 }}>
            <FaBrain style={{ fontSize: 36, color: '#E50914', marginBottom: 12 }} />
            <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>EduGuard AI</h3>
            <p style={{ color: '#9E9E9E', fontSize: 13, lineHeight: 1.6 }}>
              AI-Based Student Dropout Prediction System v2.1.0
            </p>
          </div>
        </div>

        {/* Right: Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
            {[['profile', 'Profile Info'], ['password', 'Change Password']].map(([t, l]) => (
              <button key={t} onClick={() => setActiveTab(t)} className={activeTab === t ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: 13 }}>
                {l}
              </button>
            ))}
          </div>

          {activeTab === 'profile' && (
            <div className="card">
              <div className="section-title">Personal Information</div>
              <form onSubmit={handleProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper" style={{ position: 'relative' }}>
                    <MdPerson style={{ position: 'absolute', left: 14, color: '#616161', fontSize: 20, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input className="form-input" style={{ paddingLeft: 44 }} type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Address (read-only)</label>
                  <div style={{ position: 'relative' }}>
                    <MdEmail style={{ position: 'absolute', left: 14, color: '#424242', fontSize: 20, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input className="form-input" style={{ paddingLeft: 44, opacity: 0.5, cursor: 'not-allowed' }} type="email" value={user?.email || ''} disabled />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <MdPhone style={{ position: 'absolute', left: 14, color: '#616161', fontSize: 20, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input className="form-input" style={{ paddingLeft: 44 }} type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Department</label>
                    <div style={{ position: 'relative' }}>
                      <MdWork style={{ position: 'absolute', left: 14, color: '#616161', fontSize: 20, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input className="form-input" style={{ paddingLeft: 44 }} type="text" placeholder="Computer Science" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? <span className="btn-spinner" /> : <MdSave />}
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="card">
              <div className="section-title">Change Password</div>
              <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Current Password', key: 'currentPassword', placeholder: 'Enter current password' },
                  { label: 'New Password', key: 'newPassword', placeholder: 'Min. 8 characters' },
                  { label: 'Confirm New Password', key: 'confirmPassword', placeholder: 'Re-enter new password' },
                ].map((f) => (
                  <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{f.label}</label>
                    <div style={{ position: 'relative' }}>
                      <MdLock style={{ position: 'absolute', left: 14, color: '#616161', fontSize: 20, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input
                        className="form-input" style={{ paddingLeft: 44, paddingRight: 44 }}
                        type={showPw ? 'text' : 'password'}
                        placeholder={f.placeholder}
                        value={pwForm[f.key]}
                        onChange={(e) => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                        required
                      />
                      {f.key === 'newPassword' && (
                        <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#616161', cursor: 'pointer', fontSize: 20, display: 'flex' }}>
                          {showPw ? <MdVisibilityOff /> : <MdVisibility />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 10, fontSize: 13 }}>
                  <p style={{ color: '#9E9E9E', marginBottom: 6, fontWeight: 600 }}>Password requirements:</p>
                  {[
                    { ok: pwForm.newPassword.length >= 8, text: 'At least 8 characters' },
                    { ok: /[A-Z]/.test(pwForm.newPassword), text: 'One uppercase letter' },
                    { ok: /[a-z]/.test(pwForm.newPassword), text: 'One lowercase letter' },
                    { ok: /\d/.test(pwForm.newPassword), text: 'One number' },
                  ].map((r, i) => (
                    <div key={i} style={{ color: r.ok ? '#22C55E' : '#424242', display: 'flex', gap: 8, marginBottom: 4 }}>
                      {r.ok ? '✓' : '○'} {r.text}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn-primary" disabled={pwLoading}>
                    {pwLoading ? <span className="btn-spinner" /> : <MdLock />}
                    {pwLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Activity */}
          <div className="card">
            <div className="section-title">Account Activity</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { label: 'Account Created', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' },
                { label: 'Last Login', value: user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A' },
                { label: 'Account Status', value: user?.isActive ? '✅ Active' : '❌ Inactive' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#616161', marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: 'white', fontWeight: 600 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
