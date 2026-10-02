import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enables HTTP-Only JWT Cookie sending
});

// Only treat auth-related 401s as session expiry. Expense CRUD requests may fail
// for other reasons without requiring the user to be kicked back to login.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    // A wrong password on the login/register form is also a 401,
    // but that shouldn't count as "your session expired".
    const isLoginAttempt = url.includes('/auth/login') || url.includes('/auth/register');

    if (error.response?.status === 401 && !isLoginAttempt) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
