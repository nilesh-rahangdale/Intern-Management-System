import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import authApi from '../../api/authApi';
import { AUTH_STORAGE_KEY } from '../../constants/authConstants';

//  Token Management Utilities 

// Normalize user payload for APIs that may return either `{ data: user }` or `user` directly.
const extractUserFromPayload = (payload) => {
  if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload && typeof payload === 'object' && payload.roles) {
    return payload;
  }

  return null;
};

// Load persisted auth state from localStorage
const loadPersistedAuthState = () => {
  try {
    const persistedState = localStorage.getItem(AUTH_STORAGE_KEY);
    if (persistedState) {
      const parsed = JSON.parse(persistedState);
      if (parsed.isAuthenticated && parsed.user) {
        return {
          user: parsed.user,
          isAuthenticated: true,
        };
      }
    }
  } catch (error) {
    console.error('Failed to load persisted auth state:', error);
  }
  return {
    user: null,
    isAuthenticated: false,
  };
};

// Save auth state to localStorage
const persistAuthState = (user, isAuthenticated) => {
  try {
    if (isAuthenticated && user) {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          user,
          isAuthenticated,
          timestamp: Date.now(),
        })
      );
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to persist auth state:', error);
  }
};

// Clear persisted auth state
const clearPersistedAuthState = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear persisted auth state:', error);
  }
};

//  Initial State

// Load persisted state on initialization
const persistedState = loadPersistedAuthState();

const initialState = {
  user: persistedState.user,
  isAuthenticated: persistedState.isAuthenticated,
  isInitialized: false, // Track if auth has been initialized
  loading: false,
  authLoading: false, // Separate loading for auth initialization
  error: null,
  message: null,
  lastActivity: Date.now(), // Track last user activity
  sessionExpiry: null, // Track session expiry time (10 hours)
};

//  AsyncThunks 

// AsyncThunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.loginUser(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Login failed' }
      );
    }
  }
);

// AsyncThunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.logoutUser();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Logout failed' }
      );
    }
  }
);

// AsyncThunk for getting current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      return response;
    } catch (error) {
      return rejectWithValue({
        ...(error.response?.data || {}),
        status: error.response?.status,
        message: error.response?.data?.message || 'Failed to fetch user',
      });
    }
  }
);

// AsyncThunk for confirming email
export const confirmEmail = createAsyncThunk(
  'auth/confirmEmail',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.confirmEmail(data);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Email confirmation failed' }
      );
    }
  }
);


// AsyncThunk for refreshing user data
export const refreshUserData = createAsyncThunk(
  'auth/refreshUserData',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      
      // Only refresh if user is authenticated
      if (!auth.isAuthenticated) {
        return rejectWithValue({ message: 'Not authenticated' });
      }

      const response = await authApi.getCurrentUser();
      return response;
    } catch (error) {
      return rejectWithValue({
        ...(error.response?.data || {}),
        status: error.response?.status,
        message: error.response?.data?.message || 'Failed to refresh user data',
      });
    }
  }
);

