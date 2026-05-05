import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import certificateGenApi from '../../api/certificateGenApi';

// Initial state
const initialState = {
  generatedCertificate: null,
  signedCertificate: null,
  loading: false,
  signLoading: false,
  revokeLoading: false,
  uploadLoading: false,
  error: null,
  message: null,
};

//  HR AsyncThunks 

// AsyncThunk for generating certificate
export const generateCertificate = createAsyncThunk(
  'certificateGen/generateCertificate',
  async ({ internId, certificateType }, { rejectWithValue }) => {
    try {
      const response = await certificateGenApi.generateCertificate(internId, certificateType);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to generate certificate' }
      );
    }
  }
);

// AsyncThunk for revoking certificate (HR)
export const revokeCertificate = createAsyncThunk(
  'certificateGen/revokeCertificate',
  async ({ certificateId, revocationReason }, { rejectWithValue }) => {
    try {
      const response = await certificateGenApi.revokeCertificate(
        certificateId,
        revocationReason
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to revoke certificate' }
      );
    }
  }
);

// AsyncThunk for uploading certificate to blockchain (HR)
export const uploadCertificateToBlockchain = createAsyncThunk(
  'certificateGen/uploadCertificateToBlockchain',
  async (certificateId, { rejectWithValue }) => {
    try {
      const response = await certificateGenApi.uploadCertificateToBlockchain(certificateId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to upload certificate to blockchain' }
      );
    }
  }
);

//  Director AsyncThunks 

// AsyncThunk for signing certificate
export const signCertificate = createAsyncThunk(
  'certificateGen/signCertificate',
  async (certificateId, { rejectWithValue }) => {
    try {
      const response = await certificateGenApi.signCertificate(certificateId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to sign certificate' }
      );
    }
  }
);

// Certificate Generation slice
const certificateGenSlice = createSlice({
  name: 'certificateGen',
  initialState,
  reducers: {
    // Synchronous actions
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearGeneratedCertificate: (state) => {
      state.generatedCertificate = null;
    },
    clearSignedCertificate: (state) => {
      state.signedCertificate = null;
    },
    resetCertificateGenState: (state) => {
      state.generatedCertificate = null;
      state.signedCertificate = null;
      state.loading = false;
      state.signLoading = false;
      state.revokeLoading = false;
      state.uploadLoading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    // Generate certificate
    builder
      .addCase(generateCertificate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.generatedCertificate = null;
      })
      .addCase(generateCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.generatedCertificate = action.payload.data;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(generateCertificate.rejected, (state, action) => {
        state.loading = false;
        state.generatedCertificate = null;
        state.error = action.payload?.message || 'Failed to generate certificate';
      });

    // Sign certificate
    builder
      .addCase(signCertificate.pending, (state) => {
        state.signLoading = true;
        state.error = null;
        state.message = null;
        state.signedCertificate = null;
      })
      .addCase(signCertificate.fulfilled, (state, action) => {
        state.signLoading = false;
        state.signedCertificate = action.payload.data;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(signCertificate.rejected, (state, action) => {
        state.signLoading = false;
        state.signedCertificate = null;
        state.error = action.payload?.message || 'Failed to sign certificate';
      });

    // Revoke certificate
    builder
      .addCase(revokeCertificate.pending, (state) => {
        state.revokeLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(revokeCertificate.fulfilled, (state, action) => {
        state.revokeLoading = false;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(revokeCertificate.rejected, (state, action) => {
        state.revokeLoading = false;
        state.error = action.payload?.message || 'Failed to revoke certificate';
      });

    // Upload certificate to blockchain
    builder
      .addCase(uploadCertificateToBlockchain.pending, (state) => {
        state.uploadLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(uploadCertificateToBlockchain.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(uploadCertificateToBlockchain.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload?.message || 'Failed to upload certificate to blockchain';
      });
  },
});

// Export actions
export const {
  clearError,
  clearMessage,
  clearGeneratedCertificate,
  clearSignedCertificate,
  resetCertificateGenState,
} = certificateGenSlice.actions;

// Export reducer
export default certificateGenSlice.reducer;
