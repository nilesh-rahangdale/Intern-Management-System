import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import certificateApi from '../../api/certificateApi';

// Initial state
const initialState = {
  certificates: [],
  selectedCertificate: null,
  blockchainCertificate: null,
  blockchainCertificates: [],
  blockchainHistory: [],
  loading: false,
  downloadLoading: false,
  error: null,
  message: null,
};

// AsyncThunk for getting certificate by ID
export const getCertificateById = createAsyncThunk(
  'certificates/getCertificateById',
  async (certificateId, { rejectWithValue }) => {
    try {
      const response = await certificateApi.getCertificateById(certificateId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch certificate' }
      );
    }
  }
);

// AsyncThunk for getting all certificates (optional status filter)
export const getAllCertificates = createAsyncThunk(
  'certificates/getAllCertificates',
  async ({ status } = {}, { rejectWithValue }) => {
    try {
      const response = await certificateApi.getAllCertificates(status);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch certificates' }
      );
    }
  }
);

// AsyncThunk for getting certificates by intern ID (optional status filter)
export const getCertificatesByInternId = createAsyncThunk(
  'certificates/getCertificatesByInternId',
  async ({ internId, status }, { rejectWithValue }) => {
    try {
      const response = await certificateApi.getCertificatesByInternId(internId, status);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch certificates' }
      );
    }
  }
);

// AsyncThunk for getting certificate from blockchain by certificate ID
export const getCertificateFromBlockchain = createAsyncThunk(
  'certificates/getCertificateFromBlockchain',
  async (certificateId, { rejectWithValue }) => {
    try {
      const response = await certificateApi.getCertificateFromBlockchain(certificateId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch blockchain certificate' }
      );
    }
  }
);

// AsyncThunk for getting certificate blockchain history
export const getCertificateBlockchainHistory = createAsyncThunk(
  'certificates/getCertificateBlockchainHistory',
  async (certificateId, { rejectWithValue }) => {
    try {
      const response = await certificateApi.getCertificateBlockchainHistory(certificateId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch blockchain history' }
      );
    }
  }
);

// AsyncThunk for getting all certificates from blockchain
export const getAllCertificatesFromBlockchain = createAsyncThunk(
  'certificates/getAllCertificatesFromBlockchain',
  async (_, { rejectWithValue }) => {
    try {
      const response = await certificateApi.getAllCertificatesFromBlockchain();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch blockchain certificates' }
      );
    }
  }
);

// AsyncThunk for downloading certificate PDF by certificate ID
export const downloadCertificatePdfById = createAsyncThunk(
  'certificates/downloadCertificatePdfById',
  async (certificateId, { rejectWithValue }) => {
    try {
      const response = await certificateApi.downloadCertificatePdfById(certificateId);
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${certificateId}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { certificateId, filename, message: 'Certificate downloaded successfully' };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to download certificate' }
      );
    }
  }
);


// Certificate slice
const certificateSlice = createSlice({
  name: 'certificates',
  initialState,
  reducers: {
    // Synchronous actions
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearSelectedCertificate: (state) => {
      state.selectedCertificate = null;
    },
    clearCertificates: (state) => {
      state.certificates = [];
      state.selectedCertificate = null;
    },
    resetCertificateState: (state) => {
      state.certificates = [];
      state.selectedCertificate = null;
      state.blockchainCertificate = null;
      state.blockchainCertificates = [];
      state.blockchainHistory = [];
      state.loading = false;
      state.downloadLoading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    // Get certificate by ID
    builder
      .addCase(getCertificateById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCertificateById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCertificate = action.payload.data;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(getCertificateById.rejected, (state, action) => {
        state.loading = false;
        state.selectedCertificate = null;
        state.error = action.payload?.message || 'Failed to fetch certificate';
      });

    // Get all certificates
    builder
      .addCase(getAllCertificates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCertificates.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates = Array.isArray(action.payload.data) ? action.payload.data : [];
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(getAllCertificates.rejected, (state, action) => {
        state.loading = false;
        state.certificates = [];
        state.error = action.payload?.message || 'Failed to fetch certificates';
      });

    // Get certificates by intern ID
    builder
      .addCase(getCertificatesByInternId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCertificatesByInternId.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates = Array.isArray(action.payload.data) ? action.payload.data : [];
        state.selectedCertificate = state.certificates[0] || null;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(getCertificatesByInternId.rejected, (state, action) => {
        state.loading = false;
        state.certificates = [];
        state.selectedCertificate = null;
        state.error = action.payload?.message || 'Failed to fetch certificates';
      });

    // Get certificate from blockchain
    builder
      .addCase(getCertificateFromBlockchain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCertificateFromBlockchain.fulfilled, (state, action) => {
        state.loading = false;
        state.blockchainCertificate = action.payload.data;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(getCertificateFromBlockchain.rejected, (state, action) => {
        state.loading = false;
        state.blockchainCertificate = null;
        state.error = action.payload?.message || 'Failed to fetch blockchain certificate';
      });

    // Get certificate blockchain history
    builder
      .addCase(getCertificateBlockchainHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCertificateBlockchainHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.blockchainHistory = Array.isArray(action.payload.data) ? action.payload.data : [];
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(getCertificateBlockchainHistory.rejected, (state, action) => {
        state.loading = false;
        state.blockchainHistory = [];
        state.error = action.payload?.message || 'Failed to fetch blockchain history';
      });

    // Get all certificates from blockchain
    builder
      .addCase(getAllCertificatesFromBlockchain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCertificatesFromBlockchain.fulfilled, (state, action) => {
        state.loading = false;
        state.blockchainCertificates = Array.isArray(action.payload.data) ? action.payload.data : [];
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(getAllCertificatesFromBlockchain.rejected, (state, action) => {
        state.loading = false;
        state.blockchainCertificates = [];
        state.error = action.payload?.message || 'Failed to fetch blockchain certificates';
      });

    // Download certificate PDF by certificate ID
    builder
      .addCase(downloadCertificatePdfById.pending, (state) => {
        state.downloadLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(downloadCertificatePdfById.fulfilled, (state, action) => {
        state.downloadLoading = false;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(downloadCertificatePdfById.rejected, (state, action) => {
        state.downloadLoading = false;
        state.error = action.payload?.message || 'Failed to download certificate';
      });

  },
});

// Export actions
export const {
  clearError,
  clearMessage,
  clearSelectedCertificate,
  clearCertificates,
  resetCertificateState,
} = certificateSlice.actions;

// Export reducer
export default certificateSlice.reducer;
