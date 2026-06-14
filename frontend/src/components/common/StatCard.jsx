import React from 'react';
import CountUp from 'react-countup';

const StatCard = ({ title, value, icon, color = '#E50914', suffix = '', prefix = '' }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: `1px solid rgba(255,255,255,0.06)`,
    borderRadius: 16, padding: 20,
    display: 'flex', alignItems: 'center', gap: 16,
    transition: 'all 0.3s',
  }}
    onMouseEnter={e => e.currentTarget.style.borderColor = `${color}40`}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
  >
    <div style={{
      width: 48, height: 48, borderRadius: 12, flexShrink: 0,
      background: `${color}20`, color, display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontSize: 22,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 800, color: 'white', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
        {prefix}<CountUp end={typeof value === 'number' ? value : 0} duration={1.5} separator="," />{suffix}
      </div>
      <div style={{ fontSize: 13, color: '#9E9E9E', marginTop: 4 }}>{title}</div>
    </div>
  </div>
);

export default StatCard;
