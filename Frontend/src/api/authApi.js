import axiosInstance from './axiosConfig';

/** 
 * Authentication API endpoints
 */

const authApi = {
  /**
   * Login user with email and password
   * @param {Object} credentials - { email: string, password: string }
   * @returns {Promise} API response with user data
   */
  loginUser: async (credentials) => {
    const response = await axiosInstance.post('/api/auth/loginUser', credentials);
    return response.data;
  },

  /**
   * Logout current user
   * @returns {Promise} API response
   */
  logoutUser: async () => {
    const response = await axiosInstance.post('/api/auth/logoutUser');
    return response.data;
  },

  /**
   * Get current authenticated user details
   * @returns {Promise} API response with user data
   */
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/api/auth/getCurrentUser');
    return response.data;
  },

  /**
   * Confirm email with OTP
   * @param {Object} data - { email: string, otp: string }
   * @returns {Promise} API response
   */
  confirmEmail: async (data) => {
    const response = await axiosInstance.post('/api/auth/confirmMail', data);
    return response.data;
  },
};

export default authApi;
