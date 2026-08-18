import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import StatisticsCard from '../components/StatisticsCard';
import { BarChart, DonutChart } from '../components/Charts';
import {
  BarChart3,
  Award,
  Users,
  Utensils,
  PackageCheck,
  TrendingUp,
  MapPin,
  Calendar,
} from 'lucide-react';

const AdminReportsPage = () => {
  const { showToast } = useToast();

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await adminService.getReports();
        if (res.success && res.data) {
          setReportData(res.data);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
        showToast('error', 'Failed to retrieve analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [showToast]);

  if (loading || !reportData) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullPage text="Generating system analytics & reports..." />
      </DashboardLayout>
    );
  }

  const { summary, donationsByCategory, donationsByCity, donationsByType, monthlyDonations, topDonors } = reportData;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System Analytics & Reporting
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>
            Food Rescue Impact Reports
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Multi-dimensional insights on meal contributions, geographic demand, and top participating donors.
          </p>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <StatisticsCard
            title="Total Registered Donors"
            value={summary?.totalDonors || 0}
            icon={Users}
            variant="primary"
            subtext="Contributing food partners"
          />
          <StatisticsCard
            title="Verified NGO Network"
            value={summary?.totalReceivers || 0}
            icon={Award}
            variant="amber"
            subtext="Distribution organizations"
          />
          <StatisticsCard
            title="Total Food Listings"
            value={summary?.totalDonations || 0}
            icon={Utensils}
            variant="sky"
            subtext={`${summary?.activeDonations || 0} currently active`}
          />
          <StatisticsCard
            title="Delivered Rescues"
            value={summary?.completedPickups || 0}
            icon={PackageCheck}
            variant="indigo"
            subtext="100% Handover verified"
          />
        </div>

        {/* 2-Column Visual Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
          <BarChart
            title="Donations Volume by Category"
            data={donationsByCategory || []}
            labelKey="_id"
            valueKey="count"
          />

          <DonutChart
            title="Food Listings by Dietary Type"
            data={donationsByType || []}
          />
        </div>

        {/* Geographic Distribution & Top Donors Leaderboard */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
          
          <BarChart
            title="Donation Distribution by City"
            data={donationsByCity || []}
            labelKey="_id"
            valueKey="count"
          />

          {/* Top Donors Leaderboard */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Award size={20} style={{ color: 'var(--amber-600)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Top Contributing Donors Leaderboard
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topDonors && topDonors.length > 0 ? (
                topDonors.map((donor, idx) => (
                  <div
                    key={donor._id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#d97706' : 'var(--primary-100)',
                          color: idx < 3 ? '#ffffff' : 'var(--primary-800)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                          {donor.organizationName || donor.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{donor.email}</div>
                      </div>
                    </div>

                    <span className="badge badge-available">
                      {donor.totalDonations} Listings
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                  No donor records available.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminReportsPage;
