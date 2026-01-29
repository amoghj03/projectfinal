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
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      //window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class AdminLeaveService {
  /**
   * Get all leave requests with optional filters
   * @param {Object} filters - Optional filters
   * @param {string} filters.branch - Branch filter
   * @param {string} filters.status - Status filter (Pending, Approved, Rejected)
   * @param {string} filters.employeeName - Employee name filter
   * @param {string} filters.leaveType - Leave type filter
   * @returns {Promise<Array>} List of leave requests
   */
  async getLeaveRequests(filters = {}) {
    try {
      const params = {};

      if (filters.branch) params.branch = filters.branch;
      if (filters.status) params.status = filters.status;
      if (filters.employeeName) params.employeeName = filters.employeeName;
      if (filters.leaveType) params.leaveType = filters.leaveType;

      const response = await axiosInstance.get('/admin/AdminLeave', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      throw error;
    }
  }

  /**
   * Get a specific leave request by ID
   * @param {number} id - Leave request ID
   * @returns {Promise<Object>} Leave request details
   */
  async getLeaveRequestById(id) {
    try {
      const response = await axiosInstance.get(`/admin/AdminLeave/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leave request:', error);
      throw error;
    }
  }

  /**
   * Approve a leave request
   * @param {number} id - Leave request ID
   * @param {string} remark - Optional approval remark
   * @returns {Promise<Object>} Success response
   */
  async approveLeaveRequest(id, remark = '') {
    try {
      const response = await axiosInstance.post(`/admin/AdminLeave/${id}/approve`, {
        remark: remark || null,
      });
      return response.data;
    } catch (error) {
      console.error('Error approving leave request:', error);
      throw error;
    }
  }

  /**
   * Reject a leave request
   * @param {number} id - Leave request ID
   * @param {string} reason - Required rejection reason
   * @returns {Promise<Object>} Success response
   */
  async rejectLeaveRequest(id, reason) {
    try {
      const response = await axiosInstance.post(`/admin/AdminLeave/${id}/reject`, {
        remark: reason,
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      throw error;
    }
  }

  /**
   * Get leave statistics for admin dashboard
   * @param {string} branch - Optional branch filter
   * @returns {Promise<Object>} Leave statistics
   */
  async getLeaveStats(branch = null) {
    try {
      const params = branch ? { branch } : {};
      const response = await axiosInstance.get('/admin/AdminLeave/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching leave statistics:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const adminLeaveService = new AdminLeaveService();
export default adminLeaveService;
