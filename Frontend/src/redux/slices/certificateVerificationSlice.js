import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import certificateVerificationApi from '../../api/certificateVerificationApi';

// Initial state
const initialState = {
  verificationResult: null,
  loading: false,
  error: null,
};

// AsyncThunk for verifying certificate
export const verifyCertificate = createAsyncThunk(
  'certificateVerification/verifyCertificate',
  async (certificateId, { rejectWithValue }) => {
    try {
      const response = await certificateVerificationApi.verifyCertificate(certificateId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to verify certificate' }
      );
    }
  }
);

// Certificate Verification slice
const certificateVerificationSlice = createSlice({
  name: 'certificateVerification',
  initialState,
  reducers: {
    // Synchronous actions
    clearVerificationResult: (state) => {
      state.verificationResult = null;
      state.error = null;
    },
    resetVerificationState: (state) => {
      state.verificationResult = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Verify certificate
    builder
      .addCase(verifyCertificate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.verificationResult = null;
      })
      .addCase(verifyCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.verificationResult = action.payload.data;
        state.error = null;
      })
      .addCase(verifyCertificate.rejected, (state, action) => {
        state.loading = false;
        state.verificationResult = null;
        state.error = action.payload?.message || 'Failed to verify certificate';
      });
  },
});

// Export actions
export const { clearVerificationResult, resetVerificationState } =
  certificateVerificationSlice.actions;

// Export reducer
export default certificateVerificationSlice.reducer;
