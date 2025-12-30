const API_BASE_URL = 'http://localhost:5000/api';

class LeaveService {
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  getHeaders() {
    const token = this.getAuthToken();
    console.log('Token in getHeaders:', token); // Debug log
    const headers = {
      'Content-Type': 'application/json', 
    };
    
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header added:', headers['Authorization']); // Debug log
    } else {
      console.error('Token is invalid or missing:', token);
    }
    
    console.log('Final headers:', headers); // Debug log
    return headers;
  }

  /**
   * Submit a new leave request
   * @param {Object} requestData - Leave request data
   * @param {string} requestData.leaveType - Leave type name (not ID)
   * @param {string} requestData.startDate - Start date (YYYY-MM-DD)
   * @param {string} requestData.endDate - End date (YYYY-MM-DD)
   * @param {string} requestData.reason - Reason for leave
   * @param {boolean} requestData.isHalfDay - Is half day leave
   * @param {string} requestData.halfDayPeriod - Half day period (morning/afternoon)
   */
  async submitLeaveRequest(requestData) {
    try {
      const response = await fetch(`${API_BASE_URL}/Leave/submit`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting leave request:', error);
      throw error;
    }
  }

  /**
   * Get all leave requests for the authenticated employee
   */
  async getLeaveRequests() {
    try {
      const response = await fetch(`${API_BASE_URL}/Leave/requests`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      throw error;
    }
  }

  /**
   * Get leave balance for the authenticated employee
   */
  async getLeaveBalance() {
    try {
      const response = await fetch(`${API_BASE_URL}/Leave/balance`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      throw error;
    }
  }

  /**
   * Get a specific leave request by ID
   * @param {number} leaveRequestId - Leave request ID
   */
  async getLeaveRequestById(leaveRequestId) {
    try {
      const response = await fetch(`${API_BASE_URL}/Leave/requests/${leaveRequestId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching leave request:', error);
      throw error;
    }
  }

  /**
   * Get available leave types for the tenant
   */
  async getLeaveTypes() {
    try {
      const response = await fetch(`${API_BASE_URL}/Leave/types`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching leave types:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const leaveService = new LeaveService();
export default leaveService;
