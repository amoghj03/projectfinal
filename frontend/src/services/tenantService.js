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

class TenantService {
  /**
   * Onboard a new tenant
   * @param {Object} onboardingData - Tenant onboarding data
   * @returns {Promise<Object>} Onboarding result
   */
  async onboardTenant(onboardingData) {
    try {
      const response = await axiosInstance.post('/admin/AdminTenant/onboard', onboardingData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to onboard tenant';
      throw new Error(message);
    }
  }

  /**
   * Check if tenant slug is available
   * @param {string} slug - Tenant slug to check
   * @returns {Promise<boolean>} Availability status
   */
  async checkSlugAvailability(slug) {
    try {
      const response = await axiosInstance.get(`/admin/AdminTenant/check-slug/${slug}`);
      return response.data.available;
    } catch (error) {
      console.error('Error checking slug availability:', error);
      return false;
    }
  }

  /**
   * Get all tenants
   * @returns {Promise<Array>} List of tenants
   */
  async getAllTenants() {
    try {
      const response = await axiosInstance.get('/admin/AdminTenant');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch tenants';
      throw new Error(message);
    }
  }

  /**
   * Get all permissions for role assignment
   * @returns {Promise<Array>} List of permissions
   */
  async getPermissions() {
    try {
      const response = await axiosInstance.get('/admin/AdminTenant/permissions');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch permissions';
      throw new Error(message);
    }
  }
}

const tenantService = new TenantService();
export default tenantService;
