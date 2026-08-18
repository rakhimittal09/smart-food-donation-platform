import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import DashboardLayout from '../components/DashboardLayout';
import EmptyState from '../components/EmptyState';
import { Bell, Check, Trash2, CheckCheck, ExternalLink } from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true));

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Alert Center
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>
              Platform Notifications
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Real-time alerts on food requests, status approvals, and pickup scheduling.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setFilter('all')}
              className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Unread ({unreadCount})
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.35rem' }}
              >
                <CheckCheck size={14} /> Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No Notifications"
            description={filter === 'unread' ? 'You have read all your notifications!' : 'Your inbox is clear.'}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map((n) => (
              <div
                key={n._id}
                className="card"
                style={{
                  padding: '1.25rem',
                  borderLeft: n.isRead ? '4px solid var(--border-color)' : '4px solid var(--primary-500)',
                  background: n.isRead ? '#ffffff' : 'var(--primary-50)',
                  transition: 'all var(--trans-fast)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>New</span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: '1.6' }}>
                      {n.message}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                      {n.link && (
                        <Link
                          to={n.link}
                          style={{ color: 'var(--primary-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          Open Resource <ExternalLink size={12} />
                        </Link>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n._id)}
                        className="btn btn-secondary btn-icon"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(n._id)}
                      className="btn btn-secondary btn-icon"
                      title="Delete"
                      style={{ color: 'var(--rose-600)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
