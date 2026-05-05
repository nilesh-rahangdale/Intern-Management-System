import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AUTH_STORAGE_KEY } from '../constants/authConstants';
import {
  initializeAuth,
  getCurrentUser,
  selectIsAuthInitialized,
  selectIsAuthenticated,
} from '../redux/slices/authSlice';

/**
 * AuthInitializer Component
 * 
 * Restores user session from localStorage on app load,
 * then validates restored session against backend.
 */
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const isInitialized = useSelector(selectIsAuthInitialized);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const hasValidatedSessionRef = useRef(false);
  const shouldValidateRestoredSessionRef = useRef(false);


  useEffect(() => {
    shouldValidateRestoredSessionRef.current = Boolean(localStorage.getItem(AUTH_STORAGE_KEY));
    // Restore session from localStorage (synchronous action)
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    // Validate restored session with backend (supports HttpOnly JWT cookies).
    if (
      !isInitialized ||
      !isAuthenticated ||
      hasValidatedSessionRef.current ||
      !shouldValidateRestoredSessionRef.current
    ) {
      return;
    }

    hasValidatedSessionRef.current = true;
    dispatch(getCurrentUser());
  }, [dispatch, isInitialized, isAuthenticated]);


  // Show loading screen while initializing (should be instant)
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    );
  }

  // Initialized, render children
  return <>{children}</>;
};

export default AuthInitializer;
