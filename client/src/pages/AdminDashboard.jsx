import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import DashboardLayout from '../components/DashboardLayout';
import StatisticsCard from '../components/StatisticsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Users,
  Utensils,
  PackageCheck,
  Building2,
  ShieldCheck,
  Layers,
  BarChart3,
  ScrollText,
  Sliders,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

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
      console.error('Error fetching admin stats:', err);
      showToast('error', 'Failed to load system metrics.');
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
        <LoadingSpinner fullPage text="Loading system analytics..." />
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
          background: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 100%)',
          border: '1px solid var(--rose-200)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--rose-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Platform Command Center
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>
            System Overview 🛡️
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Real-time ecosystem statistics, user verification, moderation, and audit trails.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/reports" className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <BarChart3 size={18} /> View Analytics
          </Link>
          <Link to="/admin/users" className="btn btn-secondary" style={{ gap: '0.5rem' }}>
            <Users size={18} /> Manage Users
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <StatisticsCard
          title="Total Registered Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          variant="primary"
          subtext={`${stats?.totalDonors || 0} Donors • ${stats?.totalReceivers || 0} NGOs`}
        />
        <StatisticsCard
          title="Total Food Listings"
          value={stats?.totalDonations || 0}
          icon={Utensils}
          variant="sky"
          subtext={`${stats?.activeDonations || 0} Active • ${stats?.completedDonations || 0} Delivered`}
        />
        <StatisticsCard
          title="Completed Rescues"
          value={stats?.completedPickups || 0}
          icon={PackageCheck}
          variant="indigo"
          subtext={`${stats?.pendingRequests || 0} Pending approvals`}
        />
      </div>

      {/* Quick Navigation Panel */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Administrative Modules</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          
          <Link to="/admin/users" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>User Directory</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Block / Activate accounts</div>
            </div>
          </Link>

          <Link to="/admin/donations" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--sky-50)', color: 'var(--sky-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Utensils size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Food Moderation</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Review and prune listings</div>
            </div>
          </Link>

          <Link to="/admin/categories" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--amber-50)', color: 'var(--amber-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Category Manager</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Add & edit food types</div>
            </div>
          </Link>

          <Link to="/admin/reports" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--indigo-50)', color: 'var(--indigo-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Analytics & KPIs</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly trends & top donors</div>
            </div>
          </Link>

          <Link to="/admin/activity-logs" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--rose-50)', color: 'var(--rose-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ScrollText size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Audit Trail</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>System-wide event logs</div>
            </div>
          </Link>

          <Link to="/admin/settings" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--emerald-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sliders size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>System Settings</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Platform & safety rules</div>
            </div>
          </Link>

        </div>
      </div>

      {/* System Activity Stream */}
      {stats?.recentActivities && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Real-Time System Activity Feed</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest actions registered on the platform</p>
            </div>
            <Link to="/admin/activity-logs" className="btn btn-secondary btn-sm">
              All Logs
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recentActivities.map((log) => (
              <div
                key={log._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-main)',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {log.description}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    By: {log.user?.name || 'System'} ({log.user?.role || 'Guest'})
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default AdminDashboard;
