import React from 'react';

const colors = {
  High:   { bg: 'rgba(229,9,20,0.15)',   text: '#FF4444', border: 'rgba(229,9,20,0.3)' },
  Medium: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
  Low:    { bg: 'rgba(34,197,94,0.15)',  text: '#22C55E', border: 'rgba(34,197,94,0.3)' },
};

const RiskBadge = ({ level, size = 'sm' }) => {
  const c = colors[level] || colors.Low;
  const pad = size === 'lg' ? '6px 16px' : '3px 10px';
  const fs  = size === 'lg' ? '13px' : '11px';
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      padding: pad, borderRadius: 20, fontSize: fs,
      fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
      display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.text, display: 'inline-block' }} />
      {level || 'Unknown'}
    </span>
  );
};

export default RiskBadge;