//  Auth Slice 

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Initialize auth from localStorage 
    initializeAuth: (state) => {
      console.log('initializeAuth: Checking localStorage');
      const persistedState = loadPersistedAuthState();
      
      state.isInitialized = true;
      
      if (persistedState.isAuthenticated && persistedState.user) {
        console.log('initializeAuth: Restoring session for:', persistedState.user.email);
        state.isAuthenticated = true;
        state.user = persistedState.user;
        state.lastActivity = Date.now();
        state.sessionExpiry = Date.now() + 10 * 60 * 60 * 1000;
      } else {
        console.log('initializeAuth: No persisted session found');
        state.isAuthenticated = false;
        state.user = null;
        state.sessionExpiry = null;
      }
    },
    // Synchronous actions
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    resetAuthState: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = false;
      state.loading = false;
      state.authLoading = false;
      state.error = null;
      state.message = null;
      state.lastActivity = Date.now();
      state.sessionExpiry = null;
      clearPersistedAuthState();
    },
    // Update user data without API call (for local updates)
    updateUserLocally: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        persistAuthState(state.user, state.isAuthenticated);
      }
    },
    // Track user activity
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    // Force logout (for session expiry, token invalidation)
    forceLogout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = 'Session expired. Please login again.';
      state.sessionExpiry = null;
      clearPersistedAuthState();
    },
    // Set session expiry
    setSessionExpiry: (state, action) => {
      state.sessionExpiry = action.payload;
    },
  },
  extraReducers: (builder) => {
    //  Login User 
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const userData = extractUserFromPayload(action.payload) || action.payload;
        console.log('loginUser.fulfilled - payload:', action.payload);
        state.loading = false;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.user = userData;
        state.message = 'Login successful';
        state.error = null;
        state.lastActivity = Date.now();
        // Set session expiry (10 hours from now, matching JWT expiry)
        state.sessionExpiry = Date.now() + 10 * 60 * 60 * 1000;
        persistAuthState(userData, true);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.user = null;
        state.sessionExpiry = null;
        state.error = action.payload?.message || 'Login failed';
        clearPersistedAuthState();
      });

    //  Logout User 
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.message = action.payload.message;
        state.error = null;
        state.sessionExpiry = null;
        clearPersistedAuthState();
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        // Even if logout fails on server, clear local state
        state.isAuthenticated = false;
        state.user = null;
        state.sessionExpiry = null;
        state.error = action.payload?.message || 'Logout failed';
        clearPersistedAuthState();
      });

    //  Get Current User 
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        const userData = extractUserFromPayload(action.payload);
        state.loading = false;
        state.isAuthenticated = true;
        if (userData) {
          state.user = userData;
          persistAuthState(userData, true);
        }
        state.error = null;
        state.lastActivity = Date.now();
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        const status = action.payload?.status;
        const message = action.payload?.message || 'Failed to fetch user';
        const isUnauthorized =
          status === 401 ||
          status === 403 ||
          message.toLowerCase().includes('unauthorized') ||
          message.toLowerCase().includes('expired');

        state.error = message;

        if (isUnauthorized) {
          state.isAuthenticated = false;
          state.user = null;
          state.sessionExpiry = null;
          clearPersistedAuthState();
        }
      });

    //  Confirm Email 
    builder
      .addCase(confirmEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(confirmEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(confirmEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Email confirmation failed';
      });

    //  Initialize Authentication 

    builder
      .addCase(refreshUserData.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshUserData.fulfilled, (state, action) => {
        const userData = extractUserFromPayload(action.payload);
        state.loading = false;
        if (userData) {
          state.user = userData;
          persistAuthState(userData, true);
        }
        state.lastActivity = Date.now();
      })
      .addCase(refreshUserData.rejected, (state, action) => {
        state.loading = false;
        // If refresh fails due to invalid token, force logout
        const status = action.payload?.status;
        const message = action.payload?.message || '';
        const isUnauthorized =
          status === 401 ||
          status === 403 ||
          message.toLowerCase().includes('unauthorized') ||
          message.toLowerCase().includes('expired');

        if (isUnauthorized) {
          state.isAuthenticated = false;
          state.user = null;
          state.sessionExpiry = null;
          state.error = 'Session expired. Please login again.';
          clearPersistedAuthState();
        } else {
          state.error = message || 'Failed to refresh user data';
        }
      });
  },
});

//  Export Actions 

export const { 
  initializeAuth,
  clearError, 
  clearMessage, 
  resetAuthState,
  updateUserLocally,
  updateLastActivity,
  forceLogout,
  setSessionExpiry,
} = authSlice.actions;

//  Selectors 

export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthInitialized = (state) => state.auth.isInitialized;
export const selectAuthLoading = (state) => state.auth.loading || state.auth.authLoading;
export const selectSessionExpiry = (state) => state.auth.sessionExpiry;

// Memoized selector to prevent unnecessary rerenders
const EMPTY_ROLES_ARRAY = [];
export const selectUserRoles = createSelector(
  [selectCurrentUser],
  (user) => user?.roles || EMPTY_ROLES_ARRAY
);

export const selectHasRole = (role) => (state) => 
  state.auth.user?.roles?.includes(role) || false;

//  Export Reducer 

export default authSlice.reducer;
