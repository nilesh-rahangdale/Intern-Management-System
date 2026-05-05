import axiosInstance from './axiosConfig';

/**
 * Certificate Verification API endpoints (Public - No Authentication Required)
 */

const certificateVerificationApi = {
  /**
   * Verify certificate authenticity (Public endpoint)
   * @param {string} certificateId - Certificate ID to verify
   * @returns {Promise} API response with verification details
   */
  verifyCertificate: async (certificateId) => {
    const response = await axiosInstance.get(
      `/api/verification/verify/${certificateId}`
    );
    return response.data;
  },
};

export default certificateVerificationApi;
