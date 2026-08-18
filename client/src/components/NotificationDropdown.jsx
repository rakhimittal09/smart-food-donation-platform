import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { Check, Trash2, Bell, ExternalLink, CheckCheck } from 'lucide-react';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  return (
    <div className="notification-popover">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={18} style={{ color: 'var(--primary-600)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
          {unreadCount > 0 && (
            <span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>
              {unreadCount} New
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary-600)',
              fontSize: '0.775rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
            }}
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.85rem' }}>No notifications yet.</p>
          </div>
        ) : (
          notifications.slice(0, 8).map((n) => (
            <div
              key={n._id}
              style={{
                padding: '0.65rem',
                borderRadius: 'var(--radius-sm)',
                background: n.isRead ? 'transparent' : 'var(--primary-50)',
                border: '1px solid',
                borderColor: n.isRead ? 'var(--border-color)' : 'var(--primary-200)',
                transition: 'background 150ms ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  {n.title}
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      title="Mark as read"
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', padding: '2px' }}
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n._id)}
                    title="Delete notification"
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '2px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                {n.message}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {n.link && (
                  <Link
                    to={n.link}
                    onClick={onClose}
                    style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                  >
                    View <ExternalLink size={12} />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
        <Link
          to="/notifications"
          onClick={onClose}
          style={{ fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: 600 }}
        >
          View all notifications →
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
