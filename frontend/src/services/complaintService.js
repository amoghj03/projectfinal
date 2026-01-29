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
      localStorage.removeItem('authToken');
      //window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const complaintService = {
  // Get complaints for logged-in employee
  getComplaints: async () => {
    try {
      const response = await axiosInstance.get('/Complaint/my-complaints');
      return response.data;
    } catch (error) {
      console.error('Error fetching complaints:', error);
      // Handle 500 errors that were converted to response
      if (error.response?.data?.isServerError) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch complaints',
        data: []
      };
    }
  },

  // Submit a new complaint
  submitComplaint: async (complaintData) => {
    try {
      const response = await axiosInstance.post('/Complaint', complaintData);
      return response.data;
    } catch (error) {
      console.error('Error submitting complaint:', error);
      // Handle 500 errors that were converted to response
      if (error.response?.data?.isServerError) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit complaint',
        data: null
      };
    }
  },

  // Mark complaint as resolved (Approval Pending status)
  markComplaintResolved: async (complaintId, closingComments) => {
    try {
      const response = await axiosInstance.put(`/Complaint/${complaintId}/mark-resolved`, { closingComments });
      return response.data;
    } catch (error) {
      console.error('Error marking complaint as resolved:', error);
      // Handle 500 errors that were converted to response
      if (error.response?.data?.isServerError) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark complaint as resolved',
        data: null
      };
    }
  }
};

export default complaintService;

