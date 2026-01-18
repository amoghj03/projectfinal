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
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const payslipService = {
  // Get all employees for payslip generation
  getEmployeesForPayslip: async (branch = null) => {
    try {
      const params = branch && branch !== 'All Branches' ? { branch } : {};
      const response = await axiosInstance.get('/admin/adminpayslip/employees', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching employees for payslip:', error);
      throw error;
    }
  },

  // Generate payslip
  generatePayslip: async (payslipData) => {
    try {
      const response = await axiosInstance.post('/admin/adminpayslip/generate', payslipData);
      return response.data;
    } catch (error) {
      console.error('Error generating payslip:', error);
      throw error;
    }
  },
};

export default payslipService;
