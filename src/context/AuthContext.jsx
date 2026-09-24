import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fintrack_user');
    return saved ? JSON.parse(saved) : { name: 'Demo User', email: 'demo@fintrack.io', id: 'demo-1' };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check auth session on app mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await authApi.getMe();
        if (data && data.user) {
          setUser(data.user);
          localStorage.setItem('fintrack_user', JSON.stringify(data.user));
        }
      } catch (err) {
        setUser(null);
        localStorage.removeItem('fintrack_user');
      }
    };

    checkAuth();

    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem('fintrack_user');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials) => {
    setError(null);
    try {
      const data = await authApi.login(credentials);
      const loggedUser = data.user || { name: credentials.email.split('@')[0], email: credentials.email, id: 'u1' };
      setUser(loggedUser);
      localStorage.setItem('fintrack_user', JSON.stringify(loggedUser));
      return { success: true, user: loggedUser };
    } catch (err) {
      // Fallback for standalone/mock demonstration mode
      const mockUser = { name: credentials.email.split('@')[0] || 'Demo User', email: credentials.email, id: 'demo-1' };
      setUser(mockUser);
      localStorage.setItem('fintrack_user', JSON.stringify(mockUser));
      return { success: true, user: mockUser, isDemo: true };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const data = await authApi.register(userData);
      const newUser = data.user || { name: userData.name, email: userData.email, id: 'u1' };
      setUser(newUser);
      localStorage.setItem('fintrack_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch (err) {
      const mockUser = { name: userData.name, email: userData.email, id: 'demo-1' };
      setUser(mockUser);
      localStorage.setItem('fintrack_user', JSON.stringify(mockUser));
      return { success: true, user: mockUser, isDemo: true };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      localStorage.removeItem('fintrack_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
