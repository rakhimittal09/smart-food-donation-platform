import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { requestService } from '../services/requestService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import Timeline from '../components/Timeline';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  Truck,
  ShieldCheck,
  KeyRound,
  MapPin,
  Calendar,
  Clock,
  Phone,
  User,
  Building2,
  CheckCircle2,
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';

const PickupTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isDonor, isReceiver, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Driver details state
  const [pickupDetails, setPickupDetails] = useState({
    pickupPersonName: '',
    pickupPersonPhone: '',
    vehicleNumber: '',
    notes: '',
  });
  const [savingDetails, setSavingDetails] = useState(false);

  // Status progression modals
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showOutForPickupModal, setShowOutForPickupModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

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

  const handleCopyOtp = () => {
    if (request?.pickupDetails?.otp) {
      navigator.clipboard.writeText(request.pickupDetails.otp);
      setCopiedOtp(true);
      showToast('info', 'Pickup OTP copied to clipboard.');
      setTimeout(() => setCopiedOtp(false), 2500);
    }
  };

  const handleUpdatePickupDetails = async (e) => {
    e.preventDefault();
    try {
      setSavingDetails(true);
      const res = await requestService.updateRequestStatus(id, {
        ...pickupDetails,
      });
      if (res.success) {
        showToast('success', 'Volunteer & vehicle details updated.');
        fetchRequestDetails();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update details.');
    } finally {
      setSavingDetails(false);
    }
  };

  // Generic status updater for intermediate steps
  const handleStatusUpdate = async (newStatus, closeModalFn) => {
    try {
      setActionLoading(true);
      const res = await requestService.updateRequestStatus(id, { status: newStatus });
      if (res.success) {
        showToast('success', `Status updated to: ${newStatus}`);
        closeModalFn(false);
        fetchRequestDetails();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteHandover = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isAdmin && !enteredOtp) {
      setOtpError('Please enter the 4-digit verification code provided by the NGO/driver.');
      return;
    }
    try {
      setActionLoading(true);
      setOtpError('');
      const res = await requestService.updateRequestStatus(id, {
        status: 'Completed',
        otp: enteredOtp.trim(),
      });
      if (res.success) {
        // Trigger celebratory confetti effect!
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });

        showToast('success', 'Food Handover Completed! Thank you for reducing food waste.');
        setShowCompleteModal(false);
        setEnteredOtp('');
        fetchRequestDetails();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete handover.';
      setOtpError(msg);
      showToast('error', msg);
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

  const isCompleted = request.status === 'Completed';
  const isApproved = request.status === 'Approved';
  const isPickupScheduled = request.status === 'Pickup Scheduled';
  const isOutForPickup = request.status === 'Out for Pickup';

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem', marginBottom: '0.5rem' }}>
              <ArrowLeft size={16} /> Back
            </button>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              Pickup Tracking & Handover
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Tracking Order #{request._id.substring(request._id.length - 6).toUpperCase()} • {donation.foodName}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              className={`badge ${
                request.status === 'Completed' ? 'badge-completed' :
                request.status === 'Approved' ? 'badge-approved' :
                request.status === 'Pickup Scheduled' ? 'badge-available' :
                request.status === 'Out for Pickup' ? 'badge-requested' :
                'badge-pending'
              }`}
              style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            >
              Status: {request.status}
            </span>

            {/* Step 1: Approved → Pickup Scheduled (Donor or Admin) */}
            {isApproved && (isDonor || isAdmin) && (
              <button
                onClick={() => setShowScheduleModal(true)}
                className="btn btn-secondary"
                style={{ gap: '0.4rem' }}
              >
                <Calendar size={16} /> Mark Pickup Scheduled
              </button>
            )}

            {/* Step 2: Pickup Scheduled → Out for Pickup (Receiver or Admin) */}
            {isPickupScheduled && (isReceiver || isAdmin) && (
              <button
                onClick={() => setShowOutForPickupModal(true)}
                className="btn btn-secondary"
                style={{ gap: '0.4rem', background: '#f59e0b', color: '#fff', borderColor: '#f59e0b' }}
              >
                <Truck size={16} /> Mark Out for Pickup
              </button>
            )}

            {/* Step 3: Out for Pickup OR Approved → Complete (Donor or Admin) */}
            {(isOutForPickup || isApproved || isPickupScheduled) && (isDonor || isAdmin) && (
              <button
                onClick={() => setShowCompleteModal(true)}
                className="btn btn-primary"
                style={{ gap: '0.4rem' }}
              >
                <CheckCircle2 size={18} /> Confirm Handover Complete
              </button>
            )}
          </div>
        </div>

        {/* Stepper Timeline Visualizer */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Pickup & Delivery Progress
          </h3>
          <Timeline
            currentStatus={request.status}
            timeline={request.pickupDetails?.timeline || []}
            rejectionReason={request.rejectionReason}
          />
        </div>

        {/* 2-Column: OTP & Handover Info / Logistics & Driver Form */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          
          {/* Left: Secure Handover OTP & Instructions */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-main)', fontWeight: 700 }}>
              <KeyRound size={20} style={{ color: 'var(--amber-600)' }} />
              <span>Secure Pickup Verification PIN</span>
            </div>

            {request.status !== 'Rejected' && request.status !== 'Cancelled' ? (
              <div
                style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
                  border: '2px dashed var(--amber-400)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  textAlign: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amber-800)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Handover Verification OTP
                </div>
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    letterSpacing: '0.2em',
                    color: 'var(--amber-900)',
                    margin: '0.5rem 0',
                  }}
                >
                  {request.pickupDetails?.otp || '----'}
                </div>
                <button
                  onClick={handleCopyOtp}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.35rem', background: '#ffffff' }}
                >
                  {copiedOtp ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copiedOtp ? 'Copied OTP' : 'Copy Verification Code'}
                </button>
              </div>
            ) : (
              <div style={{ padding: '1rem', background: 'var(--rose-50)', color: 'var(--rose-700)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                Pickup was not initiated.
              </div>
            )}

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              <p><strong>Pickup Instructions:</strong></p>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.35rem' }}>
                <li>Volunteer presents the 4-digit OTP upon arrival at donor kitchen.</li>
                <li>Verify container cleanliness and food temperature before transit.</li>
                <li>Mark order as "Completed" immediately after collection.</li>
              </ul>
            </div>
          </div>

          {/* Right: Driver / Volunteer Details Form */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>
              <Truck size={20} style={{ color: 'var(--primary-600)' }} />
              <span>Assigned Volunteer / Vehicle Info</span>
            </div>

            <form onSubmit={handleUpdatePickupDetails}>
              <div className="form-group">
                <label className="form-label">Volunteer / Driver Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={pickupDetails.pickupPersonName}
                  onChange={(e) => setPickupDetails({ ...pickupDetails, pickupPersonName: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  disabled={isCompleted}
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
                    placeholder="e.g. 9812345678"
                    disabled={isCompleted}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vehicle Reg. No.</label>
                  <input
                    type="text"
                    className="form-input"
                    value={pickupDetails.vehicleNumber}
                    onChange={(e) => setPickupDetails({ ...pickupDetails, vehicleNumber: e.target.value })}
                    placeholder="e.g. DL 01 AB 1234"
                    disabled={isCompleted}
                  />
                </div>
              </div>

              {!isCompleted && (
                <button
                  type="submit"
                  className="btn btn-secondary btn-sm"
                  disabled={savingDetails}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  {savingDetails ? 'Saving...' : 'Update Logistics Info'}
                </button>
              )}
            </form>
          </div>

        </div>

        {/* Location & Parties Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          {/* Pickup Address */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <MapPin size={18} style={{ color: 'var(--primary-600)' }} />
              <span>Donor Pickup Address</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              <strong>Donor:</strong> {donor.organizationName || donor.name} <br />
              <strong>Address:</strong> {donation.pickupAddress} <br />
              <strong>City:</strong> {donation.city}, {donation.state} - {donation.pincode} <br />
              <strong>Time Slot:</strong> {donation.pickupTime}
            </p>
          </div>

          {/* Receiving NGO */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <Building2 size={18} style={{ color: 'var(--amber-600)' }} />
              <span>Receiving NGO</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              <strong>Organization:</strong> {receiver.organizationName || receiver.name} <br />
              <strong>Contact:</strong> {receiver.name} <br />
              <strong>Phone:</strong> {receiver.phone} <br />
              <strong>Quantity:</strong> {request.requestedQuantity} {donation.unit}
            </p>
          </div>

        </div>

      </div>

      {/* Schedule Pickup Modal */}
      <ConfirmationModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onConfirm={() => handleStatusUpdate('Pickup Scheduled', setShowScheduleModal)}
        title="Confirm Pickup Scheduled"
        message="Has the pickup date, time and volunteer been confirmed with the NGO? This will update the status to 'Pickup Scheduled'."
        confirmText="Yes, Mark Scheduled"
        loading={actionLoading}
      />

      {/* Out for Pickup Modal */}
      <ConfirmationModal
        isOpen={showOutForPickupModal}
        onClose={() => setShowOutForPickupModal(false)}
        onConfirm={() => handleStatusUpdate('Out for Pickup', setShowOutForPickupModal)}
        title="Mark as Out for Pickup"
        message="Is your volunteer currently en route to collect the food? This will update the status to 'Out for Pickup'."
        confirmText="Yes, Out for Pickup"
        loading={actionLoading}
      />

      {/* Completion & OTP Verification Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false);
          setOtpError('');
        }}
        title="Confirm Food Handover & Delivery"
      >
        <form onSubmit={handleCompleteHandover}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
            Please enter the <strong>4-digit Pickup PIN</strong> provided by the NGO/driver upon food collection to verify handover integrity.
          </p>

          {otpError && (
            <div style={{ background: 'var(--rose-50)', color: 'var(--rose-600)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid var(--rose-200)' }}>
              {otpError}
            </div>
          )}

          <div className="form-group" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              4-Digit Pickup OTP Code
            </label>
            <input
              type="text"
              maxLength={4}
              className="form-input"
              value={enteredOtp}
              onChange={(e) => {
                setEnteredOtp(e.target.value.replace(/\D/g, ''));
                if (otpError) setOtpError('');
              }}
              placeholder="e.g. 4829"
              autoFocus
              style={{
                fontSize: '1.75rem',
                letterSpacing: '0.3em',
                textAlign: 'center',
                fontWeight: 800,
                fontFamily: 'monospace',
                maxWidth: '220px',
                margin: '0 auto',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowCompleteModal(false);
                setOtpError('');
              }}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={actionLoading || (!isAdmin && enteredOtp.length !== 4)}
              style={{ gap: '0.4rem' }}
            >
              {actionLoading ? 'Verifying...' : 'Verify OTP & Complete'}
            </button>
          </div>
        </form>
      </Modal>

    </DashboardLayout>
  );
};

export default PickupTrackingPage;
