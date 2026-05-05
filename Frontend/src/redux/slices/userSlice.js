import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userApi from '../../api/userApi';

// Initial state
const initialState = {
  users: [],
  selectedUser: null,
  searchResults: [], 
  dashboardStats: null, 
  loading: false,
  error: null,
  message: null,
  actionLoading: false, 
};

// AsyncThunk for registering a new user
export const registerUser = createAsyncThunk(
  'users/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userApi.registerUser(userData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to register user' }
      );
    }
  }
);

// AsyncThunk for getting user by ID
export const getUserById = createAsyncThunk(
  'users/getUserById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await userApi.getUserById(id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch user' }
      );
    }
  }
);

// AsyncThunk for getting all users
export const getAllUsers = createAsyncThunk(
  'users/getAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getAllUsers();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch users' }
      );
    }
  }
);

// AsyncThunk for updating user
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await userApi.updateUser(id, userData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to update user' }
      );
    }
  }
);

// AsyncThunk for changing password
export const changePassword = createAsyncThunk(
  'users/changePassword',
  async ({ id, passwordData }, { rejectWithValue }) => {
    try {
      const response = await userApi.changePassword(id, passwordData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to change password' }
      );
    }
  }
);

// AsyncThunk for deleting user
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await userApi.deleteUser(id);
      return { id, response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to delete user' }
      );
    }
  }
);

// AsyncThunk for changing user status
export const changeUserStatus = createAsyncThunk(
  'users/changeUserStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await userApi.changeUserStatus(id, status);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to change user status' }
      );
    }
  }
);

// AsyncThunk for searching users by name
export const searchUsersByName = createAsyncThunk(
  'users/searchUsersByName',
  async (name, { rejectWithValue }) => {
    try {
      const response = await userApi.searchUsersByName(name);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to search users' }
      );
    }
  }
);

// AsyncThunk for getting dashboard statistics
export const getUserDashboardStats = createAsyncThunk(
  'users/getUserDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getUserDashboardStats();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch dashboard statistics' }
      );
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Synchronous actions
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    resetUserState: (state) => {
      state.users = [];
      state.selectedUser = null;
      state.loading = false;
      state.error = null;
      state.message = null;
      state.actionLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Register user
    builder
      .addCase(registerUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.users.push(action.payload.data);
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to register user';
      });

    // Get user by ID
    builder
      .addCase(getUserById.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedUser = action.payload.data;
        state.error = null;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.actionLoading = false;
        state.selectedUser = null;
        state.error = action.payload?.message || 'Failed to fetch user';
      });

    // Get all users
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.error = null;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.users = [];
        state.error = action.payload?.message || 'Failed to fetch users';
      });

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedUser = action.payload.data;
        const index = state.users.findIndex((user) => user.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        state.selectedUser = updatedUser;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to update user';
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to change password';
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.users = state.users.filter((user) => user.id !== action.payload.id);
        state.message = action.payload.response.message;
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to delete user';
      });

    // Change user status
    builder
      .addCase(changeUserStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(changeUserStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Update user in the users array
        const index = state.users.findIndex((user) => user.id === action.payload.data.id);
        if (index !== -1) {
          state.users[index] = action.payload.data;
        }
        // Update selected user if it's the same
        if (state.selectedUser?.id === action.payload.data.id) {
          state.selectedUser = action.payload.data;
        }
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(changeUserStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to change user status';
      });

    // Search users by name
    builder
      .addCase(searchUsersByName.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.searchResults = [];
      })
      .addCase(searchUsersByName.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(searchUsersByName.rejected, (state, action) => {
        state.loading = false;
        state.searchResults = [];
        state.error = action.payload?.message || 'Failed to search users';
      });

    // Get dashboard statistics
    builder
      .addCase(getUserDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload.data;
        state.error = null;
      })
      .addCase(getUserDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch dashboard statistics';
      });
  },
});

// Export actions
export const { clearError, clearMessage, clearSelectedUser, resetUserState } = userSlice.actions;

// Selectors
export const selectAllUsers = (state) => state.users.users;
export const selectSelectedUser = (state) => state.users.selectedUser;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;
export const selectUsersMessage = (state) => state.users.message;
export const selectDashboardStats = (state) => state.users.dashboardStats;

// Export reducer
export default userSlice.reducer;
