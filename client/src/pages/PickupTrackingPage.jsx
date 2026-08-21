import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { requestService } from '../services/requestService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import Timeline from '../components/Timeline';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  Truck,
  MapPin,
  Phone,
  Building2,
  CheckCircle2,
  ArrowLeft,
  PackageCheck,
} from 'lucide-react';

const statusBadgeClass = (status) => {
  if (status === 'Delivered') return 'badge-completed';
  if (status === 'Accepted') return 'badge-approved';
  if (status === 'Picked Up') return 'badge-available';
  if (status === 'Pending') return 'badge-pending';
  return 'badge-rejected';
};

const PickupTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDonor, isReceiver, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pickupDetails, setPickupDetails] = useState({
    pickupPersonName: '',
    pickupPersonPhone: '',
    vehicleNumber: '',
    notes: '',
  });
  const [savingDetails, setSavingDetails] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequestDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await requestService.getRequestById(id);
      if (res.success && res.data) {
        setRequest(res.data);
        if (res.data.pickupDetails) {
          setPickupDetails({
            pickupPersonName: res.data.pickupDetails.pickupPersonName || '',
            pickupPersonPhone: res.data.pickupDetails.pickupPersonPhone || '',
            vehicleNumber: res.data.pickupDetails.vehicleNumber || '',
            notes: res.data.pickupDetails.notes || '',
          });
        }
      }
    } catch (err) {
      console.error('Failed to load tracking details:', err);
      showToast('error', 'Request not found or access denied.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showToast]);

  useEffect(() => {
    fetchRequestDetails();
  }, [fetchRequestDetails]);

  const handleUpdatePickupDetails = async (e) => {
    e.preventDefault();
    try {
      setSavingDetails(true);
      const res = await requestService.updateRequestStatus(id, { ...pickupDetails });
      if (res.success) {
        showToast('success', 'Pickup contact details updated.');
        fetchRequestDetails();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update details.');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setActionLoading(true);
      const res = await requestService.updateRequestStatus(id, { status: newStatus });
      if (res.success) {
        if (newStatus === 'Delivered') {
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        }
        showToast('success', `Status updated to: ${newStatus}`);
        setConfirmStatus(null);
        fetchRequestDetails();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !request) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullPage text="Loading pickup timeline..." />
      </DashboardLayout>
    );
  }

  const donation = request.donation || {};
  const receiver = request.receiver || {};
  const donor = donation.donor || {};
  const isDelivered = request.status === 'Delivered';

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem', marginBottom: '0.5rem' }}>
              <ArrowLeft size={16} /> Back
            </button>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Pickup Tracking</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Pending → Accepted → Picked Up → Delivered • {donation.foodName}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className={`badge ${statusBadgeClass(request.status)}`} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              Status: {request.status}
            </span>

            {request.status === 'Accepted' && (isReceiver || isAdmin) && (
              <button onClick={() => setConfirmStatus('Picked Up')} className="btn btn-secondary" style={{ gap: '0.4rem' }}>
                <Truck size={16} /> Mark Picked Up
              </button>
            )}

            {request.status === 'Picked Up' && (isDonor || isReceiver || isAdmin) && (
              <button onClick={() => setConfirmStatus('Delivered')} className="btn btn-primary" style={{ gap: '0.4rem' }}>
                <PackageCheck size={18} /> Mark Delivered
              </button>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Donation Lifecycle
          </h3>
          <Timeline
            currentStatus={request.status}
            timeline={request.pickupDetails?.timeline || []}
            rejectionReason={request.rejectionReason}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontWeight: 700 }}>
              <Truck size={20} style={{ color: 'var(--primary-600)' }} />
              <span>Pickup Contact Details</span>
            </div>

            <form onSubmit={handleUpdatePickupDetails}>
              <div className="form-group">
                <label className="form-label">Pickup Person Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={pickupDetails.pickupPersonName}
                  onChange={(e) => setPickupDetails({ ...pickupDetails, pickupPersonName: e.target.value })}
                  disabled={isDelivered}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={pickupDetails.pickupPersonPhone}
                    onChange={(e) => setPickupDetails({ ...pickupDetails, pickupPersonPhone: e.target.value })}
                    disabled={isDelivered}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Vehicle Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={pickupDetails.vehicleNumber}
                    onChange={(e) => setPickupDetails({ ...pickupDetails, vehicleNumber: e.target.value })}
                    disabled={isDelivered}
                  />
                </div>
              </div>

              {!isDelivered && (
                <button type="submit" className="btn btn-secondary btn-sm" disabled={savingDetails} style={{ width: '100%', marginTop: '0.5rem' }}>
                  {savingDetails ? 'Saving...' : 'Update Pickup Details'}
                </button>
              )}
            </form>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <MapPin size={18} style={{ color: 'var(--primary-600)' }} />
              <span>Pickup Location</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              <strong>Donor:</strong> {donor.organizationName || donor.name} <br />
              <strong>Address:</strong> {donation.pickupAddress} <br />
              <strong>City:</strong> {donation.city}, {donation.state} - {donation.pincode} <br />
              <strong>Time Slot:</strong> {donation.pickupTime}
            </p>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Building2 size={18} style={{ color: 'var(--amber-600)' }} />
                <span>Receiving NGO</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                <strong>Organization:</strong> {receiver.organizationName || receiver.name} <br />
                <strong>Phone:</strong> {receiver.phone} <br />
                <strong>Quantity:</strong> {request.requestedQuantity} {donation.unit}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmStatus === 'Picked Up'}
        onClose={() => setConfirmStatus(null)}
        onConfirm={() => handleStatusUpdate('Picked Up')}
        title="Confirm Picked Up"
        message="Has the NGO collected the surplus food from the donor location?"
        confirmText="Yes, Mark Picked Up"
        loading={actionLoading}
      />

      <ConfirmationModal
        isOpen={confirmStatus === 'Delivered'}
        onClose={() => setConfirmStatus(null)}
        onConfirm={() => handleStatusUpdate('Delivered')}
        title="Confirm Delivered"
        message="Has the food been delivered to the people in need?"
        confirmText="Yes, Mark Delivered"
        loading={actionLoading}
      />
    </DashboardLayout>
  );
};

export default PickupTrackingPage;
