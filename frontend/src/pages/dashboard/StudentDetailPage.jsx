import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudent } from '../../store/slices/studentSlice';
import api from '../../services/api';
import { MdArrowBack, MdEdit, MdWarning } from 'react-icons/md';
import { FaBrain } from 'react-icons/fa';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import './Dashboard.css';

const RISK_COLORS = { High: '#E50914', Medium: '#F59E0B', Low: '#22C55E' };

const StudentDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current, loading } = useSelector((s) => s.students);
  const { user } = useSelector((s) => s.auth);
  const [predicting, setPredicting] = useState(false);
  const [latestPrediction, setLatestPrediction] = useState(null);

  useEffect(() => {
    dispatch(fetchStudent(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (current?.predictions?.length > 0) {
      setLatestPrediction(current.predictions[0]);
    }
  }, [current]);

  const runPrediction = async () => {
    setPredicting(true);
    try {
      const { data } = await api.post(`/predictions/predict/${id}`);
      setLatestPrediction(data.prediction);
      toast.success('Prediction updated!');
      dispatch(fetchStudent(id));
    } catch { toast.error('Prediction failed'); }
    setPredicting(false);
  };

  if (loading || !current) {
    return (
      <div className="dashboard-page">
        <div className="skeleton" style={{ height: 40, width: 200, marginBottom: 20 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
          <div className="skeleton" style={{ height: 400 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
          </div>
        </div>
      </div>
    );
  }

  const riskColor = RISK_COLORS[current.riskLevel] || '#9E9E9E';
  const riskPct = ((current.riskScore || 0) * 100).toFixed(1);

  const radarData = [
    { subject: 'CGPA', value: (parseFloat(current.cgpa) / 10) * 100 },
    { subject: 'Attendance', value: parseFloat(current.attendancePercentage) },
    { subject: 'Assignments', value: parseFloat(current.assignmentSubmissionRate) },
    { subject: 'LMS', value: parseFloat(current.lmsActivityScore) },
    { subject: 'Internal', value: parseFloat(current.internalMarks) },
    { subject: 'Participation', value: parseFloat(current.participationScore) },
  ];

  const factors = latestPrediction?.factors || [];
  const recommendations = latestPrediction?.recommendations || [];

  return (
    <div className="dashboard-page">
      {/* Back */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <Link to="/dashboard/students" className="btn-ghost" style={{ display: 'inline-flex', gap: 6 }}>
          <MdArrowBack /> Back to Students
        </Link>
        <div style={{ display: 'flex', gap: 12 }}>
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <>
              <button className="btn-secondary" onClick={runPrediction} disabled={predicting}>
                {predicting ? <span className="btn-spinner" /> : <FaBrain />}
                {predicting ? 'Predicting...' : 'Re-run Prediction'}
              </button>
              <Link to={`/dashboard/students/${id}/edit`} className="btn-primary"><MdEdit /> Edit</Link>
            </>
          )}
        </div>
      </div>

      <div className="detail-grid">
        {/* Sidebar */}
        <div className="detail-sidebar">
          {/* Profile Card */}
          <div className="student-profile-card">
            <div className="profile-big-avatar">{current.name?.charAt(0)}</div>
            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{current.name}</h2>
            <p style={{ color: '#9E9E9E', fontSize: 13, marginBottom: 12 }}>{current.studentId}</p>
            <span className={`badge badge-${current.riskLevel?.toLowerCase()}`} style={{ fontSize: 13 }}>
              {current.riskLevel} Risk
            </span>
            <div style={{ marginTop: 20, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#616161' }}>Email</span>
                <span style={{ color: '#9E9E9E' }}>{current.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#616161' }}>Age</span>
                <span style={{ color: '#9E9E9E' }}>{current.age}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#616161' }}>Gender</span>
                <span style={{ color: '#9E9E9E' }}>{current.gender}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#616161' }}>Dept.</span>
                <span style={{ color: '#9E9E9E' }}>{current.department || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#616161' }}>Semester</span>
                <span style={{ color: '#9E9E9E' }}>{current.semester || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#616161' }}>Financial</span>
                <span style={{ color: current.financialStatus === 'Poor' ? '#E50914' : '#9E9E9E' }}>{current.financialStatus}</span>
              </div>
            </div>
          </div>

          {/* Risk Gauge */}
          <div className="risk-gauge">
            <h4 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 16, textAlign: 'center' }}>Dropout Risk Score</h4>
            <div className="gauge-circle" style={{ background: `conic-gradient(${riskColor} ${riskPct * 3.6}deg, rgba(255,255,255,0.06) 0deg)`, padding: 6 }}>
              <div style={{ width: '85%', height: '85%', background: '#1E1E1E', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span className="gauge-value" style={{ color: riskColor }}>{riskPct}%</span>
                <span className="gauge-label">{current.riskLevel} Risk</span>
              </div>
            </div>
            {latestPrediction && (
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 12, color: '#616161' }}>
                  Confidence: {((latestPrediction.confidence || 0) * 100).toFixed(1)}% · AI v{latestPrediction.modelVersion}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Metrics Grid */}
          <div className="card">
            <div className="section-title">Academic Performance</div>
            <div className="metric-grid">
              {[
                { label: 'CGPA', value: parseFloat(current.cgpa).toFixed(2), suffix: '/10', bad: parseFloat(current.cgpa) < 5 },
                { label: 'Attendance', value: parseFloat(current.attendancePercentage).toFixed(1), suffix: '%', bad: parseFloat(current.attendancePercentage) < 60 },
                { label: 'Assignment Rate', value: parseFloat(current.assignmentSubmissionRate).toFixed(1), suffix: '%', bad: parseFloat(current.assignmentSubmissionRate) < 50 },
                { label: 'LMS Activity', value: parseFloat(current.lmsActivityScore).toFixed(1), suffix: '/100', bad: parseFloat(current.lmsActivityScore) < 40 },
                { label: 'Internal Marks', value: parseFloat(current.internalMarks).toFixed(1), suffix: '/100', bad: parseFloat(current.internalMarks) < 40 },
                { label: 'Backlogs', value: current.backlogs, suffix: '', bad: parseInt(current.backlogs) > 2 },
              ].map((m, i) => (
                <div key={i} className="metric-card">
                  <div className="metric-value" style={{ color: m.bad ? '#E50914' : 'white' }}>
                    {m.value}<span style={{ fontSize: 14, color: '#616161' }}>{m.suffix}</span>
                  </div>
                  <div className="metric-label">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Radar Chart */}
          <div className="card">
            <div className="section-title">Performance Radar</div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9E9E9E', fontSize: 12 }} />
                <Radar name="Performance" dataKey="value" stroke={riskColor} fill={riskColor} fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Factors */}
          {factors.length > 0 && (
            <div className="card">
              <div className="section-title">Risk Factors</div>
              <div className="factor-list">
                {factors.map((f, i) => (
                  <div key={i} className="factor-item">
                    <MdWarning className="factor-icon" style={{ color: f.impact === 'High' ? '#E50914' : f.impact === 'Medium' ? '#F59E0B' : '#3B82F6' }} />
                    <span className="factor-name">{f.factor}</span>
                    <span style={{ fontSize: 12, color: '#616161' }}>Value: {f.value}</span>
                    <span className={`factor-impact factor-impact-${f.impact}`}>{f.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="card">
              <div className="section-title">AI Recommendations</div>
              <div className="recommendation-list">
                {recommendations.map((r, i) => (
                  <div key={i} className="recommendation-item">
                    <span>💡</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prediction History */}
          {current.predictions?.length > 0 && (
            <div className="card">
              <div className="section-title">Prediction History</div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Risk Level</th>
                      <th>Score</th>
                      <th>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {current.predictions.slice(0, 5).map((p) => (
                      <tr key={p.id}>
                        <td style={{ color: '#9E9E9E', fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td><span className={`badge badge-${p.riskLevel?.toLowerCase()}`}>{p.riskLevel}</span></td>
                        <td style={{ color: RISK_COLORS[p.riskLevel], fontWeight: 600 }}>{(p.riskScore * 100).toFixed(1)}%</td>
                        <td style={{ color: '#9E9E9E', fontSize: 13 }}>{((p.confidence || 0) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;
