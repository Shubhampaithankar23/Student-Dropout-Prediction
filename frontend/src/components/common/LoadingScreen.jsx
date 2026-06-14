import React from 'react';

const LoadingScreen = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: '#121212', gap: '20px'
  }}>
    <div style={{ position: 'relative' }}>
      <div style={{
        width: '60px', height: '60px', border: '3px solid rgba(255,255,255,0.08)',
        borderTop: '3px solid #E50914', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
    </div>
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ color: '#E50914', fontSize: '24px', fontWeight: '700', marginBottom: '4px', fontFamily: 'Space Grotesk, sans-serif' }}>
        EduGuard AI
      </h2>
      <p style={{ color: '#616161', fontSize: '14px' }}>Loading system...</p>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default LoadingScreen;
