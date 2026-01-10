import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const attendanceService = {
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
  getAttendanceHistory: async (days = 30) => {
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
};

export default attendanceService;
