import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../services/requestService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import {
  Inbox,
  Truck,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  Phone,
  Building2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const RequestsPage = () => {
  const { user, isDonor, isReceiver, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });

  // Modal actions
  const [selectedReq, setSelectedReq] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 8 };
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await requestService.getRequests(params);
      if (res.success) {
        setRequests(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error loading requests:', err);
      showToast('error', 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    fetchRequests(pagination.page);
  }, [fetchRequests, pagination.page]);

  const handleApprove = async () => {
    if (!selectedReq) return;
    try {
      setActionLoading(true);
      const res = await requestService.updateRequestStatus(selectedReq._id, { status: 'Accepted' });
      if (res.success) {
        showToast('success', 'Pickup request accepted.');
        setShowApproveModal(false);
        fetchRequests(pagination.page);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReq) return;
    try {
      setActionLoading(true);
      const res = await requestService.updateRequestStatus(selectedReq._id, {
        status: 'Rejected',
        rejectionReason: rejectionReason || 'Unavailable for collection',
      });
      if (res.success) {
        showToast('info', 'Request declined.');
        setShowRejectModal(false);
        fetchRequests(pagination.page);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedReq) return;
    try {
      setActionLoading(true);
      const res = await requestService.updateRequestStatus(selectedReq._id, { status: 'Cancelled' });
      if (res.success) {
        showToast('info', 'Request cancelled.');
        setShowCancelModal(false);
        fetchRequests(pagination.page);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header & Status Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isDonor ? 'Donor Request Center' : 'NGO Logistics & Pickups'}
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>
              {isDonor ? 'Received Food Requests' : 'My Food Requests & Pickups'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Track pickup requests through Pending → Accepted → Picked Up → Delivered.
            </p>
          </div>

          {/* Status Filters */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['all', 'Pending', 'Accepted', 'Picked Up', 'Delivered', 'Rejected', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}
              >
                {st === 'all' ? 'All Requests' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Table / Cards */}
        {loading ? (
          <LoadingSpinner text="Fetching requests..." />
        ) : requests.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No Requests Found"
            description={statusFilter === 'all' ? 'There are no active food requests in your inbox.' : `No requests with status "${statusFilter}".`}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {requests.map((req) => (
              <div key={req._id} className="card" style={{ padding: '1.5rem', transition: 'all 200ms ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {req.donation?.foodName || 'Food Item'}
                      </h3>
                      <span className={`badge ${req.status === 'Accepted' ? 'badge-approved' : req.status === 'Pending' ? 'badge-pending' : req.status === 'Delivered' || req.status === 'Picked Up' ? 'badge-completed' : 'badge-rejected'}`}>
                        ● {req.status}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span><strong>Requested:</strong> {req.requestedQuantity} {req.donation?.unit || 'units'}</span>
                      <span>•</span>
                      <span><strong>Date:</strong> {new Date(req.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span><strong>Location:</strong> {req.donation?.city}</span>
                    </div>
                  </div>

                  {/* Actions according to role */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {isDonor && req.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedReq(req);
                            setShowApproveModal(true);
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ gap: '0.3rem' }}
                        >
                          <CheckCircle size={15} /> Accept Request
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReq(req);
                            setShowRejectModal(true);
                          }}
                          className="btn btn-danger btn-sm"
                          style={{ gap: '0.3rem' }}
                        >
                          <XCircle size={15} /> Decline
                        </button>
                      </>
                    )}

                    {isReceiver && req.status === 'Pending' && (
                      <button
                        onClick={() => {
                          setSelectedReq(req);
                          setShowCancelModal(true);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel Request
                      </button>
                    )}

                    <Link
                      to={`/pickup-tracking/${req._id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '0.35rem' }}
                    >
                      <Truck size={15} /> Track Pickup
                    </Link>
                  </div>
                </div>

                {/* Message / Details Section */}
                <div style={{ background: 'var(--bg-main)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                    {isDonor ? `Distribution Note from ${req.receiver?.organizationName || req.receiver?.name}:` : 'Your Note to Donor:'}
                  </div>
                  <p style={{ color: 'var(--text-muted)' }}>"{req.message}"</p>
                </div>

                {/* Bottom party summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    {isDonor ? (
                      <span>Recipient: <strong>{req.receiver?.organizationName || req.receiver?.name}</strong> ({req.receiver?.phone})</span>
                    ) : (
                      <span>Donor Kitchen: <strong>{req.donation?.donor?.organizationName || req.donation?.donor?.name}</strong> ({req.donation?.donor?.phone})</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} style={{ color: 'var(--primary-600)' }} />
                    <span>{req.donation?.pickupAddress || 'Pickup address provided upon approval'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        />

      </div>

      {/* Confirmation Modal: Approve */}
      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Confirm Request Approval"
        message={`Approve food handover of ${selectedReq?.requestedQuantity} units of "${selectedReq?.donation?.foodName}" to ${selectedReq?.receiver?.organizationName || selectedReq?.receiver?.name}?`}
        confirmText="Approve & Schedule"
        loading={actionLoading}
      />

      {/* Decline Modal with reason */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Decline Food Request"
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Decline Reason (Optional)</label>
          <textarea
            className="form-textarea"
            rows="3"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Quantity already fulfilled or unavailable for pickup."
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={() => setShowRejectModal(false)} className="btn btn-secondary btn-sm" disabled={actionLoading}>
            Cancel
          </button>
          <button onClick={handleReject} className="btn btn-danger btn-sm" disabled={actionLoading}>
            {actionLoading ? 'Declining...' : 'Decline Request'}
          </button>
        </div>
      </Modal>

      {/* Cancel Request Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        title="Cancel Food Request"
        message="Are you sure you want to cancel this pending food request?"
        confirmText="Yes, Cancel Request"
        isDanger={true}
        loading={actionLoading}
      />

    </DashboardLayout>
  );
};

export default RequestsPage;
