import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    sidebarCollapsed: false,
    darkMode: true,
    activeModal: null,
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarCollapsed: (state, action) => { state.sidebarCollapsed = action.payload; },
    openModal: (state, action) => { state.activeModal = action.payload; },
    closeModal: (state) => { state.activeModal = null; },
  },
});

export const { toggleSidebar, setSidebarCollapsed, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
