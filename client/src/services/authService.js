import api from './api';

export const authService = {
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  logout: async () => {
    try {
      const res = await api.post('/auth/logout');
      return res.data;
    } catch {
      // Ignore if failed on server, token cleared on client
      return { success: true };
    }
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
