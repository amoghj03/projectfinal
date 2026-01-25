
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
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      //window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

const adminSettingsService = {
  getSettings: async () => {
    const res = await axiosInstance.get('/admin/AdminSettings');
    return res.data;
  },
  updateSetting: async (id, data) => {
    const res = await axiosInstance.put(`/admin/AdminSettings/${id}`, data);
    return res.data;
  },
};

export default adminSettingsService;
