import api from './api';

/**
 * categoryService.js
 * Dedicated service for Food Category API operations.
 * Categories are publicly readable; CUD operations require Admin role.
 */
export const categoryService = {
  // @desc  Get all active categories (public)
  // @route GET /api/categories
  getCategories: async () => {
    const res = await api.get('/categories');
    return res.data;
  },

  // @desc  Create a new category (Admin only)
  // @route POST /api/categories
  createCategory: async (data) => {
    const res = await api.post('/categories', data);
    return res.data;
  },

  // @desc  Update an existing category (Admin only)
  // @route PUT /api/categories/:id
  updateCategory: async (id, data) => {
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
  },

  // @desc  Delete a category (Admin only — blocked if active donations reference it)
  // @route DELETE /api/categories/:id
  deleteCategory: async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
};
