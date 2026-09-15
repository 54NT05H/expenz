import axiosClient from './axiosClient';

export const authApi = {
  // Register new user
  register: async (userData) => {
    const response = await axiosClient.post('/auth/register', userData);
    return response.data;
  },

  // Login user (backend sets HTTP-only cookie with JWT)
  login: async (credentials) => {
    const response = await axiosClient.post('/auth/login', credentials);
    return response.data;
  },

  // Logout user (backend clears cookie)
  logout: async () => {
    const response = await axiosClient.post('/auth/logout');
    return response.data;
  },

  // Get current logged-in user profile
  getMe: async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  },
};
