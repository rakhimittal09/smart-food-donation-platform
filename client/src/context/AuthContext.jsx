import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sfd_token') || null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Fetch current user details on boot if token exists
  // NOTE: Do NOT call logout() here — it is declared with `const` below,
  // so calling it inside loadUser triggers a ReferenceError on first render.
  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        // Silently clear stale token (no toast on page load)
        localStorage.removeItem('sfd_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      // Token expired or server error — clear auth silently on startup
      localStorage.removeItem('sfd_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('sfd_token', res.token);
        setToken(res.token);
        setUser(res.data);
        showToast('success', `Welcome back, ${res.data.name}!`);
        return { success: true, user: res.data };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast('error', msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await authService.register(userData);
      if (res.success && res.token) {
        localStorage.setItem('sfd_token', res.token);
        setToken(res.token);
        setUser(res.data);
        showToast('success', `Account created successfully! Welcome to NourishLink.`);
        return { success: true, user: res.data };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please verify your details.';
      showToast('error', msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('sfd_token');
      setToken(null);
      setUser(null);
      showToast('info', 'You have been logged out.');
    }
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
  };

  const isDonor = user?.role === 'donor';
  const isReceiver = user?.role === 'receiver';
  const isAdmin = user?.role === 'admin';
  const isVolunteer = user?.role === 'volunteer';

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isDonor,
    isReceiver,
    isAdmin,
    isVolunteer,
    login,
    register,
    logout,
    updateUserState,
    reloadUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};