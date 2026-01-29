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

const adminComplaintService = {
  // Get all complaints with optional branch filter
  getAllComplaints: async (branch = null) => {
    try {
      const params = branch && branch !== 'All Branches' ? { branch } : {};
      const response = await axiosInstance.get('/admin/Complaint', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching complaints:', error);
      throw error;
    }
  },

  // Get complaint statistics
  getComplaintStats: async (branch = null) => {
    try {
      const params = branch && branch !== 'All Branches' ? { branch } : {};
      const response = await axiosInstance.get('/admin/Complaint/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching complaint stats:', error);
      throw error;
    }
  },

  // Get single complaint by ID
  getComplaintById: async (id) => {
    try {
      const response = await axiosInstance.get(`/admin/Complaint/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching complaint:', error);
      throw error;
    }
  },

  // Resolve a complaint
  resolveComplaint: async (id, resolution, adminComment) => {
    try {
      const response = await axiosInstance.post(`/admin/Complaint/${id}/resolve`, {
        resolution: resolution || '',
        adminComment: adminComment || ''
      });
      return response.data;
    } catch (error) {
      console.error('Error resolving complaint:', error);
      throw error;
    }
  },

  // Take action on complaint (mark as In Progress)
  takeActionOnComplaint: async (id, adminComment) => {
    try {
      const response = await axiosInstance.post(`/admin/Complaint/${id}/take-action`, {
        adminComment: adminComment || ''
      });
      return response.data;
    } catch (error) {
      console.error('Error taking action on complaint:', error);
      throw error;
    }
  },

  // Reject a complaint (mark as Open with rejection comment)
  rejectComplaint: async (id, adminComment) => {
    try {
      const response = await axiosInstance.post(`/admin/Complaint/${id}/reject`, {
        adminComment: adminComment || ''
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting complaint:', error);
      throw error;
    }
  },
};

export default adminComplaintService;
