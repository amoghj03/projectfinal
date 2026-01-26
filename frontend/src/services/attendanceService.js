import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}`;

// Create axios instance with default config
const attendanceApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
attendanceApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
attendanceApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('employeeName');
      localStorage.removeItem('employeeId');
      //window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const attendanceService = {
    // Update productivity rating for today
    updateProductivityRating: async (rating) => {
      try {
        const response = await attendanceApi.post('/Attendance/update-rating', { rating });
        return response.data;
      } catch (error) {
        console.error('Error updating productivity rating:', error);
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to update rating',
        };
      }
    },
  // Get current attendance status
  getTodayAttendance: async () => {
    try {
      const response = await attendanceApi.get('/Attendance/current-status');
      return response.data;
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch attendance',
      };
    }
  },

  // Check in
  checkIn: async (location = null, notes = null) => {
    try {
      const response = await attendanceApi.post('/Attendance/check-in', {
        location,
        notes,
      });
      return response.data;
    } catch (error) {
      console.error('Error checking in:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to check in',
      };
    }
  },

  // Check out
  checkOut: async (notes = null) => {
    try {
      const response = await attendanceApi.post('/Attendance/check-out', {
        notes,
      });
      return response.data;
    } catch (error) {
      console.error('Error checking out:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to check out',
      };
    }
  },

  // Get attendance history
  getAttendanceHistory: async (days = 5) => {
    try {
      const response = await attendanceApi.get('/Attendance/history', {
        params: { days },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch attendance history',
      };
    }
  },

  // ADMIN METHODS

  /**
   * Get daily attendance for all employees with optional filters
   * @param {Object} params - Query parameters
   * @param {string} params.date - Date in YYYY-MM-DD format (optional)
   * @param {string} params.branch - Branch name filter (optional)
   * @param {string} params.department - Department filter (optional)
   * @param {string} params.employeeId - Employee ID filter (optional)
   */
  getDailyAttendance: async (params = {}) => {
    try {
      const response = await attendanceApi.get('/admin/AdminAttendance/daily', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching daily attendance:', error);
      throw error;
    }
  },

  /**
   * Get monthly attendance summary for all employees with optional filters
   * @param {Object} params - Query parameters
   * @param {string} params.month - Month in YYYY-MM format (optional)
   * @param {string} params.branch - Branch name filter (optional)
   * @param {string} params.department - Department filter (optional)
   * @param {string} params.employeeId - Employee ID filter (optional)
   */
  getMonthlyAttendance: async (params = {}) => {
    try {
      const response = await attendanceApi.get('/admin/AdminAttendance/monthly', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly attendance:', error);
      throw error;
    }
  },

  /**
   * Get detailed attendance history for a specific employee
   * @param {string} employeeId - Employee ID
   * @param {number} days - Number of days to fetch (default 30)
   */
  getEmployeeAttendanceDetails: async (employeeId, days = 30) => {
    try {
      const response = await attendanceApi.get(`/admin/AdminAttendance/employee/${employeeId}`, {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching employee attendance details:', error);
      throw error;
    }
  },
    /**
   * Manually mark attendance for an employee (admin)
   * @param {Object} data - { employeeId, date, status, workHours }
   */
  markManualAttendance: async (data) => {
    try {
      const response = await attendanceApi.post('/Attendance/manual-mark', data);
      return response.data;
    } catch (error) {
      console.error('Error manually marking attendance:', error);
      throw error;
    }
  },
};

export default attendanceService;
