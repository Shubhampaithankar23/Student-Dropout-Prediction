import React from 'react';

const Spinner = ({ size = 32, color = '#E50914' }) => (
  <div style={{
    width: size, height: size,
    border: `3px solid rgba(255,255,255,0.08)`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    flexShrink: 0,
  }} />
);

export default Spinner;
