import React, { useState } from 'react';
import { MdSecurity, MdNotifications, MdStorage, MdInfo, MdCheckCircle } from 'react-icons/md';
import { FaBrain } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Dashboard.css';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    emailAlerts: true,
    highRiskAlerts: true,
    weeklyReports: false,
    autoPredict: true,
    rateLimit: 100,
    sessionTimeout: 7,
    maintenanceMode: false,
  });

  const save = (key, value) => {
    setSettings({ ...settings, [key]: value });
    toast.success('Setting updated');
  };

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 26, borderRadius: 13,
        background: value ? '#E50914' : 'rgba(255,255,255,0.1)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.3s', flexShrink: 0
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%', background: 'white',
        position: 'absolute', top: 3,
        left: value ? 25 : 3,
        transition: 'left 0.3s',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
      }} />
    </button>
  );

  const Section = ({ title, icon, children }) => (
    <div className="card" style={{ marginBottom: 0 }}>
      <div className="section-title" style={{ marginBottom: 20 }}>
        {icon} {title}
      </div>
      {children}
    </div>
  );

  const SettingRow = ({ label, desc, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: 20 }}>
      <div>
        <div style={{ color: 'white', fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{label}</div>
        {desc && <div style={{ color: '#616161', fontSize: 12 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure EduGuard AI platform settings</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Notifications */}
        <Section title="Notification Settings" icon={<MdNotifications />}>
          <SettingRow label="Email Alerts" desc="Send email notifications to counselors">
            <Toggle value={settings.emailAlerts} onChange={(v) => save('emailAlerts', v)} />
          </SettingRow>
          <SettingRow label="High Risk Alerts" desc="Instant alerts when a student becomes high risk">
            <Toggle value={settings.highRiskAlerts} onChange={(v) => save('highRiskAlerts', v)} />
          </SettingRow>
          <SettingRow label="Weekly Reports" desc="Automated weekly performance reports via email">
            <Toggle value={settings.weeklyReports} onChange={(v) => save('weeklyReports', v)} />
          </SettingRow>
        </Section>

        {/* AI Settings */}
        <Section title="AI & Prediction" icon={<FaBrain />}>
          <SettingRow label="Auto-Predict on Add" desc="Run prediction automatically when student is added">
            <Toggle value={settings.autoPredict} onChange={(v) => save('autoPredict', v)} />
          </SettingRow>
          <SettingRow label="ML Model Version" desc="Current active prediction model">
            <span style={{ color: '#22C55E', fontSize: 13, fontWeight: 600, background: 'rgba(34,197,94,0.1)', padding: '4px 10px', borderRadius: 6 }}>
              v2.1.0 ✓
            </span>
          </SettingRow>
          <SettingRow label="Prediction Threshold" desc="Minimum confidence for risk classification">
            <span style={{ color: '#9E9E9E', fontSize: 13 }}>75%</span>
          </SettingRow>
        </Section>

        {/* Security */}
        <Section title="Security" icon={<MdSecurity />}>
          <SettingRow label="JWT Expiry" desc="Access token expiration period">
            <select
              className="filter-select"
              value={settings.sessionTimeout}
              onChange={(e) => save('sessionTimeout', Number(e.target.value))}
              style={{ width: 120 }}
            >
              <option value={1}>1 day</option>
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
            </select>
          </SettingRow>
          <SettingRow label="Rate Limiting" desc="Max API requests per 15 minutes per IP">
            <select
              className="filter-select"
              value={settings.rateLimit}
              onChange={(e) => save('rateLimit', Number(e.target.value))}
              style={{ width: 120 }}
            >
              <option value={50}>50 req</option>
              <option value={100}>100 req</option>
              <option value={200}>200 req</option>
            </select>
          </SettingRow>
          <SettingRow label="Password Policy" desc="Minimum requirements enforced">
            <span style={{ color: '#22C55E', fontSize: 12, fontWeight: 600 }}>
              <MdCheckCircle style={{ marginRight: 4 }} />8+ chars, Upper+Lower+Number
            </span>
          </SettingRow>
        </Section>

        {/* System */}
        <Section title="System" icon={<MdStorage />}>
          <SettingRow label="Database" desc="PostgreSQL connection status">
            <span style={{ color: '#22C55E', fontSize: 13, fontWeight: 600 }}>● Connected</span>
          </SettingRow>
          <SettingRow label="API Server" desc="Backend Node.js server status">
            <span style={{ color: '#22C55E', fontSize: 13, fontWeight: 600 }}>● Running</span>
          </SettingRow>
          <SettingRow label="Maintenance Mode" desc="Disable access for regular users">
            <Toggle value={settings.maintenanceMode} onChange={(v) => save('maintenanceMode', v)} />
          </SettingRow>
        </Section>
      </div>

      {/* System Info */}
      <div className="card" style={{ marginTop: 4 }}>
        <div className="section-title"><MdInfo /> System Information</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Platform', value: 'EduGuard AI v1.0.0' },
            { label: 'Backend', value: 'Node.js + Express' },
            { label: 'Database', value: 'PostgreSQL + Sequelize' },
            { label: 'AI Engine', value: 'Random Forest v2.1.0' },
            { label: 'Frontend', value: 'React.js + Redux' },
            { label: 'Auth', value: 'JWT + bcrypt' },
            { label: 'Storage', value: 'Local + PostgreSQL' },
            { label: 'Environment', value: process.env.NODE_ENV || 'development' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, color: '#424242', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13, color: '#9E9E9E', fontWeight: 500 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
