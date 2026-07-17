import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  MdDashboard, MdPeople, MdAnalytics, MdPsychology,
  MdAssessment, MdNotifications, MdSettings, MdLogout,
  MdPerson, MdClose, MdSupervisorAccount, MdHistory
} from 'react-icons/md';
import { FaBrain } from 'react-icons/fa';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', icon: MdDashboard, label: 'Dashboard', exact: true },
  { path: '/dashboard/students', icon: MdPeople, label: 'Students' },
  { path: '/dashboard/predictions', icon: FaBrain, label: 'Predictions' },
  { path: '/dashboard/analytics', icon: MdAnalytics, label: 'Analytics' },
  { path: '/dashboard/counseling', icon: MdPsychology, label: 'Counseling', roles: ['admin', 'counselor'] },
  { path: '/dashboard/reports', icon: MdAssessment, label: 'Reports' },
  { divider: true, label: 'ACCOUNT' },
  { path: '/dashboard/notifications', icon: MdNotifications, label: 'Notifications' },
  { path: '/dashboard/profile', icon: MdPerson, label: 'Profile' },
  { path: '/dashboard/users', icon: MdSupervisorAccount, label: 'Manage Users', roles: ['admin'] },
  { path: '/dashboard/audit-log', icon: MdHistory, label: 'Audit Log', roles: ['admin'] },
  { path: '/dashboard/settings', icon: MdSettings, label: 'Settings', roles: ['admin'] },
];

const Sidebar = ({ collapsed, mobileOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const filteredItems = navItems.filter(item =>
    !item.roles || item.roles.includes(user?.role)
  );

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <FaBrain />
          </div>
          {!collapsed && (
            <div className="logo-text">
              <span className="logo-name">EduGuard</span>
              <span className="logo-suffix">AI</span>
            </div>
          )}
        </div>
        <button className="sidebar-close-btn" onClick={onClose}>
          <MdClose />
        </button>
      </div>

      {/* User Profile Mini */}
      {!collapsed && user && (
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.name}</span>
            <span className={`sidebar-user-role role-${user.role}`}>{user.role}</span>
          </div>
          <div className="dot-online" />
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {filteredItems.map((item, i) => {
          if (item.divider) {
            return !collapsed ? (
              <div key={i} className="nav-divider">{item.label}</div>
            ) : <div key={i} className="nav-divider-line" />;
          }

          const Icon = item.icon;
          const isNotifications = item.path === '/dashboard/notifications';

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">
                <Icon />
                {isNotifications && unreadCount > 0 && (
                  <span className="nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <span className="nav-icon"><MdLogout /></span>
          {!collapsed && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
