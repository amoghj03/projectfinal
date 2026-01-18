import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

const roleService = {
  // Get all roles
  getAllRoles: async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/adminrole/roles`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  // Get role by ID
  getRoleById: async (roleId) => {
    try {
      const response = await axios.get(`${API_URL}/admin/adminrole/roles/${roleId}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  },

  // Get all permissions
  getAllPermissions: async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/adminrole/permissions`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  },

  // Update role (name, description, and permissions)
  updateRole: async (roleId, roleData) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/adminrole/roles/${roleId}`,
        roleData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  },

  // Update role permissions only
  updateRolePermissions: async (roleId, permissionIds) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/adminrole/roles/${roleId}/permissions`,
        permissionIds,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating role permissions:', error);
      throw error;
    }
  },
};

export default roleService;
