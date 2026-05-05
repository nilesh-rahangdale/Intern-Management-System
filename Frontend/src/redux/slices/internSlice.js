import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import internApi from '../../api/internApi';

// Initial state
const initialState = {
  interns: [],
  selectedIntern: null,
  searchResults: [],
  dashboardStats: null, // For dashboard statistics
  loading: false,
  actionLoading: false,
  uploadLoading: false,
  error: null,
  message: null,
  uploadResult: null,
};

// AsyncThunk for adding intern
export const addIntern = createAsyncThunk(
  'interns/addIntern',
  async (internData, { rejectWithValue }) => {
    try {
      const response = await internApi.addIntern(internData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to add intern' }
      );
    }
  }
);

// AsyncThunk for updating intern
export const updateIntern = createAsyncThunk(
  'interns/updateIntern',
  async (internData, { rejectWithValue }) => {
    try {
      const response = await internApi.updateIntern(internData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to update intern' }
      );
    }
  }
);

// AsyncThunk for updating intern status
export const updateInternStatus = createAsyncThunk(
  'interns/updateInternStatus',
  async ({ internId, status }, { rejectWithValue }) => {
    try {
      const response = await internApi.updateInternStatus(internId, status);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to update status' }
      );
    }
  }
);

// AsyncThunk for getting all interns
export const getAllInterns = createAsyncThunk(
  'interns/getAllInterns',
  async (_, { rejectWithValue }) => {
    try {
      const response = await internApi.getAllInterns();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch interns' }
      );
    }
  }
);

// AsyncThunk for getting intern by ID
export const getInternById = createAsyncThunk(
  'interns/getInternById',
  async (internId, { rejectWithValue }) => {
    try {
      const response = await internApi.getInternById(internId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch intern' }
      );
    }
  }
);

// AsyncThunk for uploading CSV
export const uploadCsv = createAsyncThunk(
  'interns/uploadCsv',
  async (file, { rejectWithValue }) => {
    try {
      const response = await internApi.uploadCsv(file);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to upload CSV' }
      );
    }
  }
);

// AsyncThunk for searching by name
export const searchByName = createAsyncThunk(
  'interns/searchByName',
  async (name, { rejectWithValue }) => {
    try {
      const response = await internApi.searchByName(name);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to search interns' }
      );
    }
  }
);

// AsyncThunk for getting dashboard statistics
export const getInternDashboardStats = createAsyncThunk(
  'interns/getInternDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await internApi.getInternDashboardStats();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch dashboard statistics' }
      );
    }
  }
);

// AsyncThunk for changing internship type
export const changeInternshipType = createAsyncThunk(
  'interns/changeInternshipType',
  async ({ internId, type }, { rejectWithValue }) => {
    try {
      const response = await internApi.changeInternshipType(internId, type);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to change internship type' }
      );
    }
  }
);

// Intern slice
const internSlice = createSlice({
  name: 'interns',
  initialState,
  reducers: {
    // Synchronous actions
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearSelectedIntern: (state) => {
      state.selectedIntern = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearUploadResult: (state) => {
      state.uploadResult = null;
    },
    resetInternState: (state) => {
      state.interns = [];
      state.selectedIntern = null;
      state.searchResults = [];
      state.loading = false;
      state.actionLoading = false;
      state.uploadLoading = false;
      state.error = null;
      state.message = null;
      state.uploadResult = null;
    },
  },
  extraReducers: (builder) => {
    // Add intern
    builder
      .addCase(addIntern.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(addIntern.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.interns.push(action.payload.data);
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(addIntern.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to add intern';
      });

    // Update intern
    builder
      .addCase(updateIntern.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateIntern.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedIntern = action.payload.data;
        const index = state.interns.findIndex(
          (intern) => intern.internId === updatedIntern.internId
        );
        if (index !== -1) {
          state.interns[index] = updatedIntern;
        }
        state.selectedIntern = updatedIntern;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(updateIntern.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to update intern';
      });

    // Update intern status
    builder
      .addCase(updateInternStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateInternStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedIntern = action.payload.data;
        const index = state.interns.findIndex(
          (intern) => intern.internId === updatedIntern.internId
        );
        if (index !== -1) {
          state.interns[index] = updatedIntern;
        }
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(updateInternStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to update status';
      });

    // Get all interns
    builder
      .addCase(getAllInterns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllInterns.fulfilled, (state, action) => {
        state.loading = false;
        state.interns = action.payload.data;
        state.error = null;
      })
      .addCase(getAllInterns.rejected, (state, action) => {
        state.loading = false;
        state.interns = [];
        state.error = action.payload?.message || 'Failed to fetch interns';
      });

    // Get intern by ID
    builder
      .addCase(getInternById.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(getInternById.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedIntern = action.payload.data;
        state.error = null;
      })
      .addCase(getInternById.rejected, (state, action) => {
        state.actionLoading = false;
        state.selectedIntern = null;
        state.error = action.payload?.message || 'Failed to fetch intern';
      });

    // Upload CSV
    builder
      .addCase(uploadCsv.pending, (state) => {
        state.uploadLoading = true;
        state.error = null;
        state.message = null;
        state.uploadResult = null;
      })
      .addCase(uploadCsv.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadResult = action.payload.data;
        state.message = action.payload.message;
        // Add successful interns to the list
        if (action.payload.data?.successfulInterns) {
          state.interns.push(...action.payload.data.successfulInterns);
        }
        state.error = null;
      })
      .addCase(uploadCsv.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload?.message || 'Failed to upload CSV';
      });

    // Search by name
    builder
      .addCase(searchByName.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(searchByName.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.searchResults = action.payload.data;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(searchByName.rejected, (state, action) => {
        state.actionLoading = false;
        state.searchResults = [];
        state.error = action.payload?.message || 'Failed to search interns';
      });

    // Get dashboard statistics
    builder
      .addCase(getInternDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInternDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload.data;
        state.error = null;
      })
      .addCase(getInternDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch dashboard statistics';
      });

    // Change internship type
    builder
      .addCase(changeInternshipType.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(changeInternshipType.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Update intern in the interns array
        const index = state.interns.findIndex((intern) => intern.internId === action.payload.data.internId);
        if (index !== -1) {
          state.interns[index] = action.payload.data;
        }
        // Update selected intern if it's the same
        if (state.selectedIntern?.internId === action.payload.data.internId) {
          state.selectedIntern = action.payload.data;
        }
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(changeInternshipType.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to change internship type';
      });
  },
});

// Export actions
export const {
  clearError,
  clearMessage,
  clearSelectedIntern,
  clearSearchResults,
  clearUploadResult,
  resetInternState,
} = internSlice.actions;

// Export reducer
export default internSlice.reducer;
