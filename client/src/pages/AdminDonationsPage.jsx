import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../services/donationService';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../components/ConfirmationModal';
import { Utensils, Trash2, Eye, MapPin, Clock } from 'lucide-react';

const AdminDonationsPage = () => {
  const { showToast } = useToast();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });

  // Delete modal state
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchDonations = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 12, includeExpired: 'true' };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await donationService.getDonations(params);
      if (res.success) {
        setDonations(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch donations for admin:', err);
      showToast('error', 'Failed to retrieve food listings.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, showToast]);

  useEffect(() => {
    fetchDonations(pagination.page);
  }, [fetchDonations, pagination.page]);

  const handleStatusChange = async (donationId, newStatus) => {
    try {
      const res = await donationService.updateDonationStatus(donationId, newStatus);
      if (res.success) {
        showToast('success', `Listing status set to ${newStatus}`);
        fetchDonations(pagination.page);
      }
    } catch (err) {
      showToast('error', 'Status update failed.');
    }
  };

  const handleDeleteDonation = async () => {
    if (!selectedDonation) return;
    try {
      setDeleting(true);
      const res = await donationService.deleteDonation(selectedDonation._id);
      if (res.success) {
        showToast('info', 'Donation listing removed.');
        setShowDeleteModal(false);
        fetchDonations(pagination.page);
      }
    } catch (err) {
      showToast('error', 'Failed to delete listing.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Administration
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>
              Food Donation Moderation
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Inspect and moderate all active, scheduled, and past surplus listings.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['all', 'Available', 'Pending', 'Accepted', 'Picked Up', 'Delivered', 'Expired', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem' }}
              >
                {st === 'all' ? 'All Statuses' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <SearchBar onSearch={setSearchTerm} placeholder="Search food title, city, or description..." />
        </div>

        {/* Listings Table */}
        {loading ? (
          <LoadingSpinner text="Loading food records..." />
        ) : donations.length === 0 ? (
          <EmptyState
            icon={Utensils}
            title="No Listings Found"
            description="No food donations match the selected filter criteria."
          />
        ) : (
          <div className="table-container" style={{ marginBottom: '2rem' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Donor Entity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{d.foodName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {d.city} • Expiry: {new Date(d.expiryDate).toLocaleDateString()}
                      </div>
                    </td>

                    <td>
                      <span className="badge" style={{ background: 'var(--bg-main)' }}>{d.category}</span>
                    </td>

                    <td>
                      <strong>{d.quantity}</strong> {d.unit}
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {d.donor?.organizationName || d.donor?.name || 'Verified Donor'}
                      </div>
                    </td>

                    <td>
                      <select
                        className="form-select"
                        value={d.status}
                        onChange={(e) => handleStatusChange(d._id, e.target.value)}
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.775rem', width: 'auto' }}
                      >
                        <option value="Available">Available</option>
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Picked Up">Picked Up</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Expired">Expired</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Link to={`/donations/${d._id}`} className="btn btn-secondary btn-icon" title="View details">
                          <Eye size={15} />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedDonation(d);
                            setShowDeleteModal(true);
                          }}
                          className="btn btn-secondary btn-icon"
                          style={{ color: 'var(--rose-600)' }}
                          title="Delete listing"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        />

      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteDonation}
        title="Delete Food Listing"
        message={`Are you sure you want to permanently delete "${selectedDonation?.foodName}"?`}
        confirmText="Confirm Delete"
        isDanger={true}
        loading={deleting}
      />

    </DashboardLayout>
  );
};

export default AdminDonationsPage;
