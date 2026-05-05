import axiosInstance from './axiosConfig';

/**
 * Intern Management API endpoints
 * All functions return the API response data
 */

const internApi = {
  /**
   * Add a new intern
   * @param {Object} internData - Complete intern information
   * @returns {Promise} API response with created intern data
   */
  addIntern: async (internData) => {
    const response = await axiosInstance.post('/api/intern/addIntern', internData);
    return response.data;
  },

  /**
   * Update existing intern
   * @param {Object} internData - Complete intern information with internId
   * @returns {Promise} API response with updated intern data
   */
  updateIntern: async (internData) => {
    const response = await axiosInstance.put('/api/intern/updateIntern', internData);
    return response.data;
  },

  /**
   * Update intern status
   * @param {string} internId - Intern ID
   * @param {string} status - New status (ONGOING, COMPLETED, CANCELLED)
   * @returns {Promise} API response with updated intern data
   */
  updateInternStatus: async (internId, status) => {
    const response = await axiosInstance.put('/api/intern/updateInternStatus', null, {
      params: { internId, status },
    });
    return response.data;
  },

  /**
   * Get all interns
   * @returns {Promise} API response with array of interns
   */
  getAllInterns: async () => {
    const response = await axiosInstance.get('/api/intern/getAllInterns');
    return response.data;
  },

  /**
   * Get intern by ID
   * @param {string} internId - Intern ID
   * @returns {Promise} API response with intern data
   */
  getInternById: async (internId) => {
    const response = await axiosInstance.get(`/api/intern/getInternById/${internId}`);
    return response.data;
  },

  /**
   * Upload interns via CSV file
   * @param {File} file - CSV file containing intern data
   * @returns {Promise} API response with upload results
   */
  uploadCsv: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/api/intern/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Search interns by name
   * @param {string} name - Name or partial name to search
   * @returns {Promise} API response with matching interns
   */
  searchByName: async (name) => {
    const response = await axiosInstance.get('/api/intern/searchByName', {
      params: { name },
    });
    return response.data;
  },
  /**
   * Get intern dashboard statistics
   * @returns {Promise} API response with dashboard statistics
   */
  getInternDashboardStats: async () => {
    const response = await axiosInstance.get('/api/intern/dashboard');
    return response.data;
  },

  /**
   * Change internship type (PAID/UNPAID)
   * @param {string} internId - Intern ID
   * @param {string} type - New internship type (PAID or UNPAID)
   * @returns {Promise} API response with updated intern data
   */
  changeInternshipType: async (internId, type) => {
    const response = await axiosInstance.patch(`/api/intern/changeInternshipType/${internId}`, null, {
      params: { type },
    });
    return response.data;
  },
};

export default internApi;
