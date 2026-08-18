import api from './api';

export const userService = {
  getProfile: async () => {
    const res = await api.get('/users/profile');
    return res.data;
  },

  updateProfile: async (userData) => {
    const res = await api.put('/users/profile', userData);
    return res.data;
  },

  changePassword: async (passwordData) => {
    const res = await api.put('/users/change-password', passwordData);
    return res.data;
  },

  getDashboardStats: async () => {
    const res = await api.get('/users/dashboard-stats');
    return res.data;
  },
};
