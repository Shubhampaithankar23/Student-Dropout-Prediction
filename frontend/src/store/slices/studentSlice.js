import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchStudents = createAsyncThunk('students/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/students', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const fetchStudent = createAsyncThunk('students/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/students/${id}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const createStudent = createAsyncThunk('students/create', async (studentData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/students', studentData);
    toast.success('Student added successfully!');
    return data;
  } catch (err) {
    const msg = err.response?.data?.error || 'Failed to add student';
    toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const updateStudent = createAsyncThunk('students/update', async ({ id, data: payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/students/${id}`, payload);
    toast.success('Student updated successfully!');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const deleteStudent = createAsyncThunk('students/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/students/${id}`);
    toast.success('Student removed successfully');
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const uploadCSV = createAsyncThunk('students/uploadCSV', async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/students/upload/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    toast.success(`CSV processed: ${data.summary.created} students added`);
    return data;
  } catch (err) {
    toast.error('CSV upload failed');
    return rejectWithValue(err.response?.data?.error);
  }
});

export const predictStudent = createAsyncThunk('students/predict', async (studentId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/predictions/predict/${studentId}`);
    toast.success('Prediction updated!');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

const studentSlice = createSlice({
  name: 'students',
  initialState: {
    list: [],
    current: null,
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    uploading: false,
    error: null,
    filters: { search: '', riskLevel: '', gender: '', financialStatus: '' },
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    clearCurrent: (state) => { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => { state.loading = true; })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.students;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchStudent.pending, (state) => {
        state.loading = true;
        state.current = null;
      })
      .addCase(fetchStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.student;
      })
      .addCase(fetchStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.list.unshift(action.payload.student);
        state.total += 1;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        const idx = state.list.findIndex(s => s.id === action.payload.student.id);
        if (idx !== -1) state.list[idx] = action.payload.student;
        if (state.current?.id === action.payload.student.id) state.current = action.payload.student;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.list = state.list.filter(s => s.id !== action.payload);
        state.total -= 1;
      })
      .addCase(uploadCSV.pending, (state) => { state.uploading = true; })
      .addCase(uploadCSV.fulfilled, (state) => { state.uploading = false; })
      .addCase(uploadCSV.rejected, (state) => { state.uploading = false; });
  },
});

export const { setFilters, clearCurrent } = studentSlice.actions;
export default studentSlice.reducer;
