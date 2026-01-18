import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_API_URL}`;

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

class LeaveService {
  /**
   * Submit a new leave request
   * @param {Object} requestData - Leave request data
   * @param {string} requestData.leaveType - Leave type name (not ID)
   * @param {string} requestData.startDate - Start date (YYYY-MM-DD)
   * @param {string} requestData.endDate - End date (YYYY-MM-DD)
   * @param {string} requestData.reason - Reason for leave
   * @param {boolean} requestData.isHalfDay - Is half day leave
   * @param {string} requestData.halfDayPeriod - Half day period (morning/afternoon)
   */
  async submitLeaveRequest(requestData) {
    try {
      const response = await axiosInstance.post('/Leave/submit', requestData);
      return response.data;
    } catch (error) {
      console.error('Error submitting leave request:', error);
      throw error;
    }
  }

  /**
   * Get all leave requests for the authenticated employee
   */
  async getLeaveRequests() {
    try {
      const response = await axiosInstance.get('/Leave/requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      throw error;
    }
  }

  /**
   * Get leave balance for the authenticated employee
   */
  async getLeaveBalance() {
    try {
      const response = await axiosInstance.get('/Leave/balance');
      return response.data;
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      throw error;
    }
  }

  /**
   * Get a specific leave request by ID
   * @param {number} leaveRequestId - Leave request ID
   */
  async getLeaveRequestById(leaveRequestId) {
    try {
      const response = await axiosInstance.get(`/Leave/requests/${leaveRequestId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leave request:', error);
      throw error;
    }
  }

  /**
   * Get available leave types for the tenant
   */
  async getLeaveTypes() {
    try {
      const response = await axiosInstance.get('/Leave/types');
      return response.data;
    } catch (error) {
      console.error('Error fetching leave types:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const leaveService = new LeaveService();
export default leaveService;
