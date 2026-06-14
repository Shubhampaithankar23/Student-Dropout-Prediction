import React from 'react';

const PageHeader = ({ title, subtitle, children }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 4 }}>
    <div>
      <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 4 }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 14, color: '#616161' }}>{subtitle}</p>}
    </div>
    {children && <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>}
  </div>
);

export default PageHeader;
