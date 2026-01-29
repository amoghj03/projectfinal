import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 500 errors gracefully
    if (error.response?.status === 500) {
      console.error('Server error (500):', error.response?.data || 'Internal Server Error');
      return {
        data: {
          success: false,
          message: 'Server error. Please try again later.',
          isServerError: true
        }
      };
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

const profileService = {
  resetPassword: async (currentPassword, newPassword) => {
    try {
      const res = await axiosInstance.post('/Profile/reset-password', { currentPassword, newPassword });
      return res.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      if (error.response?.data?.isServerError) {
        return error.response.data;
      }
      throw error;
    }
  },
  getProfile: async () => {
    try {
      const res = await axiosInstance.get('/Profile/me');
      return res.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.data?.isServerError) {
        return error.response.data;
      }
      throw error;
    }
  },
};

export default profileService;
