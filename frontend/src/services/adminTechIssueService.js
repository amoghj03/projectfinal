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
      //window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

const adminTechIssueService = {
  // Get all tech issues with optional branch filter
  getAllTechIssues: async (branch = null) => {
    try {
      const params = branch && branch !== 'All Branches' ? { branch } : {};
      const response = await axiosInstance.get('/admin/AdminTechIssue', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching tech issues:', error);
      throw error;
    }
  },

  // Get tech issue statistics
  getTechIssueStats: async (branch = null) => {
    try {
      const params = branch && branch !== 'All Branches' ? { branch } : {};
      const response = await axiosInstance.get('/admin/AdminTechIssue/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching tech issue stats:', error);
      throw error;
    }
  },

  // Get single tech issue by ID
  getTechIssueById: async (id) => {
    try {
      const response = await axiosInstance.get(`/admin/AdminTechIssue/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tech issue:', error);
      throw error;
    }
  },

  // Approve a tech issue
  approveTechIssue: async (id, adminComment) => {
    try {
      const response = await axiosInstance.post(`/admin/AdminTechIssue/${id}/approve`, {
        adminComment: adminComment || ''
      });
      return response.data;
    } catch (error) {
      console.error('Error approving tech issue:', error);
      throw error;
    }
  },

  // Reject a tech issue
  rejectTechIssue: async (id, adminComment) => {
    try {
      const response = await axiosInstance.post(`/admin/AdminTechIssue/${id}/reject`, {
        adminComment: adminComment || ''
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting tech issue:', error);
      throw error;
    }
  },
};

export default adminTechIssueService;
