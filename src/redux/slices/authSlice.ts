import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/auth';

export interface UserState {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

interface AuthState {
  user: UserState | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

// Async Thunk to fetch current user profile
export const fetchCurrentUserThunk = createAsyncThunk(
  'auth/fetchCurrentUser',
  async () => {
    return await authApi.getCurrentUser();
  }
);

// Helper to generate a display name from email address prefix
export const getDisplayNameFromEmail = (email: string): string => {
  const prefix = email.split('@')[0];
  return prefix
    .split(/[\._\-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

// Helper to generate initials from email address prefix
export const getInitialsFromEmail = (email: string): string => {
  const name = getDisplayNameFromEmail(email);
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUserThunk.fulfilled, (state, action: PayloadAction<UserState>) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to authenticate user session';
        state.user = null;
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
