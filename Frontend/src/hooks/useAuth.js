import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  selectAuth,
  selectIsAuthenticated,
  selectCurrentUser,
  selectIsAuthInitialized,
  selectAuthLoading,
  selectSessionExpiry,
  selectUserRoles,
  selectHasRole,
  loginUser as loginAction,
  logoutUser as logoutAction,
  getCurrentUser as getCurrentUserAction,
  refreshUserData,
  updateUserLocally,
  updateLastActivity,
  forceLogout,
  clearError,
  clearMessage,
} from '../redux/slices/authSlice';

/**
 * Custom hook for authentication
 * Provides easy access to auth state and actions
 * 
 * @returns {Object} Auth state and methods
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const isInitialized = useSelector(selectIsAuthInitialized);
  const loading = useSelector(selectAuthLoading);
  const sessionExpiry = useSelector(selectSessionExpiry);
  const userRoles = useSelector(selectUserRoles);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    const result = selectHasRole(role)({ auth });
    
    return result;
  }, [auth]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles) => {
    return roles.some(role => hasRole(role));
  }, [hasRole]);

  // Check if user has all specified roles
  const hasAllRoles = useCallback((roles) => {
    return roles.every(role => hasRole(role));
  }, [hasRole]);

  // Check if session is expired
  const isSessionExpired = useCallback(() => {
    if (!sessionExpiry) return false;
    return Date.now() > sessionExpiry;
  }, [sessionExpiry]);

  // Get time remaining in session (in minutes)
  const getSessionTimeRemaining = useCallback(() => {
    if (!sessionExpiry) return 0;
    const remaining = sessionExpiry - Date.now();
    return Math.max(0, Math.floor(remaining / 1000 / 60));
  }, [sessionExpiry]);

  // Actions
  const login = useCallback(async (credentials) => {
    return dispatch(loginAction(credentials));
  }, [dispatch]);

  const logout = useCallback(async () => {
    return dispatch(logoutAction());
  }, [dispatch]);

  const getCurrentUser = useCallback(async () => {
    return dispatch(getCurrentUserAction());
  }, [dispatch]);

  const refreshUser = useCallback(async () => {
    return dispatch(refreshUserData());
  }, [dispatch]);

  const updateUser = useCallback((userData) => {
    dispatch(updateUserLocally(userData));
  }, [dispatch]);

  const trackActivity = useCallback(() => {
    dispatch(updateLastActivity());
  }, [dispatch]);

  const forceLogoutUser = useCallback(() => {
    dispatch(forceLogout());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearAuthMessage = useCallback(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  return {
    // State
    auth,
    user,
    isAuthenticated,
    isInitialized,
    loading,
    error: auth.error,
    message: auth.message,
    sessionExpiry,
    userRoles,
    
    // Role checks
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Session checks
    isSessionExpired,
    getSessionTimeRemaining,
    
    // Actions
    login,
    logout,
    getCurrentUser,
    refreshUser,
    updateUser,
    trackActivity,
    forceLogoutUser,
    clearAuthError,
    clearAuthMessage,
  };
};

export default useAuth;
