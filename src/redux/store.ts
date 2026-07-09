import { configureStore } from '@reduxjs/toolkit';
import hcpReducer from './slices/hcpSlice';
import interactionReducer from './slices/interactionSlice';
import chatReducer from './slices/chatSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    hcp: hcpReducer,
    interaction: interactionReducer,
    chat: chatReducer,
    ui: uiReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
