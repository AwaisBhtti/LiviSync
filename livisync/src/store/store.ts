import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import hostelReducer from './slices/hostelSlice';
import roommateReducer from './slices/roommateSlice';
import matchReducer from './slices/matchSlice';
import adminReducer from './slices/adminSlice';
import toastReducer from './slices/toastSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hostels: hostelReducer,
    roommates: roommateReducer,
    matches: matchReducer,
    admin: adminReducer,
    toast: toastReducer,
  },
  // Redux Toolkit configureStore includes redux-thunk automatically.
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
