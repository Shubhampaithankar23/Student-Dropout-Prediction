import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { createStudent, fetchStudent, updateStudent } from '../../store/slices/studentSlice';
import { MdArrowBack, MdSave } from 'react-icons/md';
import './Dashboard.css';

const FIELD_GROUPS = [
  {
    title: 'Personal Information',
    fields: [
      { name: 'studentId', label: 'Student ID', type: 'text', placeholder: 'e.g. STU001', required: true },
      { name: 'name', label: 'Full Name', type: 'text', placeholder: 'e.g. John Smith', required: true },
      { name: 'email', label: 'Email Address', type: 'email', placeholder: 'student@example.com', required: true },
      { name: 'age', label: 'Age', type: 'number', placeholder: '18-30', min: 15, max: 60, required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
      { name: 'department', label: 'Department', type: 'text', placeholder: 'Computer Science' },
      { name: 'semester', label: 'Semester', type: 'number', placeholder: '1-12', min: 1, max: 12 },
      { name: 'financialStatus', label: 'Financial Status', type: 'select', options: ['Good', 'Average', 'Poor'], required: true },
    ],
  },
  {
    title: 'Academic Metrics',
    fields: [
      { name: 'cgpa', label: 'CGPA', type: 'number', placeholder: '0.0 - 10.0', step: '0.01', min: 0, max: 10, required: true },
      { name: 'attendancePercentage', label: 'Attendance %', type: 'number', placeholder: '0 - 100', step: '0.1', min: 0, max: 100, required: true },
      { name: 'assignmentSubmissionRate', label: 'Assignment Submission %', type: 'number', placeholder: '0 - 100', step: '0.1', min: 0, max: 100, required: true },
      { name: 'lmsActivityScore', label: 'LMS Activity Score', type: 'number', placeholder: '0 - 100', step: '0.1', min: 0, max: 100, required: true },
      { name: 'internalMarks', label: 'Internal Marks', type: 'number', placeholder: '0 - 100', step: '0.1', min: 0, max: 100, required: true },
      { name: 'backlogs', label: 'Number of Backlogs', type: 'number', placeholder: '0', min: 0, required: true },
      { name: 'participationScore', label: 'Participation Score', type: 'number', placeholder: '0 - 100', step: '0.1', min: 0, max: 100, required: true },
      { name: 'dropoutStatus', label: 'Already Dropped Out?', type: 'select', options: ['false', 'true'] },
    ],
  },
];

const defaultForm = {
  studentId: '', name: '', email: '', age: '', gender: 'Male',
  department: '', semester: '', financialStatus: 'Average',
  cgpa: '', attendancePercentage: '', assignmentSubmissionRate: '',
  lmsActivityScore: '', internalMarks: '', backlogs: '0',
  participationScore: '', dropoutStatus: 'false',
};

const AddStudentPage = ({ editMode = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { loading, current } = useSelector((s) => s.students);
  const [form, setForm] = useState(defaultForm);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    if (editMode && id) dispatch(fetchStudent(id));
  }, [dispatch, editMode, id]);

  useEffect(() => {
    if (!editMode || !current || current.id !== id) return;
    const nextForm = {};
    Object.keys(defaultForm).forEach((key) => {
      nextForm[key] = current[key] === null || current[key] === undefined
        ? defaultForm[key]
        : String(current[key]);
    });
    setForm(nextForm);
  }, [current, editMode, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, age: parseInt(form.age), backlogs: parseInt(form.backlogs), dropoutStatus: form.dropoutStatus === 'true' };
    const result = editMode
      ? await dispatch(updateStudent({ id, data: payload }))
      : await dispatch(createStudent(payload));
    if (!result.error) {
      if (editMode) navigate(`/dashboard/students/${id}`);
      else if (result.payload?.prediction) setPrediction(result.payload.prediction);
      else navigate('/dashboard/students');
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (prediction) {
    const COLORS = { High: '#E50914', Medium: '#F59E0B', Low: '#22C55E' };
    return (
      <div className="dashboard-page">
        <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>
            {prediction.riskLevel === 'High' ? '⚠️' : prediction.riskLevel === 'Medium' ? '🟡' : '✅'}
          </div>
          <h2 style={{ color: 'white', marginBottom: 8 }}>Prediction Complete!</h2>
          <p style={{ color: '#9E9E9E', marginBottom: 24 }}>Student added successfully with AI risk assessment</p>
          <div style={{ background: `${COLORS[prediction.riskLevel]}15`, border: `1px solid ${COLORS[prediction.riskLevel]}40`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: COLORS[prediction.riskLevel], fontFamily: 'Space Grotesk, sans-serif' }}>
              {(prediction.riskScore * 100).toFixed(1)}%
            </div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{prediction.riskLevel} Risk</div>
            <div style={{ color: '#9E9E9E', fontSize: 13 }}>Confidence: {(prediction.confidence * 100).toFixed(1)}%</div>
          </div>
          {prediction.recommendations?.length > 0 && (
            <div style={{ textAlign: 'left', marginBottom: 24 }}>
              <div className="section-title">AI Recommendations</div>
              {prediction.recommendations.slice(0, 3).map((r, i) => (
                <div key={i} className="recommendation-item" style={{ marginBottom: 6 }}>
                  <span>💡</span><span>{r}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn-secondary" onClick={() => { setForm(defaultForm); setPrediction(null); }}>Add Another</button>
            <Link to="/dashboard/students" className="btn-primary">View All Students</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <Link to="/dashboard/students" className="btn-ghost"><MdArrowBack /> Back</Link>
      </div>
      <div>
        <h1 className="page-title">{editMode ? 'Edit Student' : 'Add Student'}</h1>
        <p className="page-subtitle">{editMode ? 'Update student details and refresh the risk prediction' : 'Enter student details to run AI dropout risk prediction'}</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {FIELD_GROUPS.map((group, gi) => (
          <div key={gi} className="card">
            <div className="section-title">{group.title}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {group.fields.map((field) => (
                <div key={field.name} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{field.label}</label>
                  {field.type === 'select' ? (
                    <select className="form-input" value={form[field.name]} onChange={set(field.name)} required={field.required}>
                      {field.options.map(o => <option key={o} value={o}>{o === 'true' ? 'Yes' : o === 'false' ? 'No' : o}</option>)}
                    </select>
                  ) : (
                    <input
                      className="form-input"
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.name]}
                      onChange={set(field.name)}
                      required={field.required}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Link to="/dashboard/students" className="btn-secondary">Cancel</Link>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : null}
            {loading ? 'Saving Student...' : <><MdSave /> {editMode ? 'Save & Recalculate Risk' : 'Add & Predict Risk'}</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudentPage;
