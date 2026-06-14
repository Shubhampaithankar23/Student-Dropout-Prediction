import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CountUp from 'react-countup';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { MdPeople, MdWarning, MdPsychology, MdAnalytics, MdTrendingUp, MdArrowForward, MdSchool } from 'react-icons/md';
import { FaBrain } from 'react-icons/fa';
import { dashboardApi, analyticsApi } from '../../services/api';
import { format } from 'date-fns';
import './Dashboard.css';

const COLORS = { High: '#E50914', Medium: '#F59E0B', Low: '#22C55E' };
const PIE_COLORS = ['#22C55E', '#F59E0B', '#E50914'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
        <p style={{ color: '#9E9E9E', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardHome = () => {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState({ recentStudents: [], recentPredictions: [] });
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, activityRes, analyticsRes, trendsRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentActivity(),
          analyticsApi.getOverview(),
          analyticsApi.getTrends(6),
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
        setAnalytics(analyticsRes.data);
        const t = trendsRes.data.trends || [];
        setTrends(t.map(row => ({
          month: row.month ? format(new Date(row.month), 'MMM yy') : '',
          total: parseInt(row.total) || 0,
          high: parseInt(row.high_risk) || 0,
          medium: parseInt(row.medium_risk) || 0,
          low: parseInt(row.low_risk) || 0,
          avgCgpa: parseFloat(row.avg_cgpa || 0).toFixed(1),
          avgAttendance: parseFloat(row.avg_attendance || 0).toFixed(1),
        })));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  const getAdminCards = () => [
    { title: 'Total Students', value: stats?.totalStudents || 0, icon: <MdPeople />, color: '#3B82F6', link: '/dashboard/students' },
    { title: 'High Risk Students', value: stats?.highRiskStudents || 0, icon: <MdWarning />, color: '#E50914', link: '/dashboard/students?riskLevel=High' },
    { title: 'Total Teachers', value: stats?.totalTeachers || 0, icon: <MdSchool />, color: '#8B5CF6', link: '/dashboard/users?role=teacher' },
    { title: 'Total Counselors', value: stats?.totalCounselors || 0, icon: <MdPsychology />, color: '#22C55E', link: '/dashboard/users?role=counselor' },
  ];

  const getTeacherCards = () => [
    { title: 'My Students', value: stats?.totalStudents || 0, icon: <MdPeople />, color: '#3B82F6', link: '/dashboard/students' },
    { title: 'High Risk', value: stats?.highRiskStudents || 0, icon: <MdWarning />, color: '#E50914', link: '/dashboard/students?riskLevel=High' },
    { title: 'Medium Risk', value: stats?.mediumRiskStudents || 0, icon: <MdAnalytics />, color: '#F59E0B', link: '/dashboard/students?riskLevel=Medium' },
    { title: 'Added This Month', value: stats?.recentStudents || 0, icon: <MdTrendingUp />, color: '#22C55E', link: '/dashboard/students' },
  ];

  const getCounselorCards = () => [
    { title: 'Total Sessions', value: stats?.totalSessions || 0, icon: <MdPsychology />, color: '#3B82F6', link: '/dashboard/counseling' },
    { title: 'Pending Sessions', value: stats?.pendingSessions || 0, icon: <MdWarning />, color: '#F59E0B', link: '/dashboard/counseling?status=Scheduled' },
    { title: 'High Risk Students', value: stats?.highRiskStudents || 0, icon: <MdWarning />, color: '#E50914', link: '/dashboard/counseling' },
    { title: 'Completed Sessions', value: stats?.completedSessions || 0, icon: <MdAnalytics />, color: '#22C55E', link: '/dashboard/counseling?status=Completed' },
  ];

  const cards = user?.role === 'admin' ? getAdminCards()
    : user?.role === 'teacher' ? getTeacherCards()
    : getCounselorCards();

  const riskPieData = analytics?.riskDistribution || [];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading) {
    return (
      <div className="page-loading">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <p className="page-greeting">{greeting}, <span style={{ color: '#E50914' }}>{user?.name?.split(' ')[0]}</span> 👋</p>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">AI-powered student dropout prevention system</p>
        </div>
        <div className="header-actions">
          <Link to="/dashboard/students/add" className="btn-primary">
            <MdPeople /> Add Student
          </Link>
          <Link to="/dashboard/analytics" className="btn-secondary">
            <MdAnalytics /> Analytics
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-row">
        {cards.map((card, i) => (
          <Link to={card.link} key={i} className="stat-widget" style={{ '--card-color': card.color }}>
            <div className="stat-widget-icon" style={{ background: `${card.color}20`, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-widget-body">
              <div className="stat-widget-value">
                <CountUp end={card.value} duration={1.5} separator="," />
              </div>
              <div className="stat-widget-title">{card.title}</div>
            </div>
            <div className="stat-widget-arrow"><MdArrowForward /></div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Risk Trend */}
        <div className="chart-card wide">
          <div className="chart-header">
            <h3>Risk Trend (6 Months)</h3>
            <Link to="/dashboard/analytics" className="btn-ghost">View Full Analytics →</Link>
          </div>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {[['high', '#E50914'], ['medium', '#F59E0B'], ['low', '#22C55E']].map(([k, c]) => (
                    <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="low" name="Low Risk" stroke="#22C55E" fill="url(#grad-low)" strokeWidth={2} />
                <Area type="monotone" dataKey="medium" name="Medium Risk" stroke="#F59E0B" fill="url(#grad-medium)" strokeWidth={2} />
                <Area type="monotone" dataKey="high" name="High Risk" stroke="#E50914" fill="url(#grad-high)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No trend data yet. Add students to see trends.</p></div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="chart-card">
          <div className="chart-header"><h3>Risk Distribution</h3></div>
          {riskPieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {riskPieData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[entry.name] || PIE_COLORS[i % 3]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {riskPieData.map((d, i) => (
                  <div key={i} className="pie-legend-item">
                    <div className="pie-dot" style={{ background: COLORS[d.name] || PIE_COLORS[i % 3] }} />
                    <span>{d.name}</span>
                    <strong>{d.value}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state"><p>No data</p></div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-row">
        {/* Recent Students */}
        <div className="activity-card">
          <div className="chart-header">
            <h3>Recent Students</h3>
            <Link to="/dashboard/students" className="btn-ghost">View all →</Link>
          </div>
          {activity.recentStudents.length > 0 ? (
            <div className="recent-list">
              {activity.recentStudents.map((s) => (
                <Link to={`/dashboard/students/${s.id}`} key={s.id} className="recent-item">
                  <div className="recent-avatar" style={{ background: s.riskLevel === 'High' ? 'rgba(229,9,20,0.15)' : 'rgba(255,255,255,0.06)' }}>
                    {s.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="recent-info">
                    <strong>{s.name}</strong>
                    <span>{s.studentId} · {s.department || 'N/A'}</span>
                  </div>
                  <span className={`badge badge-${s.riskLevel?.toLowerCase()}`}>{s.riskLevel}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <MdPeople style={{ fontSize: 40, color: '#424242', marginBottom: 8 }} />
              <p>No students added yet</p>
              <Link to="/dashboard/students/add" className="btn-primary" style={{ marginTop: 12, fontSize: 13, padding: '8px 16px' }}>Add First Student</Link>
            </div>
          )}
        </div>

        {/* AI Predictions */}
        <div className="activity-card">
          <div className="chart-header">
            <h3>Recent Predictions</h3>
            <Link to="/dashboard/predictions" className="btn-ghost">View all →</Link>
          </div>
          {activity.recentPredictions.length > 0 ? (
            <div className="recent-list">
              {activity.recentPredictions.map((p) => (
                <div key={p.id} className="recent-item">
                  <div className="recent-avatar ai-icon">
                    <FaBrain />
                  </div>
                  <div className="recent-info">
                    <strong>{p.student?.name || 'Unknown'}</strong>
                    <span>Risk: {(p.riskScore * 100).toFixed(1)}% · {p.student?.studentId}</span>
                  </div>
                  <div className="prediction-badge" style={{ color: COLORS[p.riskLevel] }}>
                    <span className="risk-dot" style={{ background: COLORS[p.riskLevel] }} />
                    {p.riskLevel}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <FaBrain style={{ fontSize: 40, color: '#424242', marginBottom: 8 }} />
              <p>No predictions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
