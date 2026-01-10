import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const complaintService = {
  // Get complaints for logged-in employee
  getComplaints: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Complaint/my-complaints`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching complaints:', error);
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
      const response = await axios.post(
        `${API_BASE_URL}/Complaint`,
        complaintData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting complaint:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit complaint',
        data: null
      };
    }
  }
};

export default complaintService;
