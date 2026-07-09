import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

interface UiState {
  sidebarOpen: boolean;
  notifications: AppNotification[];
  settings: {
    theme: 'light' | 'dark';
    language: 'English' | 'Spanish' | 'French' | 'German';
    notificationsEnabled: boolean;
    emailAlerts: boolean;
    repName: string;
    repEmail: string;
    profilePhoto?: string;
  };
}

const initialState: UiState = {
  sidebarOpen: true,
  notifications: [
    {
      id: 'notif-1',
      title: 'HCP Added Successfully',
      message: 'Dr. Sunita Rao has been added to your HCP list.',
      time: '10 mins ago',
      read: false,
      type: 'success',
    },
    {
      id: 'notif-2',
      title: 'Pending Follow-up Alert',
      message: 'You have a pending follow-up with Dr. Anita Desai due today.',
      time: '2 hours ago',
      read: false,
      type: 'warning',
    },
    {
      id: 'notif-3',
      title: 'New Material Available',
      message: 'A new clinical summary for GliclaCare XR has been added by marketing.',
      time: 'Yesterday',
      read: true,
      type: 'info',
    }
  ],
  settings: {
    theme: 'light',
    language: 'English',
    notificationsEnabled: true,
    emailAlerts: true,
    repName: 'Amit Kumar',
    repEmail: 'amit.kumar@pharmaco.com',
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    addNotification: (state, action: PayloadAction<Omit<AppNotification, 'id' | 'time' | 'read'>>) => {
      const newNotif: AppNotification = {
        ...action.payload,
        id: `notif-${Date.now()}`,
        time: 'Just now',
        read: false,
      };
      state.notifications.unshift(newNotif);
    },
    updateSettings: (state, action: PayloadAction<Partial<UiState['settings']>>) => {
      state.settings = {
        ...state.settings,
        ...action.payload,
      };
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  markAllNotificationsRead,
  clearNotifications,
  addNotification,
  updateSettings,
} = uiSlice.actions;

export default uiSlice.reducer;
