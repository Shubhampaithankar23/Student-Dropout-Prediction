import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, markAllRead } from '../../store/slices/notificationSlice';
import { MdNotifications, MdDoneAll, MdRefresh, MdWarning, MdInfo, MdCheckCircle, MdError } from 'react-icons/md';
import { formatDistanceToNow } from 'date-fns';
import './Dashboard.css';

const TYPE_CONFIG = {
  danger:  { icon: <MdError />,       color: '#E50914', bg: 'rgba(229,9,20,0.08)' },
  warning: { icon: <MdWarning />,     color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  success: { icon: <MdCheckCircle />, color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
  info:    { icon: <MdInfo />,        color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
};

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { list, unreadCount, loading } = useSelector((s) => s.notifications);

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="header-actions">
          <button className="btn-ghost" onClick={() => dispatch(fetchNotifications())}><MdRefresh /> Refresh</button>
          {unreadCount > 0 && (
            <button className="btn-secondary" onClick={() => dispatch(markAllRead())}>
              <MdDoneAll /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {[
          { label: 'Total', value: list.length, color: '#9E9E9E' },
          { label: 'Unread', value: unreadCount, color: '#3B82F6' },
          { label: 'High Risk Alerts', value: list.filter(n => n.type === 'danger').length, color: '#E50914' },
          { label: 'Warnings', value: list.filter(n => n.type === 'warning').length, color: '#F59E0B' },
        ].map((c, i) => (
          <div key={i} className="stat-widget" style={{ '--card-color': c.color, cursor: 'default' }}>
            <div className="stat-widget-icon" style={{ background: `${c.color}20`, color: c.color }}>
              <MdNotifications />
            </div>
            <div className="stat-widget-body">
              <div className="stat-widget-value">{c.value}</div>
              <div className="stat-widget-title">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Notifications List */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="skeleton" style={{ height: 16, width: '40%' }} />
                  <div className="skeleton" style={{ height: 12, width: '70%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <MdNotifications style={{ fontSize: 56, color: '#424242', marginBottom: 12 }} />
            <h3>All caught up!</h3>
            <p>No notifications at this time</p>
          </div>
        ) : (
          <div>
            {list.map((n, i) => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
              return (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && dispatch(markAsRead(n.id))}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '16px 20px',
                    background: n.isRead ? 'transparent' : cfg.bg,
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    cursor: n.isRead ? 'default' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `${cfg.color}20`, color: cfg.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: n.isRead ? 500 : 700, color: n.isRead ? '#9E9E9E' : 'white' }}>
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <span style={{ width: 7, height: 7, background: cfg.color, borderRadius: '50%', flexShrink: 0 }} />
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: '#9E9E9E', lineHeight: 1.5, marginBottom: 4 }}>{n.message}</p>
                    <span style={{ fontSize: 11, color: '#424242' }}>
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Read indicator */}
                  {n.isRead && (
                    <MdCheckCircle style={{ color: '#424242', fontSize: 16, flexShrink: 0, marginTop: 2 }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
