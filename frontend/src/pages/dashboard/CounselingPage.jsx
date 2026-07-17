import React, { useCallback, useEffect, useRef, useState } from 'react';
import { counselingApi } from '../../services/api';
import api from '../../services/api';
import { MdAdd, MdRefresh, MdClose, MdCheck, MdPsychology, MdSearch } from 'react-icons/md';
import toast from 'react-hot-toast';
import './Dashboard.css';

const STATUS_COLORS = { Scheduled: '#3B82F6', Completed: '#22C55E', Cancelled: '#616161', Pending: '#F59E0B' };
const PRIORITY_COLORS = { Low: '#22C55E', Medium: '#F59E0B', High: '#E50914', Critical: '#FF0000' };

// ── Student Search Input ─────────────────────────────────────────────────────
const StudentSearchInput = ({ value, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const debounce = useRef(null);

  const search = (q) => {
    clearTimeout(debounce.current);
    if (!q.trim()) { setResults([]); return; }
    debounce.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/students', { params: { search: q, limit: 8 } });
        setResults(data.students || []);
        setOpen(true);
      } catch { setResults([]); }
    }, 300);
  };

  const pick = (student) => {
    setSelectedName(`${student.name} (${student.studentId})`);
    setQuery('');
    setResults([]);
    setOpen(false);
    onSelect(student.id);
  };

  return (
    <div style={{ position: 'relative' }}>
      {selectedName ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '8px 12px' }}>
          <span style={{ color: '#22C55E', fontSize: 13, flex: 1 }}>{selectedName}</span>
          <button type="button" className="btn-ghost" style={{ padding: '2px 6px', color: '#616161' }}
            onClick={() => { setSelectedName(''); onSelect(''); }}>
            <MdClose size={14} />
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <MdSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#616161' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 34 }}
            placeholder="Search by name or student ID…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
            onFocus={() => query && setOpen(true)}
            autoComplete="off"
          />
        </div>
      )}
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', zIndex: 1000, top: '100%', left: 0, right: 0,
          background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, marginTop: 4, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {results.map((s) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={() => pick(s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                padding: '10px 14px', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: s.riskLevel === 'High' ? 'rgba(229,9,20,0.15)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.riskLevel === 'High' ? '#E50914' : '#9E9E9E', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {s.name?.charAt(0)}
              </div>
              <div>
                <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                <div style={{ color: '#616161', fontSize: 11 }}>{s.studentId} · {s.department || 'No dept'} · <span style={{ color: s.riskLevel === 'High' ? '#E50914' : s.riskLevel === 'Medium' ? '#F59E0B' : '#22C55E' }}>{s.riskLevel} Risk</span></div>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && results.length === 0 && query.trim() && (
        <div style={{ position: 'absolute', zIndex: 1000, top: '100%', left: 0, right: 0, background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, marginTop: 4, padding: '12px 14px', color: '#616161', fontSize: 13 }}>
          No students found for "{query}"
        </div>
      )}
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const CounselingPage = () => {
  const [sessions, setSessions] = useState([]);
  const [atRisk, setAtRisk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('sessions');
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const emptyForm = { studentId: '', sessionDate: '', sessionType: 'Academic', priority: 'Medium', notes: '', recommendations: '' };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      const [sRes, rRes] = await Promise.all([
        counselingApi.getAll(params),
        counselingApi.getAtRisk(),
      ]);
      setSessions(sRes.data.sessions);
      setAtRisk(rRes.data.students);
    } catch {}
    setLoading(false);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const openModal = (prefillStudentId = '') => {
    setForm({ ...emptyForm, studentId: prefillStudentId });
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.studentId) { toast.error('Please select a student'); return; }
    try {
      await counselingApi.create(form);
      toast.success('Session scheduled!');
      setShowModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to schedule session'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await counselingApi.update(id, { status });
      setSessions(sessions.map(s => s.id === id ? { ...s, status } : s));
      toast.success(`Session marked as ${status}`);
    } catch {}
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Counseling</h1>
          <p className="page-subtitle">{atRisk.length} high-risk students need attention</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={load}><MdRefresh /> Refresh</button>
          <button className="btn-primary" onClick={() => openModal()}><MdAdd /> Schedule Session</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {[
          { label: 'Total Sessions', value: sessions.length, color: '#3B82F6' },
          { label: 'Scheduled', value: sessions.filter(s => s.status === 'Scheduled').length, color: '#F59E0B' },
          { label: 'Completed', value: sessions.filter(s => s.status === 'Completed').length, color: '#22C55E' },
          { label: 'High Risk Students', value: atRisk.length, color: '#E50914' },
        ].map((c, i) => (
          <div key={i} className="stat-widget" style={{ '--card-color': c.color, cursor: 'default' }}>
            <div className="stat-widget-icon" style={{ background: `${c.color}20`, color: c.color }}><MdPsychology /></div>
            <div className="stat-widget-body">
              <div className="stat-widget-value">{c.value}</div>
              <div className="stat-widget-title">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {[['sessions', 'Sessions'], ['at-risk', `At-Risk Students (${atRisk.length})`]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: 13 }}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'sessions' && (
        <>
          {/* Filters */}
          <div className="filters-bar">
            <select className="filter-select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Pending">Pending</option>
            </select>
            <select className="filter-select" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
              <option value="">All Priority</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Recommendations</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [...Array(4)].map((_, i) => <tr key={i}>{[...Array(7)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 16 }} /></td>)}</tr>)
                    : sessions.length === 0
                      ? <tr><td colSpan={7}><div className="empty-state"><MdPsychology style={{ fontSize: 48, color: '#424242' }} /><h3>No sessions yet</h3><p>Schedule a counseling session</p></div></td></tr>
                      : sessions.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>{s.student?.name}</div>
                            <div style={{ fontSize: 12, color: '#616161' }}>{s.student?.studentId}</div>
                          </td>
                          <td style={{ color: '#9E9E9E', fontSize: 13 }}>{s.sessionType}</td>
                          <td style={{ color: '#9E9E9E', fontSize: 13 }}>{new Date(s.sessionDate).toLocaleDateString()}</td>
                          <td><span style={{ fontSize: 12, fontWeight: 600, color: PRIORITY_COLORS[s.priority] }}>● {s.priority}</span></td>
                          <td>
                            <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLORS[s.status], background: `${STATUS_COLORS[s.status]}15`, padding: '3px 8px', borderRadius: 4 }}>
                              {s.status}
                            </span>
                          </td>
                          <td style={{ color: '#9E9E9E', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.recommendations || '—'}
                          </td>
                          <td>
                            {s.status === 'Scheduled' && (
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button className="btn-ghost" style={{ padding: '4px 8px', color: '#22C55E' }} onClick={() => updateStatus(s.id, 'Completed')} title="Mark Complete">
                                  <MdCheck />
                                </button>
                                <button className="btn-ghost" style={{ padding: '4px 8px', color: '#E50914' }} onClick={() => updateStatus(s.id, 'Cancelled')} title="Cancel">
                                  <MdClose />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'at-risk' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Student</th><th>Risk Score</th><th>CGPA</th><th>Attendance</th><th>Financial</th><th>Sessions</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {atRisk.length === 0
                  ? <tr><td colSpan={7}><div className="empty-state"><p>No high risk students found</p></div></td></tr>
                  : atRisk.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="student-cell-avatar" style={{ background: 'rgba(229,9,20,0.15)', color: '#E50914' }}>{s.name?.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>{s.name}</div>
                            <div style={{ fontSize: 12, color: '#616161' }}>{s.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td><span style={{ fontWeight: 700, color: '#E50914' }}>{((s.riskScore || 0) * 100).toFixed(1)}%</span></td>
                      <td style={{ color: parseFloat(s.cgpa) < 5 ? '#E50914' : '#9E9E9E', fontWeight: 600 }}>{parseFloat(s.cgpa).toFixed(2)}</td>
                      <td style={{ color: parseFloat(s.attendancePercentage) < 60 ? '#E50914' : '#9E9E9E' }}>{parseFloat(s.attendancePercentage).toFixed(1)}%</td>
                      <td style={{ color: s.financialStatus === 'Poor' ? '#E50914' : '#9E9E9E' }}>{s.financialStatus}</td>
                      <td style={{ color: '#9E9E9E' }}>{s.counselingSessions?.length || 0}</td>
                      <td>
                        <button className="btn-primary" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => openModal(s.id)}>
                          <MdAdd /> Schedule
                        </button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>Schedule Session</h2>
              <button className="btn-ghost" onClick={() => setShowModal(false)} style={{ padding: '6px' }}><MdClose /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Student search — pre-filled when opened from at-risk table */}
              <div className="form-group">
                <label className="form-label">Student</label>
                <StudentSearchInput
                  value={form.studentId}
                  onSelect={(id) => setForm(f => ({ ...f, studentId: id }))}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Session Date</label>
                  <input className="form-input" type="datetime-local" value={form.sessionDate} onChange={(e) => setForm({ ...form, sessionDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Session Type</label>
                  <select className="form-input" value={form.sessionType} onChange={(e) => setForm({ ...form, sessionType: e.target.value })}>
                    {['Academic', 'Personal', 'Financial', 'Career', 'Mental Health'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Session notes…" style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Initial Recommendations</label>
                <textarea className="form-input" rows={3} value={form.recommendations} onChange={(e) => setForm({ ...form, recommendations: e.target.value })} placeholder="Initial counseling recommendations…" style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Schedule Session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounselingPage;
