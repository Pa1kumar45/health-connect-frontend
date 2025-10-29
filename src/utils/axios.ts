/**
 * Axios HTTP Client Configuration
 * 
 * Pre-configured axios instance for making HTTP requests to the backend API.
 * Handles base URL configuration, credentials, and error interceptors.
 * 
 * Features:
 * - Environment-based base URL configuration
 * - Automatic credentials (cookies) inclusion
 * - Default JSON content type header
 * - Request interceptor for auth token injection
 * - Response interceptor for global error handling
 * - Automatic 401/403/500 error logging
 * 
 * Configuration:
 * - Base URL: From VITE_BACKEND_URL env variable
 * - With Credentials: Enabled for cookie-based auth
 * - Content-Type: application/json by default
 * 
 * Error Handling:
 * - 401: Unauthorized access (could redirect to login)
 * - 403: Forbidden access
 * - 500: Server errors
 * 
 * @module axios
 * @example
 * import axios from './utils/axios';
 * 
 * // GET request
 * const response = await axios.get('/users');
 * 
 * // POST request
 * const data = await axios.post('/login', credentials);
 */

import axios from 'axios';

/**
 * Get backend URL from environment variables
 * Falls back to localhost:5000 if not defined
 */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Create axios instance with default configuration
 * 
 * Configured with:
 * - Base URL pointing to API endpoint
 * - Credentials enabled for cookie transmission
 * - JSON content type header
 */
const axiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true, // Enable sending cookies with requests
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request interceptor
 * 
 * Intercepts all outgoing requests to add authentication tokens,
 * logging, or modify request configuration.
 * 
 * @param {AxiosRequestConfig} config - Request configuration
 * @returns {AxiosRequestConfig} Modified configuration
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth tokens or modify config here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * 
 * Intercepts all responses to handle common errors globally.
 * Logs specific error types and can trigger app-wide actions.
 * 
 * Error Codes Handled:
 * - 401: Unauthorized - user not authenticated
 * - 403: Forbidden - user lacks permissions
 * - 500: Internal Server Error
 * 
 * @param {AxiosResponse} response - Successful response
 * @returns {AxiosResponse} Response data
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors (401, 403, 500, etc.)
    if (error.response?.status === 401) {
      // Unauthorized - could redirect to login
      console.error('Unauthorized access');
    } else if (error.response?.status === 403) {
      // Forbidden
      console.error('Access forbidden');
    } else if (error.response?.status === 500) {
      // Server error
      console.error('Server error');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
