import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { donationService } from '../services/donationService';
import { requestService } from '../services/requestService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FoodCard from '../components/FoodCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { Compass, PlusCircle, AlertCircle, HeartHandshake, Truck } from 'lucide-react';

const DonationsPage = () => {
  const { user, isReceiver, isDonor, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });

  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    foodType: 'all',
    city: 'all',
    status: 'Available',
    page: 1,
  });

  // Request Modal State
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [requestMessage, setRequestMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        limit: 9,
      };
      if (filters.search) params.search = filters.search;
      if (filters.category && filters.category !== 'all') params.category = filters.category;
      if (filters.foodType && filters.foodType !== 'all') params.foodType = filters.foodType;
      if (filters.city && filters.city !== 'all') params.city = filters.city;
      if (filters.status && filters.status !== 'all') params.status = filters.status;

      const res = await donationService.getDonations(params);
      if (res.success) {
        setDonations(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
      showToast('error', 'Failed to fetch food listings.');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (term) => {
    setFilters((prev) => ({ ...prev, search: term, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      foodType: 'all',
      city: 'all',
      status: 'Available',
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRequest = (donation) => {
    if (!isAuthenticated) {
      showToast('info', 'Please sign in as a registered NGO to request food.');
      navigate('/login');
      return;
    }
    if (!isReceiver && !user?.role === 'admin') {
      showToast('warning', 'Only registered NGOs / Receivers can place food requests.');
      return;
    }
    setSelectedDonation(donation);
    setRequestedQuantity(donation.quantity);
    setRequestMessage(`We will collect and distribute these meals to underprivileged families in ${donation.city}.`);
    setShowRequestModal(true);
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!selectedDonation) return;

    try {
      setSubmittingRequest(true);
      const res = await requestService.createRequest({
        donationId: selectedDonation._id,
        requestedQuantity: Number(requestedQuantity),
        message: requestMessage,
      });

      if (res.success) {
        showToast('success', 'Food request submitted! Awaiting donor approval.');
        setShowRequestModal(false);
        fetchDonations();
        navigate(`/pickup-tracking/${res.data._id}`);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to submit food request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div style={{ padding: '3rem 0', background: 'var(--bg-main)', minHeight: 'calc(100vh - 72px)' }}>
      <div className="container">
        
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Explore Network
            </span>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem' }}>
              Browse Available Food Donations
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Discover surplus meals posted by verified restaurants, event organizers, and community kitchens.
            </p>
          </div>

          {isDonor && (
            <button onClick={() => navigate('/donations/create')} className="btn btn-primary" style={{ gap: '0.5rem' }}>
              <PlusCircle size={18} /> Post Food Listing
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '1.25rem' }}>
          <SearchBar onSearch={handleSearch} placeholder="Search by food name, category, or city..." defaultValue={filters.search} />
        </div>

        {/* Filter Panel */}
        <FilterPanel filters={filters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />

        {/* Results Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <span>
            Showing <strong>{donations.length}</strong> of <strong>{pagination.totalItems}</strong> food listings
          </span>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <LoadingSpinner text="Fetching available food donations..." />
        ) : donations.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No Food Donations Match Your Filters"
            description="Try adjusting your search criteria or resetting filters to see other active listings."
            action={
              <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
                Reset All Filters
              </button>
            }
          />
        ) : (
          <div className="grid-3">
            {donations.map((donation) => (
              <FoodCard
                key={donation._id}
                donation={donation}
                onRequestClick={handleOpenRequest}
                isDonorView={isDonor && donation.donor?._id === user?._id}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />

      </div>

      {/* Request Food Modal */}
      {selectedDonation && (
        <Modal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          title="Submit Food Request"
          maxWidth="560px"
        >
          <form onSubmit={handleSendRequest}>
            <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                {selectedDonation.foodName}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Offered by: <strong>{selectedDonation.donor?.organizationName || selectedDonation.donor?.name}</strong> • {selectedDonation.city}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--primary-700)', fontWeight: 600, marginTop: '0.35rem' }}>
                Available Total: {selectedDonation.quantity} {selectedDonation.unit}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Quantity Needed ({selectedDonation.unit}) *
              </label>
              <input
                type="number"
                min="1"
                max={selectedDonation.quantity}
                className="form-input"
                value={requestedQuantity}
                onChange={(e) => setRequestedQuantity(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Distribution Plan / Note to Donor *
              </label>
              <textarea
                rows="3"
                className="form-textarea"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Explain who will receive this food and approximate collection timing..."
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="btn btn-secondary btn-sm"
                disabled={submittingRequest}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submittingRequest}
              >
                {submittingRequest ? 'Submitting Request...' : 'Send Request to Donor'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DonationsPage;
