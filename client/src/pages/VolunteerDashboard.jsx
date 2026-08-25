import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import DashboardLayout from '../components/DashboardLayout';
import StatisticsCard from '../components/StatisticsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Truck, PackageCheck, MapPin, Clock, Eye, Calendar, Navigation } from 'lucide-react';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading && !stats) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullPage text="Loading volunteer dashboard..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div
        className="glass-card"
        style={{
          padding: '1.75rem 2rem', marginBottom: '2rem',
          background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 100%)',
          border: '1px solid var(--indigo-100)', borderRadius: 'var(--radius-xl)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '1rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--indigo-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Volunteer Hub
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>
            Welcome, {user?.name} 🚚
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Thank you for helping deliver food to communities in need.
          </p>
        </div>
        <Link to="/donations" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Navigation size={18} /> Browse Available Pickups
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <StatisticsCard
          title="Assigned Pickups"
          value={stats?.assignedPickups || 0}
          icon={Truck}
          variant="sky"
          subtext="Currently active"
        />
        <StatisticsCard
          title="Completed Deliveries"
          value={stats?.completedDeliveries || 0}
          icon={PackageCheck}
          variant="primary"
          subtext="Successfully delivered"
        />
        <StatisticsCard
          title="Available Pickups"
          value={stats?.availablePickups?.length || 0}
          icon={MapPin}
          variant="amber"
          subtext={`In ${user?.city || 'your area'}`}
        />
      </div>

      {/* Available Pickups */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Available Pickups Nearby</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Accepted donations ready for pickup in {user?.city || 'your area'}
            </p>
          </div>
        </div>

        {stats?.availablePickups && stats.availablePickups.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {stats.availablePickups.map((item) => (
              <div
                key={item._id}
                style={{
                  padding: '1rem', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)', background: '#ffffff',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.foodName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={13} /> {item.city}
                    </span>
                    <span>{item.quantity} {item.unit}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={13} /> {item.pickupDate ? new Date(item.pickupDate).toLocaleDateString() : 'N/A'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={13} /> {item.pickupTime}
                    </span>
                  </div>
                  {item.donor && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Donor: <strong>{item.donor.organizationName || item.donor.name}</strong> · {item.donor.phone}
                    </div>
                  )}
                </div>
                <Link to={`/donations/${item._id}`} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
                  <Eye size={14} /> View Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No available pickups in your area right now. Check back later!
          </div>
        )}
      </div>

      {/* Activity */}
      {stats?.recentActivities && stats.recentActivities.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
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
    </DashboardLayout>
  );
};

export default VolunteerDashboard;
