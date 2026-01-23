
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_API_URL}`;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('AdminEmployee API - Authorization header added:', config.headers.Authorization);
    } else {
      console.error('AdminEmployee API - Token is invalid or missing:', token);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear storage and redirect to login
      localStorage.clear();
      //window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
class AdminAttendanceService {
  /**
   * Get daily attendance report for employees (with filters)
   * @param {Object} filters - { date, branch, department, employeeId }
   * @returns {Promise<Array>} List of attendance records
   */
  async getDailyAttendance(filters = {}) {
    const params = {};
    if (filters.date) params.date = filters.date;
    if (filters.branch) params.branch = filters.branch;
    if (filters.department) params.department = filters.department;
    if (filters.employeeId) params.employeeId = filters.employeeId;
    const response = await axiosInstance.get('/admin/AdminAttendance/daily', { params });
    return response.data;
  }

  /**
   * Get attendance report for a date range (inclusive)
   * @param {Object} filters - { fromDate, toDate, branch, department, employeeId }
   * @returns {Promise<Array>} List of attendance records
   */
  async getAttendanceRange(filters = {}) {
    const params = {};
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    if (filters.branch) params.branch = filters.branch;
    if (filters.department) params.department = filters.department;
    if (filters.employeeId) params.employeeId = filters.employeeId;
    const response = await axiosInstance.get('/admin/AdminAttendanceReport/range', { params });
    return response.data;
  }

  /**
   * Get complaint summary report for a date range (inclusive)
   * @param {Object} filters - { fromDate, toDate, branch, department, employeeId }
   * @returns {Promise<Array>} List of complaint summary records
   */
  async getComplaintSummaryRange(filters = {}) {
    const params = {};
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    if (filters.branch) params.branch = filters.branch;
    if (filters.department) params.department = filters.department;
    if (filters.employeeId) params.employeeId = filters.employeeId;
    const response = await axiosInstance.get('/admin/AdminAttendanceReport/complaints-range', { params });
    return response.data;
  }

    /**
   * Get tech issues report for a date range (inclusive)
   * @param {Object} filters - { fromDate, toDate, branch, department, employeeId }
   * @returns {Promise<Array>} List of tech issues records
   */
  async getTechIssuesRange(filters = {}) {
    const params = {};
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    if (filters.branch) params.branch = filters.branch;
    if (filters.department) params.department = filters.department;
    if (filters.employeeId) params.employeeId = filters.employeeId;
    const response = await axiosInstance.get('/admin/AdminAttendanceReport/tech-issues-range', { params });
    return response.data;
  }
}

const adminAttendanceService = new AdminAttendanceService();
export default adminAttendanceService;
