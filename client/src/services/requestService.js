import api from './api';

export const requestService = {
  getRequests: async (params = {}) => {
    const res = await api.get('/requests', { params });
    return res.data;
  },

  getRequestById: async (id) => {
    const res = await api.get(`/requests/${id}`);
    return res.data;
  },

  createRequest: async (requestData) => {
    const res = await api.post('/requests', requestData);
    return res.data;
  },

  updateRequestStatus: async (id, statusData) => {
    const res = await api.put(`/requests/${id}/status`, statusData);
    return res.data;
  },
};
