import React, { useState } from 'react';
import { MdFileDownload, MdDescription, MdTableChart, MdWarning } from 'react-icons/md';
import { reportApi } from '../../services/api';
import toast from 'react-hot-toast';
import './Dashboard.css';

const ReportsPage = () => {
  const [riskFilter, setRiskFilter] = useState('');
  const [loading, setLoading] = useState({ excel: false, pdf: false });

  const download = async (type, explicitRiskFilter = riskFilter) => {
    setLoading({ ...loading, [type]: true });
    try {
      const params = {};
      if (explicitRiskFilter) params.riskLevel = explicitRiskFilter;
      const res = type === 'excel' ? await reportApi.downloadExcel(params) : await reportApi.downloadPDF(params);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `students-report.${type === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${type.toUpperCase()} report downloaded!`);
    } catch { toast.error('Download failed'); }
    setLoading({ ...loading, [type]: false });
  };

  const reports = [
    {
      title: 'Excel Student Report',
      desc: 'Complete student data with risk scores, CGPA, attendance, and all metrics in spreadsheet format.',
      icon: <MdTableChart />, color: '#22C55E', type: 'excel',
      features: ['All student metrics', 'Color-coded risk levels', 'Sortable columns', 'Formula-ready'],
    },
    {
      title: 'PDF Risk Report',
      desc: 'Formatted PDF report with charts, risk distribution, and student summary for institutional review.',
      icon: <MdDescription />, color: '#E50914', type: 'pdf',
      features: ['Professional layout', 'Summary statistics', 'Student risk table', 'Print-ready'],
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate and download detailed student reports</p>
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Filter by Risk Level</label>
            <select className="filter-select" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} style={{ minWidth: 200 }}>
              <option value="">All Students</option>
              <option value="High">High Risk Only</option>
              <option value="Medium">Medium Risk Only</option>
              <option value="Low">Low Risk Only</option>
            </select>
          </div>
          <div style={{ color: '#9E9E9E', fontSize: 13, marginTop: 20 }}>
            {riskFilter ? `Exporting ${riskFilter} risk students only` : 'Exporting all students'}
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid-2">
        {reports.map((r, i) => (
          <div key={i} className="report-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="report-icon" style={{ background: `${r.color}20`, color: r.color }}>
                {r.icon}
              </div>
              <div>
                <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{r.title}</h3>
                <p style={{ color: '#9E9E9E', fontSize: 13, lineHeight: 1.5 }}>{r.desc}</p>
              </div>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
              {r.features.map((f, j) => (
                <li key={j} style={{ fontSize: 13, color: '#9E9E9E', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: r.color }}>✓</span> {f}
                </li>
              ))}
            </ul>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => download(r.type)}
              disabled={loading[r.type]}
            >
              {loading[r.type] ? <span className="btn-spinner" /> : <MdFileDownload />}
              {loading[r.type] ? 'Generating...' : `Download ${r.type.toUpperCase()}`}
            </button>
          </div>
        ))}
      </div>

      {/* High Risk Alert Report */}
      <div className="card" style={{ borderColor: 'rgba(229,9,20,0.2)', background: 'rgba(229,9,20,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <MdWarning style={{ fontSize: 32, color: '#E50914', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <h3 style={{ color: 'white', marginBottom: 4 }}>High Risk Students Report</h3>
            <p style={{ color: '#9E9E9E', fontSize: 14 }}>Quick export of only high-risk students for immediate counselor action.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary" style={{ background: 'rgba(229,9,20,0.8)' }} onClick={() => { setRiskFilter('High'); download('excel', 'High'); }}>
              <MdFileDownload /> Excel
            </button>
            <button className="btn-primary" style={{ background: 'rgba(229,9,20,0.8)' }} onClick={() => { setRiskFilter('High'); download('pdf', 'High'); }}>
              <MdFileDownload /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <div className="section-title">How to Use Reports</div>
        <div className="grid-2" style={{ gap: 12 }}>
          {[
            { step: '1', text: 'Select a risk level filter (optional) to narrow down the report scope.' },
            { step: '2', text: 'Click the Excel or PDF download button to generate the report.' },
            { step: '3', text: 'The file will download automatically to your device.' },
            { step: '4', text: 'Use the High Risk report for immediate counseling intervention planning.' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
              <div style={{ width: 28, height: 28, background: 'rgba(229,9,20,0.15)', color: '#E50914', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
              <p style={{ color: '#9E9E9E', fontSize: 13, lineHeight: 1.5 }}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
