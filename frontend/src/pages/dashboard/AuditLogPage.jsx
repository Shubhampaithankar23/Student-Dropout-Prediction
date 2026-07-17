import React, { useEffect, useState, useCallback } from 'react';
import { MdSecurity, MdSearch, MdRefresh, MdFilterList } from 'react-icons/md';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './Dashboard.css';

const STATUS_COLORS = { success: '#22C55E', failure: '#E50914' };
const ACTION_COLORS = {
  LOGIN: '#3B82F6', LOGOUT: '#616161', REGISTER: '#22C55E',
  CREATE: '#22C55E', UPDATE: '#F59E0B', DELETE: '#E50914',
  LOGIN_FAILED: '#E50914', PREDICT: '#A855F7', CSV_UPLOAD: '#06B6D4',
  DEACTIVATE: '#EF4444', RESTORE: '#22C55E',
};

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState([]);
  const [filters, setFilters] = useState({ search: '', action: '', status: '', page: 1, limit: 30 });

  const loadActions = useCallback(async () => {
    try {
      const { data } = await api.get('/auditlogs/actions');
      setActions(data.actions || []);
    } catch {}
  }, []);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: filters.limit };
      if (filters.search) params.search = filters.search;
      if (filters.action) params.action = filters.action;
      if (filters.status) params.status = filters.status;
      const { data } = await api.get('/auditlogs', { params });
      setLogs(data.logs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadActions(); }, [loadActions]);
  useEffect(() => { loadLogs(); }, [loadLogs]);

  const setFilter = (key) => (e) => setFilters(f => ({ ...f, [key]: e.target.value, page: 1 }));

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-subtitle">{total} total events recorded</p>
        </div>
        <div className="header-actions">
          <button className="btn-ghost" onClick={loadLogs}><MdRefresh /> Refresh</button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <MdSearch className="search-icon" />
          <input
            className="search-input"
            placeholder="Search action or resource…"
            value={filters.search}
            onChange={setFilter('search')}
          />
        </div>
        <select className="filter-select" value={filters.action} onChange={setFilter('action')}>
          <option value="">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select className="filter-select" value={filters.status} onChange={setFilter('status')}>
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </select>
        <select className="filter-select" value={filters.limit} onChange={(e) => setFilters(f => ({ ...f, limit: Number(e.target.value), page: 1 }))}>
          <option value={30}>30 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Status</th>
                <th>IP Address</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 14, width: '80%', borderRadius: 4 }} /></td>
                  ))}</tr>
                ))
                : logs.length === 0
                  ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state">
                          <MdSecurity style={{ fontSize: 48, color: '#424242', marginBottom: 12 }} />
                          <h3>No audit logs found</h3>
                          <p>Try adjusting filters</p>
                        </div>
                      </td>
                    </tr>
                  )
                  : logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ color: '#9E9E9E', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(log.createdAt)}</td>
                      <td>
                        {log.user ? (
                          <>
                            <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{log.user.name}</div>
                            <div style={{ color: '#616161', fontSize: 11 }}>{log.user.role}</div>
                          </>
                        ) : (
                          <span style={{ color: '#424242', fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td>
                        <span style={{
                          fontSize: 11, fontWeight: 700, letterSpacing: 0.4, padding: '3px 8px', borderRadius: 4,
                          color: ACTION_COLORS[log.action] || '#9E9E9E',
                          background: `${ACTION_COLORS[log.action] || '#9E9E9E'}15`,
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ color: '#9E9E9E', fontSize: 13 }}>{log.resource}{log.resourceId ? <span style={{ color: '#424242', fontSize: 11, display: 'block' }}>{log.resourceId.substring(0, 8)}…</span> : null}</td>
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLORS[log.status] }}>
                          ● {log.status}
                        </span>
                      </td>
                      <td style={{ color: '#616161', fontSize: 12, fontFamily: 'monospace' }}>{log.ipAddress || '—'}</td>
                      <td style={{ color: '#616161', fontSize: 11, maxWidth: 180 }}>
                        {log.details && Object.keys(log.details).length > 0
                          ? Object.entries(log.details).map(([k, v]) => (
                            <div key={k}><span style={{ color: '#424242' }}>{k}:</span> {String(v).substring(0, 20)}</div>
                          ))
                          : '—'
                        }
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">Showing {logs.length} of {total} events</span>
            <div className="pagination-btns">
              <button className="page-btn" disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: 1 }))}>«</button>
              <button className="page-btn" disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>‹</button>
              {(() => {
                const windowSize = 5;
                const half = Math.floor(windowSize / 2);
                let start = Math.max(1, filters.page - half);
                let end = Math.min(totalPages, start + windowSize - 1);
                if (end - start < windowSize - 1) start = Math.max(1, end - windowSize + 1);
                return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(p => (
                  <button key={p} className={`page-btn ${filters.page === p ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, page: p }))}>{p}</button>
                ));
              })()}
              <button className="page-btn" disabled={filters.page >= totalPages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>›</button>
              <button className="page-btn" disabled={filters.page >= totalPages} onClick={() => setFilters(f => ({ ...f, page: totalPages }))}>»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogPage;
