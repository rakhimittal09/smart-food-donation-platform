import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import { requestService } from '../services/requestService';
import DashboardLayout from '../components/DashboardLayout';
import StatisticsCard from '../components/StatisticsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Truck,
  PackageCheck,
  MapPin,
  Clock,
  Eye,
  Calendar,
  Navigation,
  CheckCircle2,
  Building2,
  ArrowRight,
} from 'lucide-react';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'available' | 'delivered'
  const [claimingId, setClaimingId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userService.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching volunteer dashboard:', err);
      showToast('error', 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClaimPickup = async (reqId) => {
    try {
      setClaimingId(reqId);
      const res = await requestService.claimDelivery(reqId);
      if (res.success) {
        showToast('success', 'You have claimed this delivery task!');
        fetchData();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to claim delivery.');
    } finally {
      setClaimingId(null);
    }
  };

  if (loading && !stats) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullPage text="Loading volunteer dashboard..." />
      </DashboardLayout>
    );
  }

  const activeDeliveries = stats?.myActiveDeliveries || [];
  const completedDeliveries = stats?.myCompletedDeliveries || [];
  const availablePickups = stats?.availablePickups || [];

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div
        className="glass-card"
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 100%)',
          border: '1px solid var(--indigo-100)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--indigo-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Volunteer Operations Hub
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>
            Welcome, {user?.name} 🚚
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Coordinate surplus food collection and safe transport to recipient communities.
          </p>
        </div>
        <Link to="/requests" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Truck size={18} /> View All Deliveries
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div style={{ cursor: 'pointer' }} onClick={() => setActiveTab('active')}>
          <StatisticsCard
            title="Assigned Pickups"
            value={stats?.assignedPickups || activeDeliveries.length || 0}
            icon={Truck}
            variant="sky"
            subtext="In transit / Active"
          />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => setActiveTab('delivered')}>
          <StatisticsCard
            title="Completed Deliveries"
            value={stats?.completedDeliveries || completedDeliveries.length || 0}
            icon={PackageCheck}
            variant="primary"
            subtext="Successfully delivered"
          />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => setActiveTab('available')}>
          <StatisticsCard
            title="Available Pickups"
            value={availablePickups.length || stats?.availableDonations?.length || 0}
            icon={MapPin}
            variant="amber"
            subtext="Ready for collection"
          />
        </div>
      </div>

      {/* Section Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('active')}
          className={`btn btn-sm ${activeTab === 'active' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.35rem' }}
        >
          <Truck size={15} /> Active Deliveries ({activeDeliveries.length})
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`btn btn-sm ${activeTab === 'available' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.35rem' }}
        >
          <MapPin size={15} /> Available Pickups ({availablePickups.length})
        </button>
        <button
          onClick={() => setActiveTab('delivered')}
          className={`btn btn-sm ${activeTab === 'delivered' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.35rem' }}
        >
          <PackageCheck size={15} /> Completed Orders ({completedDeliveries.length})
        </button>
      </div>

      {/* TAB 1: ACTIVE DELIVERIES */}
      {activeTab === 'active' && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Your Active Delivery Assignments</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Pickups currently assigned to you. Mark as Picked Up and Delivered once complete.
              </p>
            </div>
          </div>

          {activeDeliveries.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeDeliveries.map((item) => (
                <div
                  key={item._id}
                  style={{
                    padding: '1.25rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                        {item.donation?.foodName || 'Food Item'}
                      </span>
                      <span className={`badge ${item.status === 'Picked Up' ? 'badge-available' : 'badge-approved'}`}>
                        ● {item.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                      <span><strong>Quantity:</strong> {item.requestedQuantity} {item.donation?.unit}</span>
                      <span><strong>Donor:</strong> {item.donation?.donor?.organizationName || item.donation?.donor?.name} ({item.donation?.donor?.phone})</span>
                      <span><strong>Receiver NGO:</strong> {item.receiver?.organizationName || item.receiver?.name}</span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={13} style={{ color: 'var(--primary-600)' }} />
                      <span>Pickup From: {item.donation?.pickupAddress || item.donation?.city}</span>
                    </div>
                  </div>

                  <Link to={`/pickup-tracking/${item._id}`} className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
                    <Truck size={15} /> Track / Update Status
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              You have no active deliveries in progress right now. Claim an available pickup below!
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AVAILABLE PICKUPS */}
      {activeTab === 'available' && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Available Pickups Ready For Delivery</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Accepted donations requiring volunteer courier service
              </p>
            </div>
          </div>

          {availablePickups.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {availablePickups.map((item) => (
                <div
                  key={item._id}
                  style={{
                    padding: '1.1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                      {item.donation?.foodName || item.foodName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={13} /> {item.donation?.city || item.city}
                      </span>
                      <span>{item.requestedQuantity || item.quantity} {item.donation?.unit || item.unit}</span>
                      {item.receiver && (
                        <span>NGO Destination: <strong>{item.receiver.organizationName || item.receiver.name}</strong></span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Pickup Location: {item.donation?.pickupAddress || item.pickupAddress || 'Address on dispatch'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={() => handleClaimPickup(item._id)}
                      disabled={claimingId === item._id}
                      className="btn btn-primary btn-sm"
                      style={{ gap: '0.35rem' }}
                    >
                      <CheckCircle2 size={15} /> {claimingId === item._id ? 'Claiming...' : 'Claim Delivery'}
                    </button>
                    <Link
                      to={item.donation ? `/pickup-tracking/${item._id}` : `/donations/${item._id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '0.35rem' }}
                    >
                      <Eye size={14} /> View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No unassigned pickups available right now. Check back soon!
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DELIVERED ORDERS */}
      {activeTab === 'delivered' && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Your Delivered / Completed Orders</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Food rescue missions successfully transported and handed over
              </p>
            </div>
          </div>

          {completedDeliveries.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {completedDeliveries.map((item) => (
                <div
                  key={item._id}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {item.donation?.foodName || 'Food Item'}
                      </span>
                      <span className="badge badge-completed">
                        ✓ Delivered
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                      <span><strong>Quantity:</strong> {item.requestedQuantity} {item.donation?.unit}</span>
                      <span><strong>Delivered To:</strong> {item.receiver?.organizationName || item.receiver?.name}</span>
                      <span><strong>Date:</strong> {item.completedAt ? new Date(item.completedAt).toLocaleString() : 'Completed'}</span>
                    </div>
                  </div>

                  <Link to={`/pickup-tracking/${item._id}`} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
                    <Eye size={14} /> View History
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No completed deliveries yet. Your delivered orders will appear here once confirmed!
            </div>
          )}
        </div>
      )}

      {/* Activity Feed */}
      {stats?.recentActivities && stats.recentActivities.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Your Recent Volunteer Activity</h3>
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
    </DashboardLayout>
  );
};

export default VolunteerDashboard;
