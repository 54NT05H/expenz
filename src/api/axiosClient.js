import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enables HTTP-Only JWT Cookie sending
});

// Response interceptor for handling 401 Unauthorized
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns 401 on protected endpoint and we are not already on /login
    if (error.response?.status === 401 && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      // Optional: dispatch custom event or let AuthContext handle it
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
