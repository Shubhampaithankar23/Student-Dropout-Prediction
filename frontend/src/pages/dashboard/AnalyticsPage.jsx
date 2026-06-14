import React, { useCallback, useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { analyticsApi } from '../../services/api';
import { format } from 'date-fns';
import { MdRefresh, MdTrendingUp } from 'react-icons/md';
import './Dashboard.css';

const RISK_COLORS = ['#22C55E', '#F59E0B', '#E50914'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
        <p style={{ color: '#9E9E9E', marginBottom: 6 }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</p>)}
      </div>
    );
  }
  return null;
};

const AnalyticsPage = () => {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [months, setMonths] = useState(6);

  const load = useCallback(async () => {
    try {
      const [o, t, p] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getTrends(months),
        analyticsApi.getPerformance(),
      ]);
      setOverview(o.data);
      setTrends((t.data.trends || []).map(row => ({
        month: row.month ? format(new Date(row.month), 'MMM yy') : '',
        total: parseInt(row.total) || 0,
        high: parseInt(row.high_risk) || 0,
        medium: parseInt(row.medium_risk) || 0,
        low: parseInt(row.low_risk) || 0,
        avgCgpa: parseFloat(row.avg_cgpa || 0),
        avgAttendance: parseFloat(row.avg_attendance || 0),
      })));
      setPerformance(p.data.performance);
    } catch (e) { console.error(e); }
  }, [months]);

  useEffect(() => { load(); }, [load]);

  const performanceRadarData = performance ? [
    { subject: 'Avg CGPA', value: ((parseFloat(performance.avgCgpa) || 0) / 10) * 100 },
    { subject: 'Attendance', value: parseFloat(performance.avgAttendance) || 0 },
    { subject: 'Assignments', value: parseFloat(performance.avgAssignment) || 0 },
    { subject: 'LMS Score', value: parseFloat(performance.avgLms) || 0 },
    { subject: 'Internal Marks', value: parseFloat(performance.avgInternalMarks) || 0 },
  ] : [];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Comprehensive student performance and risk insights</p>
        </div>
        <div className="header-actions">
          <select className="filter-select" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
          </select>
          <button className="btn-secondary" onClick={load}><MdRefresh /> Refresh</button>
        </div>
      </div>

      {/* Performance Summary */}
      {performance && (
        <div className="stats-row">
          {[
            { label: 'Avg CGPA', value: parseFloat(performance.avgCgpa).toFixed(2), color: '#3B82F6' },
            { label: 'Avg Attendance', value: `${parseFloat(performance.avgAttendance).toFixed(1)}%`, color: '#22C55E' },
            { label: 'Avg Assignment Rate', value: `${parseFloat(performance.avgAssignment).toFixed(1)}%`, color: '#8B5CF6' },
            { label: 'Avg LMS Score', value: parseFloat(performance.avgLms).toFixed(1), color: '#F59E0B' },
          ].map((c, i) => (
            <div key={i} className="stat-widget" style={{ '--card-color': c.color, cursor: 'default' }}>
              <div className="stat-widget-icon" style={{ background: `${c.color}20`, color: c.color }}><MdTrendingUp /></div>
              <div className="stat-widget-body">
                <div className="stat-widget-value">{c.value}</div>
                <div className="stat-widget-title">{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Grid */}
      <div className="analytics-grid">
        {/* Risk Trend */}
        <div className="chart-card wide" style={{ gridColumn: '1 / -1' }}>
          <div className="chart-header">
            <h3>Monthly Student Risk Trend</h3>
          </div>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {[['high', '#E50914'], ['medium', '#F59E0B'], ['low', '#22C55E']].map(([k, c]) => (
                    <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#616161', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#616161', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: '#9E9E9E', fontSize: 12 }}>{v}</span>} />
                <Area type="monotone" dataKey="low" name="Low Risk" stroke="#22C55E" fill="url(#g-low)" strokeWidth={2} />
                <Area type="monotone" dataKey="medium" name="Medium Risk" stroke="#F59E0B" fill="url(#g-medium)" strokeWidth={2} />
                <Area type="monotone" dataKey="high" name="High Risk" stroke="#E50914" fill="url(#g-high)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No trend data. Add students first.</p></div>}
        </div>

        {/* CGPA vs Attendance Trend */}
        {trends.length > 0 && (
          <div className="chart-card">
            <div className="chart-header"><h3>CGPA & Attendance Trend</h3></div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#616161', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#616161', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: '#9E9E9E', fontSize: 12 }}>{v}</span>} />
                <Line type="monotone" dataKey="avgCgpa" name="Avg CGPA" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
                <Line type="monotone" dataKey="avgAttendance" name="Avg Attendance %" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Risk Distribution Pie */}
        {overview?.riskDistribution?.length > 0 && (
          <div className="chart-card">
            <div className="chart-header"><h3>Risk Distribution</h3></div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={overview.riskDistribution} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={{ stroke: '#424242' }}>
                  {overview.riskDistribution.map((entry, i) => (
                    <Cell key={i} fill={RISK_COLORS[i % 3]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gender Distribution */}
        {overview?.genderDistribution?.length > 0 && (
          <div className="chart-card">
            <div className="chart-header"><h3>Gender Distribution</h3></div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={overview.genderDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: '#616161', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#616161', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Financial Status */}
        {overview?.financialDistribution?.length > 0 && (
          <div className="chart-card">
            <div className="chart-header"><h3>Financial Status Distribution</h3></div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={overview.financialDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: '#616161', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#616161', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Students" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Department Distribution */}
        {overview?.departmentDistribution?.length > 0 && (
          <div className="chart-card">
            <div className="chart-header"><h3>Top Departments</h3></div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={overview.departmentDistribution.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" tick={{ fill: '#616161', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9E9E9E', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Performance Radar */}
        {performanceRadarData.length > 0 && (
          <div className="chart-card">
            <div className="chart-header"><h3>Average Performance Radar</h3></div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={performanceRadarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9E9E9E', fontSize: 11 }} />
                <Radar name="Avg" dataKey="value" stroke="#E50914" fill="#E50914" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
