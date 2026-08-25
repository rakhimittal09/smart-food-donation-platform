import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Mail, Phone, MapPin, Heart, Shield, Globe, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        background: 'var(--bg-card)',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '3.5rem',
        paddingBottom: '2rem',
        marginTop: 'auto',
        fontSize: '0.9rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Brand Col */}
          <div style={{ gridColumn: 'span 1', minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <HeartHandshake size={20} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                Nourish<span style={{ color: 'var(--primary-600)' }}>Link</span>
              </span>
            </div>
            <p style={{ lineHeight: '1.6', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Eliminating surplus food waste by connecting verified donors with local shelter networks in real-time.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-veg" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                Zero Hunger
              </span>
              <span className="badge badge-available" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                Verified NGOs
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { to: '/donations', text: 'Browse Food' },
                { to: '/donations/create', text: 'Donate Surplus' },
                { to: '/about', text: 'Our Mission' },
                { to: '/faq', text: 'FAQ / Help' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} style={{ color: 'var(--text-muted)', transition: 'color 150ms ease' }} onMouseOver={(e) => (e.target.style.color = 'var(--primary-600)')} onMouseOut={(e) => (e.target.style.color = 'var(--text-muted)')}>
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Legal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { to: '/privacy-policy', text: 'Privacy Policy' },
                { to: '/terms', text: 'Terms of Service' },
                { to: '/register', text: 'Partner Sign Up' },
                { to: '/contact', text: 'Support & Contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} style={{ color: 'var(--text-muted)', transition: 'color 150ms ease' }} onMouseOver={(e) => (e.target.style.color = 'var(--primary-600)')} onMouseOut={(e) => (e.target.style.color = 'var(--text-muted)')}>
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Get in Touch</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={15} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
                <span>support@nourishlink.org</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={15} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
                <span>+91 98765 43210</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <MapPin size={15} style={{ color: 'var(--primary-600)', marginTop: '2px', flexShrink: 0 }} />
                <span>Green Park, New Delhi, 110016</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-light)',
          }}
        >
          <div>
            © {new Date().getFullYear()} NourishLink. Built for Capstone Project Evaluation.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link to="/privacy-policy" style={{ color: 'var(--text-light)', transition: 'color 150ms' }} onMouseOver={(e) => (e.target.style.color = 'var(--primary-600)')} onMouseOut={(e) => (e.target.style.color = 'var(--text-light)')}>
              Privacy
            </Link>
            <Link to="/terms" style={{ color: 'var(--text-light)', transition: 'color 150ms' }} onMouseOver={(e) => (e.target.style.color = 'var(--primary-600)')} onMouseOut={(e) => (e.target.style.color = 'var(--text-light)')}>
              Terms
            </Link>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Made with <Heart size={12} style={{ color: 'var(--rose-500)' }} /> for social good
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
