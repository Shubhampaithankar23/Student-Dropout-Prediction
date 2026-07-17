import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents, deleteStudent, uploadCSV } from '../../store/slices/studentSlice';
import { MdSearch, MdAdd, MdUpload, MdDelete, MdVisibility, MdRefresh, MdFileDownload } from 'react-icons/md';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { reportApi } from '../../services/api';
import './Dashboard.css';

const RISK_COLORS = { High: '#E50914', Medium: '#F59E0B', Low: '#22C55E' };

const StudentsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { list, total, totalPages, loading, uploading } = useSelector((s) => s.students);
  const { user } = useSelector((s) => s.auth);

  const [filters, setFilters] = useState({
    search: '',
    riskLevel: searchParams.get('riskLevel') || '',
    gender: '',
    financialStatus: '',
    page: 1,
    limit: 20,
  });
  const [showUpload, setShowUpload] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const loadStudents = useCallback(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    dispatch(fetchStudents(params));
  }, [dispatch, filters]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const onDrop = useCallback(async (files) => {
    if (files[0]) {
      await dispatch(uploadCSV(files[0]));
      setShowUpload(false);
      loadStudents();
    }
  }, [dispatch, loadStudents]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'text/csv': ['.csv'] }, maxFiles: 1,
  });

  const handleDelete = async (id) => {
    await dispatch(deleteStudent(id));
    setDeleteId(null);
  };

  const downloadReport = async (type) => {
    try {
      const res = type === 'excel'
        ? await reportApi.downloadExcel({ riskLevel: filters.riskLevel })
        : await reportApi.downloadPDF({ riskLevel: filters.riskLevel });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `students-report.${type === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  const setFilter = (key) => (e) => setFilters({ ...filters, [key]: e.target.value, page: 1 });

  return (
    <div className="table-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{total} total students{filters.riskLevel ? ` · filtered by ${filters.riskLevel} risk` : ''}</p>
        </div>
        <div className="header-actions">
          <button className="btn-ghost" onClick={() => downloadReport('excel')} title="Export Excel">
            <MdFileDownload /> Excel
          </button>
          <button className="btn-ghost" onClick={() => downloadReport('pdf')} title="Export PDF">
            <MdFileDownload /> PDF
          </button>
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <>
              <button className="btn-secondary" onClick={() => setShowUpload(!showUpload)}>
                <MdUpload /> Upload CSV
              </button>
              <Link to="/dashboard/students/add" className="btn-primary">
                <MdAdd /> Add Student
              </Link>
            </>
          )}
        </div>
      </div>

      {/* CSV Upload */}
      {showUpload && (
        <div className="card" style={{ borderColor: 'rgba(229,9,20,0.2)' }}>
          <h3 style={{ marginBottom: 16, fontSize: 15, color: 'white' }}>Upload Student Dataset (CSV)</h3>
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <MdUpload style={{ fontSize: 40, color: '#616161', marginBottom: 10 }} />
              {isDragActive ? <p style={{ color: '#E50914' }}>Drop the CSV here...</p> : (
                <>
                  <p style={{ color: '#9E9E9E', marginBottom: 8 }}>Drag & drop a CSV file, or click to browse</p>
                  <p style={{ color: '#424242', fontSize: 12 }}>Columns: studentId, name, email, age, gender, cgpa, attendancePercentage, assignmentSubmissionRate, lmsActivityScore, internalMarks, backlogs, participationScore, financialStatus</p>
                </>
              )}
              {uploading && <div className="spinner" style={{ margin: '16px auto 0' }} />}
            </div>
          </div>
          <a href="/sample-students.csv" download className="btn-ghost" style={{ marginTop: 12, fontSize: 13 }}>
            Download sample CSV template
          </a>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <MdSearch className="search-icon" />
          <input
            className="search-input"
            placeholder="Search by name, ID or email..."
            value={filters.search}
            onChange={setFilter('search')}
          />
        </div>
        <select className="filter-select" value={filters.riskLevel} onChange={setFilter('riskLevel')}>
          <option value="">All Risk Levels</option>
          <option value="High">High Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="Low">Low Risk</option>
        </select>
        <select className="filter-select" value={filters.gender} onChange={setFilter('gender')}>
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <select className="filter-select" value={filters.financialStatus} onChange={setFilter('financialStatus')}>
          <option value="">All Financial</option>
          <option value="Good">Good</option>
          <option value="Average">Average</option>
          <option value="Poor">Poor</option>
        </select>
        <button className="btn-ghost" onClick={loadStudents}><MdRefresh /></button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>ID</th>
                <th>Department</th>
                <th>CGPA</th>
                <th>Attendance</th>
                <th>Risk Level</th>
                <th>Risk Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 16, width: '80%', borderRadius: 4 }} /></td>
                    ))}
                  </tr>
                ))
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <MdSearch style={{ fontSize: 48, color: '#424242', marginBottom: 12 }} />
                      <h3>No students found</h3>
                      <p>Try adjusting filters or add students</p>
                    </div>
                  </td>
                </tr>
              ) : (
                list.map((student) => (
                  <tr key={student.id} className="student-table-row" onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                    <td>
                      <div className="student-name-cell">
                        <div className="student-cell-avatar" style={{ background: RISK_COLORS[student.riskLevel] + '20', color: RISK_COLORS[student.riskLevel] }}>
                          {student.name?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>{student.name}</div>
                          <div style={{ fontSize: 12, color: '#616161' }}>{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#9E9E9E', fontSize: 13 }}>{student.studentId}</td>
                    <td style={{ color: '#9E9E9E', fontSize: 13 }}>{student.department || '—'}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: parseFloat(student.cgpa) < 5 ? '#E50914' : parseFloat(student.cgpa) < 7 ? '#F59E0B' : '#22C55E' }}>
                        {parseFloat(student.cgpa).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: parseFloat(student.attendancePercentage) < 60 ? '#E50914' : '#9E9E9E' }}>
                        {parseFloat(student.attendancePercentage).toFixed(1)}%
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <span className={`badge badge-${student.riskLevel?.toLowerCase()}`}>{student.riskLevel}</span>
                    </td>
                    <td>
                      <div className="risk-score-bar">
                        <div className="risk-score-track">
                          <div className="risk-score-fill" style={{
                            width: `${(student.riskScore || 0) * 100}%`,
                            background: RISK_COLORS[student.riskLevel],
                          }} />
                        </div>
                        <span className="risk-score-text" style={{ color: RISK_COLORS[student.riskLevel] }}>
                          {((student.riskScore || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Link to={`/dashboard/students/${student.id}`} className="btn-ghost" style={{ padding: '6px 8px' }} title="View">
                          <MdVisibility />
                        </Link>
                        {(user?.role === 'admin') && (
                          <button className="btn-ghost" style={{ padding: '6px 8px', color: '#E50914' }} title="Delete" onClick={() => setDeleteId(student.id)}>
                            <MdDelete />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">Showing {list.length} of {total} students</span>
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

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h3 style={{ color: '#E50914', marginBottom: 12 }}>Confirm Delete</h3>
            <p style={{ color: '#9E9E9E', marginBottom: 24 }}>Are you sure you want to remove this student? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-secondary" onClick={() => setDeleteId(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="btn-primary" onClick={() => handleDelete(deleteId)} style={{ flex: 1, justifyContent: 'center', background: '#E50914' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.dropzone { border: 2px dashed rgba(255,255,255,0.1); border-radius: 12px; cursor: pointer; transition: all 0.2s; }
        .dropzone:hover, .dropzone.active { border-color: #E50914; background: rgba(229,9,20,0.04); }`}
      </style>
    </div>
  );
};

export default StudentsPage;
