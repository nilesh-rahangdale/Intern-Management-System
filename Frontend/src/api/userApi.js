import axiosInstance from './axiosConfig';

/**
 * User Management API endpoints (ADMIN only)
 * All functions return the API response data
 */

const userApi = {
  /**
   * Register a new user
   * @param {Object} userData - { email, fullName, phoneNumber, password, roles }
   * @returns {Promise} API response with created user data
   */
  registerUser: async (userData) => {
    const response = await axiosInstance.post('/api/users/register', userData);
    return response.data;
  },

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise} API response with user data
   */
  getUserById: async (id) => {
    const response = await axiosInstance.get(`/api/users/getUserById/${id}`);
    return response.data;
  },

  /**
   * Get all users
   * @returns {Promise} API response with array of users
   */
  getAllUsers: async () => {
    const response = await axiosInstance.get('/api/users/getAllUsers');
    return response.data;
  },

  /**
   * Update user details
   * @param {number} id - User ID
   * @param {Object} userData - { fullName, roles, email, phoneNumber, status }
   * @returns {Promise} API response with updated user data
   */
  updateUser: async (id, userData) => {
    const response = await axiosInstance.put(`/api/users/updateUser/${id}`, userData);
    return response.data;
  },

  /**
   * Change user password
   * @param {number} id - User ID
   * @param {Object} passwordData - { oldPassword, newPassword, confirmNewPassword }
   * @returns {Promise} API response
   */
  changePassword: async (id, passwordData) => {
    const response = await axiosInstance.put(`/api/users/changePassword/${id}`, passwordData);
    return response.data;
  },

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise} API response
   */
  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/api/users/deleteUser/${id}`);
    return response.data;
  },

  /**
   * Change user status
   * @param {number} id - User ID
   * @param {string} status - New status (ACTIVE, INACTIVE, or BLOCKED)
   * @returns {Promise} API response with updated user data
   */
  changeUserStatus: async (id, status) => {
    const response = await axiosInstance.patch(
      `/api/users/changeStatus/${id}`,
      null,
      {
        params: { status },
      }
    );
    return response.data;
  },

  /**
   * Search users by name
   * @param {string} name - Name or partial name to search for
   * @returns {Promise} API response with array of matching users
   */
  searchUsersByName: async (name) => {
    const response = await axiosInstance.get('/api/users/searchByName', {
      params: { name },
    });
    return response.data;
  },

  /**
   * Get user dashboard statistics
   * @returns {Promise} API response with dashboard statistics
   */
  getUserDashboardStats: async () => {
    const response = await axiosInstance.get('/api/users/dashboard');
    return response.data;
  },
};

export default userApi;
