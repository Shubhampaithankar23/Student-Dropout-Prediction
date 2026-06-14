import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { markAllRead } from '../../store/slices/notificationSlice';
import {
  MdMenu, MdNotifications, MdPerson,
  MdLogout, MdSettings
} from 'react-icons/md';
import { FaBrain } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import './Topbar.css';

const Topbar = ({ onToggleSidebar, onMobileMenu }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { list: notifications, unreadCount } = useSelector((state) => state.notifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const getNotifColor = (type) => {
    if (type === 'danger') return '#E50914';
    if (type === 'warning') return '#F59E0B';
    if (type === 'success') return '#22C55E';
    return '#3B82F6';
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-btn desktop-only" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <MdMenu />
        </button>
        <button className="topbar-btn mobile-only" onClick={onMobileMenu} aria-label="Open menu">
          <MdMenu />
        </button>
        <div className="topbar-brand mobile-only">
          <FaBrain style={{ color: '#E50914' }} />
          <span>EduGuard AI</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Notifications */}
        <div className="topbar-dropdown" ref={notifRef}>
          <button
            className="topbar-btn notif-btn"
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            aria-label="Notifications"
          >
            <MdNotifications />
            {unreadCount > 0 && (
              <span className="notif-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="dropdown-panel notif-panel">
              <div className="dropdown-header">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button className="mark-all-btn" onClick={() => dispatch(markAllRead())}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">No notifications</div>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div key={n.id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                      <div className="notif-dot" style={{ background: getNotifColor(n.type) }} />
                      <div className="notif-content">
                        <p className="notif-title">{n.title}</p>
                        <p className="notif-msg">{n.message}</p>
                        <span className="notif-time">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Link to="/dashboard/notifications" className="dropdown-footer" onClick={() => setShowNotifications(false)}>
                View all notifications
              </Link>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="topbar-dropdown" ref={profileRef}>
          <button
            className="profile-btn"
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
          >
            <div className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info desktop-only">
              <span className="profile-name">{user?.name}</span>
              <span className={`profile-role role-${user?.role}`}>{user?.role}</span>
            </div>
          </button>

          {showProfile && (
            <div className="dropdown-panel profile-panel">
              <div className="dropdown-header">
                <div className="profile-header-info">
                  <strong>{user?.name}</strong>
                  <span>{user?.email}</span>
                </div>
              </div>
              <Link to="/dashboard/profile" className="dropdown-item" onClick={() => setShowProfile(false)}>
                <MdPerson /> Profile Settings
              </Link>
              {user?.role === 'admin' && (
                <Link to="/dashboard/settings" className="dropdown-item" onClick={() => setShowProfile(false)}>
                  <MdSettings /> System Settings
                </Link>
              )}
              <div className="dropdown-divider" />
              <button className="dropdown-item logout-item" onClick={handleLogout}>
                <MdLogout /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
