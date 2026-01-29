import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}`;

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
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
      localStorage.clear();
    }
    return Promise.reject(error);
  }
);

const roleService = {
  // Get all roles
  getAllRoles: async () => {
    try {
      const response = await axiosInstance.get('/admin/adminrole/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      // Handle 500 errors that were converted to response
      if (error.response?.data?.isServerError) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Get role by ID
  getRoleById: async (roleId) => {
    try {
      const response = await axiosInstance.get(`/admin/adminrole/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role:', error);
      if (error.response?.data?.isServerError) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Get all permissions
  getAllPermissions: async () => {
    try {
      const response = await axiosInstance.get('/admin/adminrole/permissions');
      return response.data;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      if (error.response?.data?.isServerError) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Update role (name, description, and permissions)
  updateRole: async (roleId, roleData) => {
    try {
      const response = await axiosInstance.put(`/admin/adminrole/roles/${roleId}`, roleData);
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      if (error.response?.data?.isServerError) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Update role permissions only
  updateRolePermissions: async (roleId, permissionIds) => {
    try {
      const response = await axiosInstance.put(`/admin/adminrole/roles/${roleId}/permissions`, permissionIds);
      return response.data;
    } catch (error) {
      console.error('Error updating role permissions:', error);
      if (error.response?.data?.isServerError) {
        return error.response.data;
      }
      throw error;
    }
  },
};

export default roleService;
