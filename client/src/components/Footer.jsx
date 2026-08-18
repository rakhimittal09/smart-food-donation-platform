import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Mail, Phone, MapPin, Heart, Shield, Globe, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: '#0f172a', color: '#cbd5e1', paddingTop: '4rem', paddingBottom: '2rem', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <HeartHandshake size={22} />
              </div>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#ffffff' }}>
                Nourish<span style={{ color: 'var(--primary-400)' }}>Link</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.7', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Transforming surplus meals into sustenance for families in need. Connecting verified donors, local restaurants, and food banks through smart real-time logistics.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary-400)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                Zero Hunger Goal
              </span>
              <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                Food Security
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Platform Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.9rem' }}>
              <li>
                <Link to="/donations" style={{ color: '#94a3b8', transition: 'color 150ms ease' }} onMouseOver={(e) => (e.target.style.color = '#34d399')} onMouseOut={(e) => (e.target.style.color = '#94a3b8')}>
                  Browse Available Food
                </Link>
              </li>
              <li>
                <Link to="/donations/create" style={{ color: '#94a3b8', transition: 'color 150ms ease' }} onMouseOver={(e) => (e.target.style.color = '#34d399')} onMouseOut={(e) => (e.target.style.color = '#94a3b8')}>
                  Donate Surplus Meals
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ color: '#94a3b8', transition: 'color 150ms ease' }} onMouseOver={(e) => (e.target.style.color = '#34d399')} onMouseOut={(e) => (e.target.style.color = '#94a3b8')}>
                  NGO Partner Login
                </Link>
              </li>
              <li>
                <Link to="/register" style={{ color: '#94a3b8', transition: 'color 150ms ease' }} onMouseOver={(e) => (e.target.style.color = '#34d399')} onMouseOut={(e) => (e.target.style.color = '#94a3b8')}>
                  Register as Donor / NGO
                </Link>
              </li>
            </ul>
          </div>

          {/* Impact Pillars */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Our Impact Metrics</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Award size={18} style={{ color: 'var(--primary-400)' }} />
                <span style={{ fontSize: '0.875rem' }}><strong>50,000+</strong> Meals Rescued</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Shield size={18} style={{ color: '#38bdf8' }} />
                <span style={{ fontSize: '0.875rem' }}><strong>100%</strong> Verified NGO Network</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Globe size={18} style={{ color: '#fbbf24' }} />
                <span style={{ fontSize: '0.875rem' }}><strong>12+</strong> Cities Connected</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Contact & Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} style={{ color: 'var(--primary-400)' }} />
                <span>support@nourishlink.org</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} style={{ color: 'var(--primary-400)' }} />
                <span>+91 98765 43210 (Helpline)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <MapPin size={16} style={{ color: 'var(--primary-400)', marginTop: '3px' }} />
                <span>Green Park Avenue, New Delhi - 110016</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
          <div>
            © {new Date().getFullYear()} NourishLink Smart Food Donation Platform. Built for Social Good.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Crafted with <Heart size={14} style={{ color: 'var(--rose-500)' }} /> for zero food waste
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
