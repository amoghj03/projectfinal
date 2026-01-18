import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_API_URL}`;

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
  },

  // Mark complaint as resolved (Approval Pending status)
  markComplaintResolved: async (complaintId, closingComments) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/Complaint/${complaintId}/mark-resolved`,
        { closingComments },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking complaint as resolved:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark complaint as resolved',
        data: null
      };
    }
  }
};

export default complaintService;

