import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          if (response.data && response.data.success) {
            setUser(response.data.data);
          }
        } catch (error) {
          console.error('Failed to load user profile:', error.message);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data && response.data.success) {
      const { token, ...userData } = response.data.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return userData;
    }
    throw new Error(response.data?.error?.message || 'Login failed');
  };

  const register = async (name, email, password, businessName) => {
    const response = await api.post('/auth/register', { name, email, password, businessName });
    if (response.data && response.data.success) {
      const { token, ...userData } = response.data.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return userData;
    }
    throw new Error(response.data?.error?.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Provide user profile update helper
  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfileState }}>
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
