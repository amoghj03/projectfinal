import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';


const profileService = {
  resetPassword: async (currentPassword, newPassword) => {
    const token = localStorage.getItem('authToken');
    const res = await axios.post(
      `${API_BASE}/Profile/reset-password`,
      { currentPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  },
  getProfile: async () => {
    const token = localStorage.getItem('authToken');
    const res = await axios.get(
      `${API_BASE}/Profile/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  },
};

export default profileService;
