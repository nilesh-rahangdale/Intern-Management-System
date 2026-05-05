import axios from 'axios';

// Base URL for the API
const BASE_URL = import.meta.env.VITE_BACKEND_URL ;

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 50000, // 50 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Send cookies with requests
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add any request modifications here
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Handle successful responses
    console.log(`[API Response] ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    // Handle error responses
    console.error('[API Response Error]', error.response?.data || error.message);

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - could trigger logout
          console.error('Unauthorized access - please login again');
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden - insufficient permissions');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 409:
          // Conflict
          console.error('Resource conflict');
          break;
        case 500:
          // Server error
          console.error('Internal server error');
          break;
        default:
          console.error(`Error ${status}: ${data?.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      // Request made but no response received (timeout, network error, etc.)
      console.error('No response from server - please check your connection or ensure backend is running');
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
export { BASE_URL };
