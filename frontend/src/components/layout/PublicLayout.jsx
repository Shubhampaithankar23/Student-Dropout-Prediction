import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#121212' }}>
      <Outlet />
    </div>
  );
};

export default PublicLayout;
