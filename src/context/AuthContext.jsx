import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Nobody is logged in until the server confirms it.
  const [user, setUser] = useState(null);
  // true while we ask the server "is there a valid session?"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    authApi
      .getMe()
      .then((data) => {
        if (!cancelled) setUser(data.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // The axios interceptor fires this event when the server says 401.
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      cancelled = true;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  // No try/catch here on purpose: if the server rejects, the error travels up
  // to the page, which shows it to the user.
  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the request fails, clear the local state.
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, login, register, logout }}
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