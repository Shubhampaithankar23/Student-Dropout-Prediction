export const formatRiskScore = (score) => `${((score || 0) * 100).toFixed(1)}%`;

export const formatCgpa = (cgpa) => parseFloat(cgpa || 0).toFixed(2);

export const getRiskColor = (level) => {
  const colors = { High: '#E50914', Medium: '#F59E0B', Low: '#22C55E' };
  return colors[level] || '#9E9E9E';
};

export const getRiskBg = (level) => {
  const colors = { High: 'rgba(229,9,20,0.15)', Medium: 'rgba(245,158,11,0.15)', Low: 'rgba(34,197,94,0.15)' };
  return colors[level] || 'rgba(255,255,255,0.05)';
};

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const truncate = (str, len = 30) =>
  str && str.length > len ? str.substring(0, len) + '...' : str;

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (date) =>
  date ? new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
