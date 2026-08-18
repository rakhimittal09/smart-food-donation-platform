import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { Sliders, Save, Shield, Bell, Clock, Mail, Globe, CheckCircle2 } from 'lucide-react';

const AdminSettingsPage = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    platformName: 'NourishLink Smart Food Donation',
    supportEmail: 'support@fooddonation.org',
    autoExpiryHours: 24,
    enableEmailNotifications: true,
    requireOtpVerification: true,
    maxDonationQuantityServings: 500,
    emergencyHelpline: '+91 9876543210',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await adminService.getSettings();
        if (res.success && res.data && res.data.length > 0) {
          const map = {};
          res.data.forEach((s) => {
            map[s.key] = s.value;
          });
          setSettings((prev) => ({ ...prev, ...map }));
        }
      } catch (err) {
        console.error('Failed to load system settings:', err);
        showToast('error', 'Failed to retrieve system settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [showToast]);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Save all keys
      for (const [key, value] of Object.entries(settings)) {
        await adminService.updateSetting({
          key,
          value,
          description: `Platform configuration for ${key}`,
        });
      }
      showToast('success', 'System settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('error', 'Failed to update system configurations.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Administration
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>
              System & Platform Settings
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Configure global operational parameters, safety thresholds, and notification behaviors.
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading system configurations..." />
        ) : (
          <form onSubmit={handleSave}>
            {/* General Settings */}
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <Globe size={20} style={{ color: 'var(--primary-600)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>General Platform Info</h3>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Platform Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.platformName}
                    onChange={(e) => handleChange('platformName', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Official Support Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={settings.supportEmail}
                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Helpline Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.emergencyHelpline}
                  onChange={(e) => handleChange('emergencyHelpline', e.target.value)}
                />
              </div>
            </div>

            {/* Food Safety & Pickup Rules */}
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <Shield size={20} style={{ color: 'var(--amber-600)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Food Safety & Verification Rules</h3>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Default Expiry Window (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    className="form-input"
                    value={settings.autoExpiryHours}
                    onChange={(e) => handleChange('autoExpiryHours', Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Max Quantity Per Single Donation (Servings)</label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    className="form-input"
                    value={settings.maxDonationQuantityServings}
                    onChange={(e) => handleChange('maxDonationQuantityServings', Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="requireOtp"
                  checked={settings.requireOtpVerification}
                  onChange={(e) => handleChange('requireOtpVerification', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="requireOtp" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                  Enforce mandatory 4-digit OTP PIN verification on all food handovers
                </label>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <Bell size={20} style={{ color: 'var(--sky-600)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Notification & Activity Preferences</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  id="enableEmail"
                  checked={settings.enableEmailNotifications}
                  onChange={(e) => handleChange('enableEmailNotifications', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="enableEmail" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                  Enable in-app & email notification dispatch on new requests and pickup status updates
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ padding: '0.75rem 2rem', gap: '0.5rem' }}
              >
                <Save size={18} /> {saving ? 'Saving...' : 'Save System Settings'}
              </button>
            </div>
          </form>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminSettingsPage;
