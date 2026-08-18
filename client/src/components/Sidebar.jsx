import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Inbox,
  User,
  Users,
  UtensilsCrossed,
  Layers,
  BarChart3,
  ScrollText,
  Sliders,
  Compass,
  Truck,
  Bell,
} from 'lucide-react';

const Sidebar = () => {
  const { user, isDonor, isReceiver, isAdmin } = useAuth();

  const navItemStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontWeight: 600,
    fontSize: '0.9rem',
    color: isActive ? 'var(--primary-700)' : 'var(--text-muted)',
    backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
    borderLeft: isActive ? '3px solid var(--primary-600)' : '3px solid transparent',
    transition: 'all var(--trans-fast)',
    marginBottom: '0.25rem',
    textDecoration: 'none',
  });

  return (
    <aside className="dashboard-sidebar">
      {/* Role Profile summary header */}
      <div style={{ padding: '1.5rem 1.25rem 1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: isAdmin
                ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
                : isDonor
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.1rem',
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {user?.organizationName || (isAdmin ? 'System Administrator' : isDonor ? 'Food Donor' : 'Registered NGO')}
            </div>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div style={{ padding: '1.25rem 0.75rem', flex: 1 }}>
        
        {/* DONOR NAVIGATION */}
        {isDonor && (
          <>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', padding: '0.5rem 0.75rem', letterSpacing: '0.08em' }}>
              Donor Portal
            </div>
            <NavLink to="/donor-dashboard" style={navItemStyle} end>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/donations/create" style={navItemStyle}>
              <PlusCircle size={18} /> List Surplus Food
            </NavLink>
            <NavLink to="/donations/my" style={navItemStyle}>
              <Package size={18} /> My Food Listings
            </NavLink>
            <NavLink to="/requests" style={navItemStyle}>
              <Inbox size={18} /> Received Requests
            </NavLink>
            <NavLink to="/donations" style={navItemStyle}>
              <Compass size={18} /> Browse Platform
            </NavLink>
          </>
        )}

        {/* RECEIVER / NGO NAVIGATION */}
        {isReceiver && (
          <>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', padding: '0.5rem 0.75rem', letterSpacing: '0.08em' }}>
              NGO Distribution Hub
            </div>
            <NavLink to="/receiver-dashboard" style={navItemStyle} end>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/donations" style={navItemStyle}>
              <Compass size={18} /> Explore Surplus Food
            </NavLink>
            <NavLink to="/requests" style={navItemStyle}>
              <Package size={18} /> My Food Requests
            </NavLink>
          </>
        )}

        {/* ADMIN NAVIGATION */}
        {isAdmin && (
          <>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', padding: '0.5rem 0.75rem', letterSpacing: '0.08em' }}>
              Admin Console
            </div>
            <NavLink to="/admin" style={navItemStyle} end>
              <LayoutDashboard size={18} /> Overview
            </NavLink>
            <NavLink to="/admin/users" style={navItemStyle}>
              <Users size={18} /> User Management
            </NavLink>
            <NavLink to="/admin/donations" style={navItemStyle}>
              <UtensilsCrossed size={18} /> All Food Donations
            </NavLink>
            <NavLink to="/admin/requests" style={navItemStyle}>
              <Inbox size={18} /> Request Oversight
            </NavLink>
            <NavLink to="/admin/categories" style={navItemStyle}>
              <Layers size={18} /> Category Manager
            </NavLink>
            <NavLink to="/admin/reports" style={navItemStyle}>
              <BarChart3 size={18} /> Analytics & Reports
            </NavLink>
            <NavLink to="/admin/activity-logs" style={navItemStyle}>
              <ScrollText size={18} /> Activity Logs
            </NavLink>
            <NavLink to="/admin/settings" style={navItemStyle}>
              <Sliders size={18} /> System Settings
            </NavLink>
          </>
        )}

        {/* GENERAL LINKS */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', padding: '1rem 0.75rem 0.5rem 0.75rem', letterSpacing: '0.08em' }}>
          Account
        </div>
        <NavLink to="/profile" style={navItemStyle}>
          <User size={18} /> Profile & Security
        </NavLink>
        <NavLink to="/notifications" style={navItemStyle}>
          <Bell size={18} /> Notification Center
        </NavLink>
      </div>

      {/* Footer info pill in sidebar */}
      <div style={{ padding: '1rem', margin: '0.75rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)' }}>
          🌱 NourishLink ZeroWaste
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Verified MERN Ecosystem v1.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
