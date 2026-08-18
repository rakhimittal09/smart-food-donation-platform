import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, User, Mail, Phone, Lock, Building2, MapPin, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const [role, setRole] = useState('donor');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    organizationName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await register({
        ...formData,
        role,
      });

      if (res.success) {
        if (role === 'donor') navigate('/donor-dashboard');
        else if (role === 'receiver') navigate('/receiver-dashboard');
        else navigate('/');
      } else {
        setError(res.message || 'Registration failed. Please check inputs.');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '640px' }}>
        <div className="glass-card" style={{ padding: '2.5rem 2rem', background: '#ffffff', borderRadius: 'var(--radius-xl)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                marginBottom: '1rem',
              }}
            >
              <HeartHandshake size={28} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Join the Network</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Create an account to donate surplus meals or receive food for your community
            </p>
          </div>

          {/* Role Switcher */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <button
              type="button"
              onClick={() => setRole('donor')}
              style={{
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid',
                borderColor: role === 'donor' ? 'var(--primary-600)' : 'var(--border-color)',
                background: role === 'donor' ? 'var(--primary-50)' : '#ffffff',
                color: role === 'donor' ? 'var(--primary-800)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all var(--trans-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              🍱 Food Donor
            </button>

            <button
              type="button"
              onClick={() => setRole('receiver')}
              style={{
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid',
                borderColor: role === 'receiver' ? 'var(--amber-600)' : 'var(--border-color)',
                background: role === 'receiver' ? 'var(--amber-50)' : '#ffffff',
                color: role === 'receiver' ? 'var(--amber-800)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all var(--trans-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              🤝 NGO / Food Receiver
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                background: 'var(--rose-50)',
                color: 'var(--rose-600)',
                border: '1px solid var(--rose-200)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Rajesh Malhotra"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@email.com"
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit number (e.g. 9812345678)"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {role === 'donor' ? 'Restaurant / Business / Entity' : 'NGO / Trust Organization Name'}
                </label>
                <input
                  type="text"
                  name="organizationName"
                  className="form-input"
                  value={formData.organizationName}
                  onChange={handleChange}
                  placeholder={role === 'donor' ? 'e.g. Taj Caterers' : 'e.g. Feeding India Trust'}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Street Address *</label>
              <input
                type="text"
                name="address"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
                placeholder="Plot / Street / Landmark"
                required
              />
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New Delhi"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">State *</label>
                <input
                  type="text"
                  name="state"
                  className="form-input"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Delhi"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  className="form-input"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="110001"
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'} <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 700 }}>
              Sign In Here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
