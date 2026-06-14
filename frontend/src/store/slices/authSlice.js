import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Registration failed');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async ({ id, data: payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Update failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await api.post('/auth/logout'); } catch {}
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,
    initializing: true,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setToken: (state, action) => { state.token = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        toast.success(`Welcome back, ${action.payload.user.name}!`);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        toast.success('Registration successful! Please check your email.');
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      .addCase(getMe.pending, (state) => { state.initializing = true; })
      .addCase(getMe.fulfilled, (state, action) => {
        state.initializing = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.initializing = false;
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem('token');
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        toast.success('Logged out successfully');
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        toast.success('Profile updated successfully');
      });
  },
});

export const { clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
