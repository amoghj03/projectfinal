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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class BranchService {
  /**
   * Get all branches for a specific tenant
   * @param {number} tenantId - The tenant ID
   * @returns {Promise<Array>} List of branches
   */
  async getBranchesByTenant(tenantId) {
    try {
      const response = await axiosInstance.get(`/branch/tenant/${tenantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  }

  /**
   * Get a specific branch by ID
   * @param {number} branchId - The branch ID
   * @returns {Promise<Object>} Branch details
   */
  async getBranchById(branchId) {
    try {
      const response = await axiosInstance.get(`/branch/${branchId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching branch:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const branchService = new BranchService();
export default branchService;
