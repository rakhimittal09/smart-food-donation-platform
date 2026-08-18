import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import {
  HeartHandshake,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  PlusCircle,
  Search,
  ShieldCheck,
  Package,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isDonor, isReceiver, isAdmin, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowNotifications(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin';
    if (isDonor) return '/donor-dashboard';
    if (isReceiver) return '/receiver-dashboard';
    return '/';
  };

  return (
    <nav className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <HeartHandshake size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Nourish<span style={{ color: 'var(--primary-600)' }}>Link</span>
            </span>
            <div style={{ fontSize: '0.675rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '-3px' }}>
              Smart Food Donation
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1.75rem' }} className="desktop-links">
          <Link
            to="/donations"
            style={{
              fontWeight: 600,
              fontSize: '0.925rem',
              color: location.pathname === '/donations' ? 'var(--primary-600)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Search size={16} /> Explore Food
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to={getDashboardPath()}
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: location.pathname.includes('dashboard') || location.pathname === '/admin' ? 'var(--primary-600)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>

              {isDonor && (
                <Link
                  to="/donations/create"
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <PlusCircle size={16} /> Donate Food
                </Link>
              )}

              {isReceiver && (
                <Link
                  to="/requests"
                  style={{
                    fontWeight: 600,
                    fontSize: '0.925rem',
                    color: location.pathname === '/requests' ? 'var(--primary-600)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Package size={16} /> My Requests
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right Section: Auth & Notifications */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <>
              {/* Notifications Popover */}
              <div style={{ position: 'relative' }} ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="btn btn-secondary btn-icon"
                  style={{ position: 'relative', borderRadius: '50%', width: '40px', height: '40px' }}
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-3px',
                        background: 'var(--rose-500)',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 0 2px #ffffff',
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <NotificationDropdown onClose={() => setShowNotifications(false)} />
                )}
              </div>

              {/* User Menu */}
              <div style={{ position: 'relative' }} ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: isAdmin ? 'var(--rose-500)' : isDonor ? 'var(--primary-600)' : 'var(--amber-500)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div style={{ textAlign: 'left', display: 'none' }} className="desktop-user-info">
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.1 }}>{user?.name?.split(' ')[0]}</div>
                    <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {user?.role === 'receiver' ? 'NGO' : user?.role}
                    </div>
                  </div>
                </button>

                {showUserMenu && (
                  <div
                    className="glass-card"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '0.5rem',
                      width: '220px',
                      padding: '0.5rem',
                      zIndex: 100,
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-xl)',
                    }}
                  >
                    <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.35rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.email}
                      </div>
                      <span className={`badge ${isAdmin ? 'badge-rejected' : isDonor ? 'badge-available' : 'badge-requested'}`} style={{ marginTop: '0.35rem' }}>
                        {user?.role?.toUpperCase()}
                      </span>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'transparent' }}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>

                    <Link
                      to="/profile"
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'transparent' }}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={16} /> My Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'transparent' }}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <ShieldCheck size={16} /> Admin Console
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'transparent', color: 'var(--rose-600)', marginTop: '0.25rem', borderTop: '1px solid var(--border-color)' }}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary btn-icon"
            style={{ display: 'none' }}
            id="mobile-toggle-btn"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#ffffff',
            borderBottom: '1px solid var(--border-color)',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <Link to="/donations" style={{ fontWeight: 600, padding: '0.5rem 0' }}>
            🔍 Explore Available Food
          </Link>

          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath()} style={{ fontWeight: 600, padding: '0.5rem 0' }}>
                📊 Dashboard
              </Link>
              {isDonor && (
                <Link to="/donations/create" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  ➕ Donate Surplus Food
                </Link>
              )}
              {isReceiver && (
                <Link to="/requests" style={{ fontWeight: 600, padding: '0.5rem 0' }}>
                  📦 My Requests & Pickups
                </Link>
              )}
              <Link to="/profile" style={{ fontWeight: 600, padding: '0.5rem 0' }}>
                👤 Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-danger btn-sm"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ flex: 1 }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ flex: 1 }}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Responsive Inline CSS for toggles */}
      <style>{`
        @media (min-width: 860px) {
          .desktop-links { display: flex !important; }
          .desktop-user-info { display: block !important; }
        }
        @media (max-width: 859px) {
          #mobile-toggle-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
