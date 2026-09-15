import axiosClient from './axiosClient';

export const expenseApi = {
  // Fetch all expenses with optional filters (category, startDate, endDate, search)
  getAllExpenses: async (params = {}) => {
    const response = await axiosClient.get('/expenses', { params });
    return response.data;
  },

  // Add a new expense
  addExpense: async (expenseData) => {
    const response = await axiosClient.post('/expenses', expenseData);
    return response.data;
  },

  // Update existing expense
  updateExpense: async (id, expenseData) => {
    const response = await axiosClient.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  // Delete expense
  deleteExpense: async (id) => {
    const response = await axiosClient.delete(`/expenses/${id}`);
    return response.data;
  },

  // Fetch expense statistics / summary for charts
  getExpenseStats: async (params = {}) => {
    const response = await axiosClient.get('/expenses/stats', { params });
    return response.data;
  },
};
