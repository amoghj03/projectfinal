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
      console.log('AdminEmployee API - Authorization header added:', config.headers.Authorization);
    } else {
      console.error('AdminEmployee API - Token is invalid or missing:', token);
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
      // Handle unauthorized - clear storage and redirect to login
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const adminEmployeeService = {
  /**
   * Get list of employees with optional branch filtering
   * @param {string} branch - Optional branch filter
   * @returns {Promise} - Promise resolving to employee list response
   */
  getEmployees: async (branch = null) => {
    try {
      const params = {};
      if (branch) {
        params.branch = branch;
      }
      
      const response = await axiosInstance.get('/admin/AdminEmployee', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  /**
   * Get a single employee by ID
   * @param {number} employeeId - Employee ID
   * @returns {Promise} - Promise resolving to employee details
   */
  getEmployeeById: async (employeeId) => {
    try {
      const response = await axiosInstance.get(`/admin/AdminEmployee/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee ${employeeId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new employee
   * @param {object} employeeData - Employee data to create
   * @returns {Promise} - Promise resolving to created employee
   */
  createEmployee: async (employeeData) => {
    try {
      const response = await axiosInstance.post('/admin/AdminEmployee', employeeData);
      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },

  /**
   * Update an existing employee
   * @param {number} employeeId - Employee ID
   * @param {object} employeeData - Updated employee data
   * @returns {Promise} - Promise resolving to updated employee
   */
  updateEmployee: async (employeeId, employeeData) => {
    try {
      const response = await axiosInstance.put(`/admin/AdminEmployee/${employeeId}`, employeeData);
      return response.data;
    } catch (error) {
      console.error(`Error updating employee ${employeeId}:`, error);
      throw error;
    }
  },

  /**
   * Delete an employee
   * @param {number} employeeId - Employee ID
   * @returns {Promise} - Promise resolving to deletion confirmation
   */
  deleteEmployee: async (employeeId) => {
    try {
      const response = await axiosInstance.delete(`/admin/AdminEmployee/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting employee ${employeeId}:`, error);
      throw error;
    }
  },
};

export default adminEmployeeService;
