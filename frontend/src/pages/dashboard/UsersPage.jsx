import React, { useCallback, useEffect, useState } from 'react';
import { userApi } from '../../services/api';
import { MdRefresh, MdBlock, MdCheckCircle, MdSearch, MdSupervisorAccount } from 'react-icons/md';
import toast from 'react-hot-toast';
import './Dashboard.css';

const ROLE_COLORS = { admin: '#E50914', teacher: '#3B82F6', counselor: '#22C55E' };

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      const { data } = await userApi.getAll(params);
      setUsers(data.users);
    } catch {}
    setLoading(false);
  }, [roleFilter]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (user) => {
    try {
      if (user.isActive) {
        await userApi.deactivate(user.id);
        toast.success('User deactivated');
      } else {
        await userApi.update(user.id, { isActive: true });
        toast.success('User activated');
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleCounts = { admin: 0, teacher: 0, counselor: 0 };
  users.forEach(u => { if (roleCounts[u.role] !== undefined) roleCounts[u.role]++; });

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">{users.length} total registered users</p>
        </div>
        <button className="btn-secondary" onClick={load}><MdRefresh /> Refresh</button>
      </div>

      {/* Role Stats */}
      <div className="stats-row">
        {Object.entries(roleCounts).map(([role, count]) => (
          <div key={role} className="stat-widget" style={{ '--card-color': ROLE_COLORS[role], cursor: 'default' }}>
            <div className="stat-widget-icon" style={{ background: `${ROLE_COLORS[role]}20`, color: ROLE_COLORS[role] }}>
              <MdSupervisorAccount />
            </div>
            <div className="stat-widget-body">
              <div className="stat-widget-value">{count}</div>
              <div className="stat-widget-title" style={{ textTransform: 'capitalize' }}>{role}s</div>
            </div>
          </div>
        ))}
        <div className="stat-widget" style={{ '--card-color': '#9E9E9E', cursor: 'default' }}>
          <div className="stat-widget-icon" style={{ background: 'rgba(255,255,255,0.08)', color: '#9E9E9E' }}>
            <MdSupervisorAccount />
          </div>
          <div className="stat-widget-body">
            <div className="stat-widget-value">{users.filter(u => u.isActive).length}</div>
            <div className="stat-widget-title">Active Users</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <MdSearch className="search-icon" />
          <input className="search-input" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="counselor">Counselor</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Verified</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(8)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 16 }} /></td>)}</tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <MdSupervisorAccount style={{ fontSize: 48, color: '#424242' }} />
                    <h3>No users found</h3>
                  </div>
                </td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `${ROLE_COLORS[u.role]}20`, color: ROLE_COLORS[u.role],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, flexShrink: 0
                      }}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: '#616161' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
                      color: ROLE_COLORS[u.role], background: `${ROLE_COLORS[u.role]}15`,
                      padding: '3px 10px', borderRadius: 6
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ color: '#9E9E9E', fontSize: 13 }}>{u.department || '—'}</td>
                  <td style={{ color: '#9E9E9E', fontSize: 13 }}>{u.phone || '—'}</td>
                  <td>
                    {u.isVerified
                      ? <MdCheckCircle style={{ color: '#22C55E', fontSize: 18 }} />
                      : <span style={{ color: '#616161', fontSize: 12 }}>Pending</span>}
                  </td>
                  <td>
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: u.isActive ? '#22C55E' : '#616161',
                      background: u.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                      padding: '3px 8px', borderRadius: 4
                    }}>
                      {u.isActive ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td style={{ color: '#616161', fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-ghost"
                      style={{ padding: '6px 10px', color: u.isActive ? '#E50914' : '#22C55E', fontSize: 12 }}
                      onClick={() => toggleActive(u)}
                      title={u.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {u.isActive ? <><MdBlock /> Deactivate</> : <><MdCheckCircle /> Activate</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
