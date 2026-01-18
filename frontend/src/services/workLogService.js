import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}`;

// Create axios instance with default config
const workLogApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
workLogApi.interceptors.request.use(
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
workLogApi.interceptors.response.use(
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

const workLogService = {
  // Get today's work logs
  getTodayWorkLogs: async () => {
    try {
      const response = await workLogApi.get('/WorkLog/daily-logs');
      return response.data;
    } catch (error) {
      console.error('Error fetching today work logs:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch work logs',
      };
    }
  },

  // Create work log
  createWorkLog: async (workLogData) => {
    try {
      const response = await workLogApi.post('/WorkLog', workLogData);
      return response.data;
    } catch (error) {
      console.error('Error creating work log:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create work log',
      };
    }
  },

  // Get work log history
  getWorkLogHistory: async (days = 30) => {
    try {
      const response = await workLogApi.get('/WorkLog/history', {
        params: { days },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching work log history:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch work log history',
      };
    }
  },
};

export default workLogService;
