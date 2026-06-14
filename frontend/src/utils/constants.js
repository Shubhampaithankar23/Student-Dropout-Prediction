export const RISK_LEVELS = ['Low', 'Medium', 'High'];
export const GENDERS = ['Male', 'Female', 'Other'];
export const FINANCIAL_STATUS = ['Good', 'Average', 'Poor'];
export const SESSION_TYPES = ['Academic', 'Personal', 'Financial', 'Career', 'Mental Health'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const ROLES = ['admin', 'teacher', 'counselor'];

export const RISK_COLORS = {
  High:   '#E50914',
  Medium: '#F59E0B',
  Low:    '#22C55E',
};

export const ROLE_COLORS = {
  admin:     '#E50914',
  teacher:   '#3B82F6',
  counselor: '#22C55E',
};

export const CHART_COLORS = ['#E50914', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'];

export const API_BASE = process.env.REACT_APP_API_URL || '/api';
