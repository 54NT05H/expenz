import axiosClient from './axiosClient';

export const budgetApi = {
  // Get monthly budget for specific month/year or current
  getBudget: async (month, year) => {
    const response = await axiosClient.get('/budget', { params: { month, year } });
    return response.data;
  },

  // Set or update monthly budget limit
  setBudget: async (budgetData) => {
    const response = await axiosClient.post('/budget', budgetData);
    return response.data;
  },

  // Get budget analytics & category limits
  getBudgetSummary: async () => {
    const response = await axiosClient.get('/budget/summary');
    return response.data;
  },
};
