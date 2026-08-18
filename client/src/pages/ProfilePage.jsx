import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import DashboardLayout from '../components/DashboardLayout';
import { User, Lock, Mail, Phone, Building2, MapPin, Save, ShieldCheck } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUserState, isDonor, isReceiver, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'security'

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    organizationName: user?.organizationName || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    if (profileError) setProfileError('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    if (passwordError) setPasswordError('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileError('');
      const res = await userService.updateProfile(profileData);
      if (res.success && res.data) {
        updateUserState(res.data);
        showToast('success', 'Profile details updated successfully!');
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordError('');
      const res = await userService.changePassword(passwordData);
      if (res.success) {
        showToast('success', 'Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        
        {/* Header Banner */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Account Management
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>
            Profile & Security Settings
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage your personal credentials, contact details, and organization preferences.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '0.6rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'profile' ? 'var(--primary-50)' : 'transparent',
              color: activeTab === 'profile' ? 'var(--primary-800)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <User size={16} /> Personal & Organization Info
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            style={{
              padding: '0.6rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'security' ? 'var(--primary-50)' : 'transparent',
              color: activeTab === 'security' ? 'var(--primary-800)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Lock size={16} /> Change Password
          </button>
        </div>

        {/* TAB 1: Profile Information */}
        {activeTab === 'profile' && (
          <div className="card" style={{ padding: '2rem' }}>
            {profileError && (
              <div style={{ background: 'var(--rose-50)', color: 'var(--rose-600)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Immutable)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={user?.email || ''}
                    disabled
                    style={{ background: 'var(--bg-main)', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Organization / Entity Name</label>
                  <input
                    type="text"
                    name="organizationName"
                    className="form-input"
                    value={profileData.organizationName}
                    onChange={handleProfileChange}
                    placeholder="e.g. Taj Caterers / Feeding India"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  value={profileData.address}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-input"
                    value={profileData.city}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="state"
                    className="form-input"
                    value={profileData.state}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    className="form-input"
                    value={profileData.pincode}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingProfile}
                style={{ gap: '0.5rem', marginTop: '1rem' }}
              >
                <Save size={18} /> {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Change Password */}
        {activeTab === 'security' && (
          <div className="card" style={{ padding: '2rem' }}>
            {passwordError && (
              <div style={{ background: 'var(--rose-50)', color: 'var(--rose-600)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ maxWidth: '480px' }}>
              <div className="form-group">
                <label className="form-label">Current Password *</label>
                <input
                  type="password"
                  name="currentPassword"
                  className="form-input"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password *</label>
                <input
                  type="password"
                  name="newPassword"
                  className="form-input"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Re-enter new password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingPassword}
                style={{ gap: '0.5rem', marginTop: '1rem' }}
              >
                <ShieldCheck size={18} /> {savingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
