import axiosInstance from './axiosConfig';

/**
 * Certificate Generation API endpoints (HR and Director)
 */

const certificateGenApi = {
  // ==================== HR APIs ====================
  
  /**
   * Generate certificate for an intern (HR only)
   * @param {string} internId - Intern ID
   * @param {string} certificateType - PARTICIPATION or COMPLETION
   * @returns {Promise} API response with generated certificate data
   */
  generateCertificate: async (internId, certificateType) => {
    const response = await axiosInstance.post(
      '/api/hr/certificates/generate',
      null,
      {
        params: { internId, certificateType },
      }
    );
    return response.data;
  },

  /**
   * Revoke a certificate (HR only)
   * @param {string} certificateId - Certificate ID to revoke
   * @param {string} revocationReason - Reason for revocation
   * @returns {Promise} API response with revoked certificate data
   */
  revokeCertificate: async (certificateId, revocationReason) => {
    const response = await axiosInstance.post(
      '/api/hr/certificates/revoke',
      null,
      {
        params: { certificateId, revocationReason },
      }
    );
    return response.data;
  },

  /**
   * Upload certificate to blockchain (HR only)
   * @param {string} certificateId - Certificate ID to upload
   * @returns {Promise} API response with blockchain certificate data
   */
  uploadCertificateToBlockchain: async (certificateId) => {
    const response = await axiosInstance.post(
      '/api/hr/certificates/uploadCertificateToBlockchain',
      null,
      {
        params: { certificateId },
      }
    );
    return response.data;
  },

  // ==================== Director APIs ====================

  /**
   * Sign certificate with digital signature (Director only)
   * @param {string} certificateId - Certificate ID to sign
   * @returns {Promise} API response with signed certificate data
   */
  signCertificate: async (certificateId) => {
    const response = await axiosInstance.post(
      `/api/director/certificates/${certificateId}/sign`
    );
    return response.data;
  },
};

export default certificateGenApi;
