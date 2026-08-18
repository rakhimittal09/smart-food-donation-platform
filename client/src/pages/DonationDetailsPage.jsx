import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { donationService } from '../services/donationService';
import { requestService } from '../services/requestService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  MapPin,
  Clock,
  Calendar,
  Phone,
  UserCheck,
  Building2,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Edit,
  Trash2,
  Share2,
} from 'lucide-react';

const DonationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isReceiver, isDonor, isAdmin, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [donation, setDonation] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [requestMessage, setRequestMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await donationService.getDonationById(id);
      if (res.success && res.data) {
        setDonation(res.data);
        setRequests(res.requests || []);
        setRequestedQuantity(res.data.quantity);
        setRequestMessage(`We would like to collect ${res.data.foodName} for community distribution.`);
      }
    } catch (err) {
      console.error('Error fetching donation details:', err);
      showToast('error', 'Food listing not found.');
      navigate('/donations');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showToast]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('info', 'Please sign in to submit a food request.');
      navigate('/login');
      return;
    }
    if (!isReceiver && !isAdmin) {
      showToast('warning', 'Only registered NGOs can request food.');
      return;
    }

    try {
      setSubmittingRequest(true);
      const res = await requestService.createRequest({
        donationId: donation._id,
        requestedQuantity: Number(requestedQuantity),
        message: requestMessage,
      });

      if (res.success) {
        showToast('success', 'Food request placed! Awaiting donor approval.');
        setShowRequestModal(false);
        fetchDetails();
        navigate(`/pickup-tracking/${res.data._id}`);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to place request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await donationService.deleteDonation(donation._id);
      if (res.success) {
        showToast('info', 'Donation listing removed.');
        navigate(isDonor ? '/donations/my' : '/donations');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete listing.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading || !donation) {
    return <LoadingSpinner fullPage text="Loading food details..." />;
  }

  const isOwner = isDonor && user && donation.donor && String(donation.donor._id || donation.donor) === String(user._id);
  const canEdit = (isOwner || isAdmin) && donation.status === 'Available';

  const defaultFoodImages = {
    'Cooked Meals': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    'Packaged Food': 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=1200&q=80',
    'Fruits & Vegetables': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=80',
    'Bakery & Bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    'Dairy & Beverages': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80',
    'Grains & Pulses': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80',
  };

  const displayImage = donation.image
    ? donation.image.startsWith('http') || donation.image.startsWith('/uploads')
      ? donation.image
      : `http://localhost:5000${donation.image}`
    : defaultFoodImages[donation.category] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80';

  return (
    <div style={{ padding: '3rem 0', background: 'var(--bg-main)', minHeight: 'calc(100vh - 72px)' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Back Link & Quick Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <ArrowLeft size={16} /> Back to Catalog
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {canEdit && (
              <>
                <Link to={`/donations/edit/${donation._id}`} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
                  <Edit size={15} /> Edit Listing
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn btn-danger btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <Trash2 size={15} /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Details Card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-xl)', marginBottom: '2rem' }}>
          
          {/* Hero Image Banner */}
          <div style={{ position: 'relative', height: '340px', background: '#0f172a' }}>
            <img
              src={displayImage}
              alt={donation.foodName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
              }}
            />

            {/* Badges on Banner */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '0.5rem' }}>
              <span className={`badge ${donation.foodType === 'Veg' ? 'badge-veg' : donation.foodType === 'Non-Veg' ? 'badge-nonveg' : 'badge-vegan'}`}>
                {donation.foodType}
              </span>
              <span className="badge badge-available">
                {donation.category}
              </span>
              <span className="badge badge-scheduled">
                Status: {donation.status}
              </span>
            </div>

            {/* Bottom Title on Banner */}
            <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', color: '#ffffff' }}>
              <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                {donation.foodName}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.95rem', color: '#cbd5e1', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={16} style={{ color: 'var(--primary-400)' }} /> {donation.city}, {donation.state}
                </span>
                <span>•</span>
                <span style={{ fontWeight: 700, color: '#ffffff' }}>
                  Quantity: {donation.quantity} {donation.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div style={{ padding: '2.5rem 2rem' }}>
            
            {/* Description */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>About this Food Donation</h3>
              <p style={{ fontSize: '1rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
                {donation.description}
              </p>
            </div>

            {/* Specs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem', background: 'var(--bg-main)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quantity Available</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: '0.2rem' }}>
                  {donation.quantity} {donation.unit}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expiry Date & Time</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--rose-600)', marginTop: '0.2rem' }}>
                  {new Date(donation.expiryDate).toLocaleString()}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pickup Window</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {new Date(donation.pickupDate).toLocaleDateString()} ({donation.pickupTime})
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Preparation Date</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {new Date(donation.preparationDate || donation.createdAt).toLocaleDateString()}
                </div>
              </div>

            </div>

            {/* Special Instructions */}
            {donation.specialInstructions && (
              <div style={{ marginBottom: '2.5rem', padding: '1rem 1.25rem', background: 'var(--amber-50)', border: '1px solid var(--amber-200)', borderRadius: 'var(--radius-md)', color: 'var(--amber-800)' }}>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                  <AlertTriangle size={16} /> Special Handling & Packaging Notes
                </div>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{donation.specialInstructions}</p>
              </div>
            )}

            {/* Two Column: Pickup Address & Donor Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              
              {/* Pickup Address Card */}
              <div style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                  <MapPin size={18} style={{ color: 'var(--primary-600)' }} /> Pickup Location
                </div>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                  <p><strong>Address:</strong> {donation.pickupAddress}</p>
                  <p><strong>City/State:</strong> {donation.city}, {donation.state} - {donation.pincode}</p>
                  <p><strong>Slot:</strong> {donation.pickupTime}</p>
                </div>
              </div>

              {/* Donor Contact Card */}
              <div style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                  <Building2 size={18} style={{ color: 'var(--sky-600)' }} /> Donor Organization
                </div>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                  <p><strong>Organization:</strong> {donation.donor?.organizationName || donation.donor?.name}</p>
                  <p><strong>Contact Person:</strong> {donation.contactName || donation.donor?.name}</p>
                  <p><strong>Phone:</strong> {donation.contactPhone || donation.donor?.phone || 'Confidential'}</p>
                </div>
              </div>

            </div>

            {/* Request CTA for NGOs */}
            {donation.status === 'Available' && (
              <div style={{ textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="btn btn-primary btn-lg"
                  style={{ minWidth: '240px', gap: '0.6rem' }}
                >
                  <ShieldCheck size={20} /> Request This Food Donation
                </button>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Verified NGOs receive immediate SMS/Notification and secure pickup PIN upon approval.
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Existing Requests Section (Visible to Donor / Admin) */}
        {requests && requests.length > 0 && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
              Requests Placed for This Listing ({requests.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {requests.map((r) => (
                <div
                  key={r._id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{r.receiver?.organizationName || r.receiver?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Requested {r.requestedQuantity} units • "{r.message}"
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`badge ${r.status === 'Approved' ? 'badge-approved' : r.status === 'Pending' ? 'badge-pending' : 'badge-completed'}`}>
                      {r.status}
                    </span>
                    <Link to={`/pickup-tracking/${r._id}`} className="btn btn-secondary btn-sm">
                      Track
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Submit Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title={`Request "${donation.foodName}"`}
        maxWidth="560px"
      >
        <form onSubmit={handleSendRequest}>
          <div className="form-group">
            <label className="form-label">
              Quantity Required ({donation.unit}) *
            </label>
            <input
              type="number"
              min="1"
              max={donation.quantity}
              className="form-input"
              value={requestedQuantity}
              onChange={(e) => setRequestedQuantity(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Maximum available: {donation.quantity} {donation.unit}
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">
              Community Distribution Plan / Reason *
            </label>
            <textarea
              rows="3"
              className="form-textarea"
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="e.g. Distributing to 40 children at local shelter home before 8 PM."
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
              {submittingRequest ? 'Submitting...' : 'Confirm Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Food Donation"
        message="Are you sure you want to permanently delete this listing? All pending requests will be cancelled."
        confirmText="Yes, Delete Listing"
        isDanger={true}
        loading={deleting}
      />

    </div>
  );
};

export default DonationDetailsPage;
