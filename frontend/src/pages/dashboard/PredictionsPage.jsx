import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FaBrain } from 'react-icons/fa';
import { MdRefresh, MdArrowForward } from 'react-icons/md';
import './Dashboard.css';

const RISK_COLORS = { High: '#E50914', Medium: '#F59E0B', Low: '#22C55E' };

const PredictionsPage = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/predictions/history', { params: { page, limit: 20 } });
      setPredictions(data.predictions);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Predictions</h1>
          <p className="page-subtitle">{total} total predictions generated</p>
        </div>
        <button className="btn-secondary" onClick={load}><MdRefresh /> Refresh</button>
      </div>

      {/* Summary Cards */}
      <div className="stats-row">
        {[
          { label: 'Total Predictions', value: total, color: '#3B82F6' },
          { label: 'High Risk Detected', value: predictions.filter(p => p.riskLevel === 'High').length, color: '#E50914' },
          { label: 'Medium Risk', value: predictions.filter(p => p.riskLevel === 'Medium').length, color: '#F59E0B' },
          { label: 'Low Risk', value: predictions.filter(p => p.riskLevel === 'Low').length, color: '#22C55E' },
        ].map((c, i) => (
          <div key={i} className="stat-widget" style={{ '--card-color': c.color, cursor: 'default', textDecoration: 'none' }}>
            <div className="stat-widget-icon" style={{ background: `${c.color}20`, color: c.color }}><FaBrain /></div>
            <div className="stat-widget-body">
              <div className="stat-widget-value">{c.value}</div>
              <div className="stat-widget-title">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Predictions Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Risk Level</th>
                <th>Risk Score</th>
                <th>Confidence</th>
                <th>Top Factor</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(7)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 16 }} /></td>)}</tr>
              )) : predictions.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><FaBrain style={{ fontSize: 48, color: '#424242' }} /><h3>No predictions yet</h3><p>Add students to generate AI predictions</p></div></td></tr>
              ) : predictions.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>{p.student?.name}</div>
                    <div style={{ fontSize: 12, color: '#616161' }}>{p.student?.studentId}</div>
                  </td>
                  <td><span className={`badge badge-${p.riskLevel?.toLowerCase()}`}>{p.riskLevel}</span></td>
                  <td>
                    <div className="risk-score-bar">
                      <div className="risk-score-track">
                        <div className="risk-score-fill" style={{ width: `${(p.riskScore || 0) * 100}%`, background: RISK_COLORS[p.riskLevel] }} />
                      </div>
                      <span className="risk-score-text" style={{ color: RISK_COLORS[p.riskLevel] }}>{((p.riskScore || 0) * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td style={{ color: '#9E9E9E', fontSize: 13 }}>{((p.confidence || 0) * 100).toFixed(1)}%</td>
                  <td style={{ fontSize: 12, color: '#9E9E9E', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.factors?.[0]?.factor || '—'}
                  </td>
                  <td style={{ color: '#616161', fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/dashboard/students/${p.studentId}`} className="btn-ghost" style={{ padding: '6px 8px' }}>
                      <MdArrowForward />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">Page {page} of {totalPages}</span>
            <div className="pagination-btns">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionsPage;
