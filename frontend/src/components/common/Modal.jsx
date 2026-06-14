import React, { useEffect } from 'react';
import { MdClose } from 'react-icons/md';

const Modal = ({ open, onClose, title, children, maxWidth = 600 }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32, width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto', animation: 'fadeInUp 0.3s ease' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#616161', fontSize: 24, cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 8, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.target.style.color = 'white'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.target.style.color = '#616161'; e.target.style.background = 'none'; }}>
            <MdClose />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
