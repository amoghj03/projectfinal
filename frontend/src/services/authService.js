import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear storage and redirect to login
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class AuthService {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and token
   */
  async login(email, password) {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Invalid credentials');
      }

      // Store authentication token
      localStorage.setItem('authToken', data.token);

      // Store employee information
      const user = data.user;
      localStorage.setItem('employeeName', user.name);
      localStorage.setItem('employeeId', user.employeeId);
      localStorage.setItem('tenantId', user.tenantId);

      // Store employee permissions if available
      if (user.employeePermissions) {
        localStorage.setItem('employeePermissions', JSON.stringify(user.employeePermissions));
      }

      // Store admin permissions if available
      if (user.adminPermissions) {
        localStorage.setItem('adminPermissions', JSON.stringify(user.adminPermissions));
      }

      // Check role and set admin permissions
      if (user.adminRole === 'superadmin') {
        // CEO/Super Admin gets full access
        localStorage.setItem('adminName', user.name);
        localStorage.setItem('userRole', 'employee');
        localStorage.setItem('hasAdminAccess', 'true');
        localStorage.setItem('adminRole', 'superadmin');
        localStorage.setItem('adminBranch', user.branch);
        localStorage.setItem('selectedBranch', 'All Branches');
      } else if (user.hasAdminAccess) {
        // Manager/Admin gets branch-specific access
        localStorage.setItem('adminName', user.name);
        localStorage.setItem('userRole', 'employee');
        localStorage.setItem('hasAdminAccess', 'true');
        localStorage.setItem('adminRole', user.adminRole || 'admin');
        localStorage.setItem('adminBranch', user.branch);
        localStorage.setItem('selectedBranch', user.branch);
      } else {
        // Regular employees get employee portal access only
        localStorage.setItem('userRole', 'employee');
        localStorage.setItem('hasAdminAccess', 'false');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Unable to connect to server. Please try again later.');
      }
    }
  }

  /**
   * Logout user and clear storage
   */
  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has valid token
   */
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return token && token !== 'null' && token !== 'undefined';
  }

  /**
   * Get current user info from localStorage
   * @returns {Object|null} User info or null
   */
  getCurrentUser() {
    if (!this.isAuthenticated()) {
      return null;
    }

    return {
      name: localStorage.getItem('employeeName'),
      employeeId: localStorage.getItem('employeeId'),
      userRole: localStorage.getItem('userRole'),
      hasAdminAccess: localStorage.getItem('hasAdminAccess') === 'true',
      adminRole: localStorage.getItem('adminRole'),
      adminBranch: localStorage.getItem('adminBranch'),
      selectedBranch: localStorage.getItem('selectedBranch'),
    };
  }

  /**
   * Get auth token
   * @returns {string|null} Token or null
   */
  getToken() {
    return localStorage.getItem('authToken');
  }
}

// Export a singleton instance
const authService = new AuthService();
export default authService;
