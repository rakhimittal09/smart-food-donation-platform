import api from './api';

export const donationService = {
  getDonations: async (params = {}) => {
    const res = await api.get('/donations', { params });
    return res.data;
  },

  getMyDonations: async (params = {}) => {
    const res = await api.get('/donations/my', { params });
    return res.data;
  },

  getDonationById: async (id) => {
    const res = await api.get(`/donations/${id}`);
    return res.data;
  },

  createDonation: async (formData) => {
    const res = await api.post('/donations', formData, {
      headers: {
        'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return res.data;
  },

  updateDonation: async (id, formData) => {
    const res = await api.put(`/donations/${id}`, formData, {
      headers: {
        'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return res.data;
  },

  updateDonationStatus: async (id, status) => {
    const res = await api.put(`/donations/${id}/status`, { status });
    return res.data;
  },

  deleteDonation: async (id) => {
    const res = await api.delete(`/donations/${id}`);
    return res.data;
  },

  getNearbyNgos: async (params = {}) => {
    const res = await api.get('/donations/nearby-ngos', { params });
    return res.data;
  },

  matchDonorToNgo: async (donationId) => {
    const res = await api.get(`/donations/${donationId}/match`);
    return res.data;
  },

  getDonationCertificate: async (donationId) => {
    const res = await api.get(`/donations/${donationId}/certificate`);
    return res.data;
  },
};
