import api from './api';

const holidayService = {
  // Get holidays for a specific month and optional branch
  getHolidayCalendar: async (year, month, branchId = null) => {
    try {
      const params = {
        year,
        month
      };
      
      if (branchId && branchId !== 'All Branches') {
        params.branchId = branchId;
      }

      const response = await api.get('/admin/AdminAttendance/holidays/calendar', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching holiday calendar:', error);
      throw error;
    }
  },

  // Create a new holiday
  createHoliday: async (holidayData) => {
    try {
      const response = await api.post('/admin/AdminAttendance/holidays', holidayData);
      return response.data;
    } catch (error) {
      console.error('Error creating holiday:', error);
      throw error;
    }
  },

  // Delete a holiday
  deleteHoliday: async (holidayId) => {
    try {
      const response = await api.delete(`/admin/AdminAttendance/holidays/${holidayId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting holiday:', error);
      throw error;
    }
  },

  // Get holidays for a date range
  getHolidaysForDateRange: async (startDate, endDate, branchId = null) => {
    try {
      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };
      
      if (branchId && branchId !== 'All Branches') {
        params.branchId = branchId;
      }

      const response = await api.get('/admin/AdminAttendance/holidays/daterange', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching holidays for date range:', error);
      throw error;
    }
  }
};

export default holidayService;