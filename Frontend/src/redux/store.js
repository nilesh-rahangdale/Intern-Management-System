import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import internReducer from './slices/internSlice';
import certificateReducer from './slices/certificateSlice';
import certificateGenReducer from './slices/certificateGenSlice';
import certificateVerificationReducer from './slices/certificateVerificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    interns: internReducer,
    certificates: certificateReducer,
    certificateGen: certificateGenReducer,
    certificateVerification: certificateVerificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

export default store;
