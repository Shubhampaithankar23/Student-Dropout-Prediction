import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const { data } = await api.post('/auth/refresh', { refreshToken });
          localStorage.setItem('token', data.token);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 429) {
      toast.error('Too many requests. Please slow down.');
    }

    return Promise.reject(error);
  }
);

export const analyticsApi = {
  getOverview: () => api.get('/analytics/overview'),
  getTrends: (months = 6) => api.get('/analytics/trends', { params: { months } }),
  getPerformance: () => api.get('/analytics/performance'),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
};

export const counselingApi = {
  getAll: (params) => api.get('/counseling', { params }),
  create: (data) => api.post('/counseling', data),
  update: (id, data) => api.put(`/counseling/${id}`, data),
  delete: (id) => api.delete(`/counseling/${id}`),
  getAtRisk: () => api.get('/counseling/at-risk'),
};

export const reportApi = {
  downloadExcel: (params) => api.get('/reports/students/excel', { params, responseType: 'blob' }),
  downloadPDF: (params) => api.get('/reports/students/pdf', { params, responseType: 'blob' }),
};

export const userApi = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  updatePassword: (id, data) => api.put(`/users/${id}/password`, data),
  deactivate: (id) => api.delete(`/users/${id}`),
};

export default api;
