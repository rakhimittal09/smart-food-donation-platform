import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import { requestService } from '../services/requestService';
import DashboardLayout from '../components/DashboardLayout';
import StatisticsCard from '../components/StatisticsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import Modal from '../components/Modal';
import {
  Utensils,
  PackageCheck,
  Clock,
  Inbox,
  PlusCircle,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  AlertCircle,
  Eye,
} from 'lucide-react';

const DonorDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userService.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching donor dashboard:', err);
      showToast('error', 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      setActionLoading(true);
      const res = await requestService.updateRequestStatus(selectedRequest._id, {
        status: 'Approved',
      });
      if (res.success) {
        showToast('success', 'Food request approved! Pickup instructions notified to receiver.');
        setShowApproveModal(false);
        fetchDashboardData();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to approve request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    try {
      setActionLoading(true);
      const res = await requestService.updateRequestStatus(selectedRequest._id, {
        status: 'Rejected',
        rejectionReason: rejectionReason || 'Unavailable for specified quantity/time',
      });
      if (res.success) {
        showToast('info', 'Food request was rejected.');
        setShowRejectModal(false);
        setRejectionReason('');
        fetchDashboardData();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to reject request.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullPage text="Loading your donor dashboard..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Top Welcome Banner */}
      <div
        className="glass-card"
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)',
          border: '1px solid var(--primary-200)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Donor Control Center
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>
            Welcome, {user?.name} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {user?.organizationName ? `${user.organizationName} • ` : ''}Thank you for your noble contributions towards zero food waste.
          </p>
        </div>

        <Link to="/donations/create" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <PlusCircle size={18} /> Post New Food Donation
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatisticsCard
          title="Total Donations"
          value={stats?.totalDonations || 0}
          icon={Utensils}
          variant="primary"
          subtext="Lifetime food contributions"
        />
        <StatisticsCard
          title="Active Listings"
          value={stats?.activeDonations || 0}
          icon={Clock}
          variant="sky"
          subtext="Discoverable by NGOs"
        />
        <StatisticsCard
          title="Pending Requests"
          value={stats?.pendingRequests || 0}
          icon={Inbox}
          variant="amber"
          subtext="Awaiting your approval"
        />
        <StatisticsCard
          title="Completed Rescues"
          value={stats?.completedDonations || 0}
          icon={PackageCheck}
          variant="indigo"
          subtext="Successfully delivered"
        />
      </div>

      {/* 2-Column Section: Incoming Requests & Recent Listings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
        
        {/* Incoming Requests Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Incoming Requests</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>NGOs requesting your food listings</p>
            </div>
            <Link to="/requests" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>

          {stats?.recentRequests && stats.recentRequests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {stats.recentRequests.map((req) => (
                <div
                  key={req._id}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        {req.donation?.foodName || 'Food Item'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Requested by: <strong>{req.receiver?.organizationName || req.receiver?.name}</strong>
                      </div>
                    </div>
                    <span className={`badge ${req.status === 'Pending' ? 'badge-pending' : req.status === 'Approved' ? 'badge-approved' : 'badge-completed'}`}>
                      {req.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    "{req.message}"
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Quantity: <strong>{req.requestedQuantity} units</strong></span>
                    {req.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setShowApproveModal(true);
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.775rem' }}
                        >
                          <CheckCircle size={14} /> Accept
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setShowRejectModal(true);
                          }}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.775rem' }}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No pending food requests right now.
            </div>
          )}
        </div>

        {/* Recent Food Listings */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Food Listings</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Recently posted surplus items</p>
            </div>
            <Link to="/donations/my" className="btn btn-secondary btn-sm">
              Manage All
            </Link>
          </div>

          {stats?.recentDonations && stats.recentDonations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {stats.recentDonations.map((item) => (
                <div
                  key={item._id}
                  style={{
                    padding: '0.85rem 1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#ffffff',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>{item.foodName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
                      <span>{item.quantity} {item.unit}</span>
                      <span>•</span>
                      <span>Expires: {new Date(item.expiryDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge ${item.status === 'Available' ? 'badge-available' : item.status === 'Approved' ? 'badge-approved' : 'badge-scheduled'}`}>
                      {item.status}
                    </span>
                    <Link to={`/donations/${item._id}`} className="btn btn-secondary btn-icon" title="View details">
                      <Eye size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              You have not posted any food listings yet.
              <div style={{ marginTop: '0.75rem' }}>
                <Link to="/donations/create" className="btn btn-primary btn-sm">
                  Create First Donation
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Activity Log Stream */}
      {stats?.recentActivities && stats.recentActivities.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Your Recent Activity</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {stats.recentActivities.map((act) => (
              <div key={act._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{act.description}</span>
                <span style={{ color: 'var(--text-light)', fontSize: '0.775rem' }}>{new Date(act.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Approving Request */}
      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve Food Request"
        message={`Are you sure you want to approve the request from ${selectedRequest?.receiver?.organizationName || selectedRequest?.receiver?.name} for ${selectedRequest?.requestedQuantity} units of "${selectedRequest?.donation?.foodName}"?`}
        confirmText="Approve Request"
        loading={actionLoading}
      />

      {/* Modal for Rejecting Request */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Decline Food Request"
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Please state a reason for declining this request (optional, visible to NGO):
          </p>
          <textarea
            className="form-textarea"
            rows="3"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Quantity already reserved or pickup time outside availability window."
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

    </DashboardLayout>
  );
};

export default DonorDashboard;
