import axiosInstance from './axiosConfig';

/**
 * Certificate Access API endpoints
 * All functions return the API response data
 */

const certificateApi = {
  /**
   * Get certificate details by certificate ID
   * @param {string} certificateId - Certificate ID
   * @returns {Promise} API response with certificate data
   */
  getCertificateById: async (certificateId) => {
    const response = await axiosInstance.get(`/api/certificates/certificate/${certificateId}`);
    return response.data;
  },

  /**
   * Get certificates by intern ID with optional status filter
   * @param {string} internId - Intern ID
   * @param {string} [status] - Optional status (GENERATED, SIGNED, REVOKED)
   * @returns {Promise} API response with certificates array
   */
  getCertificatesByInternId: async (internId, status) => {
    const response = await axiosInstance.get('/api/certificates/intern', {
      params: { internId, status },
    });
    return response.data;
  },


  /**
   * Get all certificates with optional status filter
   * @param {string} [status] - Optional status (GENERATED, SIGNED, REVOKED)
   * @returns {Promise} API response with certificates array
   */
  getAllCertificates: async (status) => {
    const response = await axiosInstance.get('/api/certificates/certificate', {
      params: { status },
    });
    return response.data;
  },

  /**
   * Download certificate PDF by certificate ID
   * @param {string} certificateId - Certificate ID
   * @returns {Promise} Blob response with PDF file
   */
  downloadCertificatePdfById: async (certificateId) => {
    const response = await axiosInstance.get(
      `/api/certificates/certificate/${certificateId}/pdf`,
      {
        responseType: 'blob', // Important for file download
      }
    );
    return response;
  },


  /**
   * Get certificate from blockchain by certificate ID
   * @param {string} certificateId - Certificate ID
   * @returns {Promise} API response with blockchain certificate data
   */
  getCertificateFromBlockchain: async (certificateId) => {
    const response = await axiosInstance.get(`/api/certificates/blockchain/${certificateId}`);
    return response.data;
  },

  /**
   * Get certificate blockchain history
   * @param {string} certificateId - Certificate ID
   * @returns {Promise} API response with blockchain history array
   */
  getCertificateBlockchainHistory: async (certificateId) => {
    const response = await axiosInstance.get(
      `/api/certificates/blockchain/${certificateId}/history`
    );
    return response.data;
  },

  /**
   * Get all certificates from blockchain
   * @returns {Promise} API response with blockchain certificates array
   */
  getAllCertificatesFromBlockchain: async () => {
    const response = await axiosInstance.get('/api/certificates/blockchain/certificates');
    return response.data;
  },
};

export default certificateApi;
