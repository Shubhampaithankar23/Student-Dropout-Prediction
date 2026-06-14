import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/notifications?limit=50');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const markAsRead = createAsyncThunk('notifications/markRead', async (id) => {
  await api.patch(`/notifications/${id}/read`);
  return id;
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async () => {
  await api.patch('/notifications/read-all');
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { list: [], unreadCount: 0, loading: false },
  reducers: {
    addNotification: (state, action) => {
      state.list.unshift(action.payload);
      if (!action.payload.isRead) state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const n = state.list.find(n => n.id === action.payload);
        if (n && !n.isRead) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.list.forEach(n => { n.isRead = true; });
        state.unreadCount = 0;
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
