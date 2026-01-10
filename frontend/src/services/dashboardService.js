import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
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
      console.log('Authorization header added:', config.headers.Authorization);
    } else {
      console.error('Token is invalid or missing:', token);
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
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class DashboardService {
  /**
   * Get dashboard statistics for the authenticated employee
   * Includes attendance stats, task stats, skill stats, and recent activities
   */
  async getDashboardStats() {
    try {
      const response = await axiosInstance.get('/Dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get a quick summary of key metrics
   * Returns condensed view of attendance, tasks, and skills
   */
  async getQuickSummary() {
    try {
      const response = await axiosInstance.get('/Dashboard/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  }

  /**
   * Get admin dashboard statistics with optional branch filtering
   * @param {string} branch - Optional branch name to filter stats
   * @returns {Promise} Admin dashboard statistics
   */
  async getAdminDashboardStats(branch = null) {
    try {
      const params = branch ? { branch } : {};
      const response = await axiosInstance.get('/admin/AdminDashboard/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const dashboardService = new DashboardService();
export default dashboardService;
