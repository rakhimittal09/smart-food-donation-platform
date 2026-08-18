import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import DashboardLayout from '../components/DashboardLayout';
import StatisticsCard from '../components/StatisticsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import FoodCard from '../components/FoodCard';
import {
  Compass,
  Inbox,
  Truck,
  CheckCircle,
  Clock,
  ArrowRight,
  MapPin,
  Calendar,
  AlertTriangle,
  Building2,
} from 'lucide-react';

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userService.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching receiver dashboard:', err);
      showToast('error', 'Failed to load NGO dashboard.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && !stats) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullPage text="Loading NGO hub..." />
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
          background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
          border: '1px solid var(--amber-200)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amber-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            NGO Distribution Hub
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>
            Hello, {user?.organizationName || user?.name} 🤝
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {user?.city ? `${user.city} • ` : ''}Discover active surplus food in your city and coordinate swift pickups.
          </p>
        </div>

        <Link to="/donations" className="btn btn-amber" style={{ gap: '0.5rem' }}>
          <Compass size={18} /> Explore Available Food
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatisticsCard
          title="Available Food Listings"
          value={stats?.availableDonations || 0}
          icon={Compass}
          variant="primary"
          subtext="Ready to be claimed"
        />
        <StatisticsCard
          title="Active Requests"
          value={stats?.pendingRequests || 0}
          icon={Inbox}
          variant="amber"
          subtext="Pending donor approval"
        />
        <StatisticsCard
          title="Approved Pickups"
          value={stats?.approvedRequests || 0}
          icon={Truck}
          variant="sky"
          subtext="Ready for collection"
        />
        <StatisticsCard
          title="Completed Deliveries"
          value={stats?.completedPickups || 0}
          icon={CheckCircle}
          variant="indigo"
          subtext="Distributed to community"
        />
      </div>

      {/* Urgent Expiring Soon Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--rose-100)', color: 'var(--rose-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Urgent: Expiring Soon Near You</h3>
          </div>
          <Link to="/donations" className="btn btn-outline btn-sm">
            View All Catalog <ArrowRight size={14} />
          </Link>
        </div>

        {stats?.urgentDonations && stats.urgentDonations.length > 0 ? (
          <div className="grid-3">
            {stats.urgentDonations.slice(0, 3).map((item) => (
              <FoodCard key={item._id} donation={item} onRequestClick={() => navigate(`/donations/${item._id}`)} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No urgent expiring listings at this moment.
          </div>
        )}
      </div>

      {/* My Recent Requests Tracker */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Recent Food Requests & Pickup Status</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time status updates and OTP verification</p>
          </div>
          <Link to="/requests" className="btn btn-secondary btn-sm">
            All Requests
          </Link>
        </div>

        {stats?.recentRequests && stats.recentRequests.length > 0 ? (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Donor / Entity</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Pickup Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentRequests.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {req.donation?.foodName || 'Donation'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Requested: {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.donation?.donor?.organizationName || req.donation?.donor?.name || 'Verified Donor'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.donation?.donor?.phone}</div>
                    </td>
                    <td>
                      <strong>{req.requestedQuantity}</strong> {req.donation?.unit || 'units'}
                    </td>
                    <td>
                      <span className={`badge ${req.status === 'Approved' ? 'badge-approved' : req.status === 'Pending' ? 'badge-pending' : req.status === 'Completed' ? 'badge-completed' : 'badge-rejected'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      {req.status === 'Approved' ? (
                        <Link
                          to={`/pickup-tracking/${req._id}`}
                          className="btn btn-primary btn-sm"
                          style={{ gap: '0.35rem' }}
                        >
                          <Truck size={14} /> Track Pickup
                        </Link>
                      ) : (
                        <Link
                          to={`/donations/${req.donation?._id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          View Food
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            <p>You have not placed any food requests yet.</p>
            <Link to="/donations" className="btn btn-amber btn-sm" style={{ marginTop: '1rem' }}>
              Browse Available Food
            </Link>
          </div>
        )}
      </div>

    </DashboardLayout>
  );
};

export default ReceiverDashboard;
