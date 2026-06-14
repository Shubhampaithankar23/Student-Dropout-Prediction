import React from 'react';

const EmptyState = ({ icon, title, message, action }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
    <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.4 }}>{icon || '📭'}</div>
    <h3 style={{ color: '#9E9E9E', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{title || 'Nothing here yet'}</h3>
    {message && <p style={{ color: '#424242', fontSize: 14, maxWidth: 300 }}>{message}</p>}
    {action && <div style={{ marginTop: 20 }}>{action}</div>}
  </div>
);

export default EmptyState;
