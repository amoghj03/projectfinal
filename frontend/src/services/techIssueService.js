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

const techIssueService = {
  // Get tech issues for logged-in employee
  getTechIssues: async () => {
    try {
      const response = await axiosInstance.get('/TechIssue/my-issues');
      return response.data;
    } catch (error) {
      console.error('Error fetching tech issues:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch tech issues',
        data: []
      };
    }
  },

  // Submit a new tech issue
  submitTechIssue: async (issueData) => {
    try {
      const response = await axiosInstance.post('/TechIssue', issueData);
      return response.data;
    } catch (error) {
      console.error('Error submitting tech issue:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit tech issue',
        data: null
      };
    }
  },

  // Close a tech issue
  closeTechIssue: async (issueId, closingComments) => {
    try {
      const response = await axiosInstance.put(`/TechIssue/${issueId}/close`, {
        closingComments
      });
      return response.data;
    } catch (error) {
      console.error('Error closing tech issue:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to close tech issue',
        data: null
      };
    }
  }
};

export default techIssueService;
