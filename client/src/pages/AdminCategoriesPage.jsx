import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { Layers, PlusCircle, Edit, Trash2 } from 'lucide-react';

const AdminCategoriesPage = () => {
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '🍱', status: 'active' });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [selectedDelete, setSelectedDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCategories();
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      showToast('error', 'Failed to retrieve food categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({ name: '', description: '', icon: '🍱', status: 'active' });
    setShowFormModal(true);
  };

  const handleOpenEdit = (cat) => {
    setModalMode('edit');
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || '🍱',
      status: cat.status || 'active',
    });
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      setSubmitting(true);
      if (modalMode === 'create') {
        const res = await adminService.createCategory(formData);
        if (res.success) {
          showToast('success', 'Category created successfully!');
          setShowFormModal(false);
          fetchCategories();
        }
      } else {
        const res = await adminService.updateCategory(editingCategory._id, formData);
        if (res.success) {
          showToast('success', 'Category updated successfully!');
          setShowFormModal(false);
          fetchCategories();
        }
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDelete) return;
    try {
      setDeleting(true);
      const res = await adminService.deleteCategory(selectedDelete._id);
      if (res.success) {
        showToast('info', 'Category removed.');
        setShowDeleteModal(false);
        fetchCategories();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete category.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Administration
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>
              Food Category Manager
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Define and structure meal classifications for donation listings.
            </p>
          </div>

          <button onClick={handleOpenCreate} className="btn btn-primary" style={{ gap: '0.4rem' }}>
            <PlusCircle size={18} /> Add New Category
          </button>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <LoadingSpinner text="Fetching categories..." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {categories.map((cat) => (
              <div key={cat._id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '2rem' }}>{cat.icon || '🍱'}</span>
                    <span className={`badge ${cat.status === 'active' ? 'badge-available' : 'badge-rejected'}`}>
                      {cat.status}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{cat.name}</h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: '1.5' }}>
                    {cat.description || 'No description provided.'}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.25rem', fontSize: '0.75rem' }}
                  >
                    <Edit size={13} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDelete(cat);
                      setShowDeleteModal(true);
                    }}
                    className="btn btn-secondary btn-icon"
                    style={{ color: 'var(--rose-600)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={modalMode === 'create' ? 'Create New Category' : 'Edit Category'}
        maxWidth="480px"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Desserts & Sweets"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Emoji Icon</label>
              <input
                type="text"
                className="form-input"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🍰"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows="2"
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short summary of items in this category"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={() => setShowFormModal(false)} className="btn btn-secondary btn-sm" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Category' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Food Category"
        message={`Are you sure you want to remove "${selectedDelete?.name}"? Existing donations in this category will keep their label.`}
        confirmText="Confirm Delete"
        isDanger={true}
        loading={deleting}
      />

    </DashboardLayout>
  );
};

export default AdminCategoriesPage;
