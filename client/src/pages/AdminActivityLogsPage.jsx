import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { ScrollText, ShieldAlert, Filter, User } from 'lucide-react';

const AdminActivityLogsPage = () => {
  const { showToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });

  const modules = ['all', 'AUTH', 'DONATION', 'REQUEST', 'PICKUP', 'USER', 'ADMIN', 'CATEGORY', 'PROFILE'];

  const fetchLogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (moduleFilter !== 'all') params.module = moduleFilter;

      const res = await adminService.getActivityLogs(params);
      if (res.success) {
        setLogs(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
      showToast('error', 'Failed to retrieve audit trail.');
    } finally {
      setLoading(false);
    }
  }, [moduleFilter, showToast]);

  useEffect(() => {
    fetchLogs(pagination.page);
  }, [fetchLogs, pagination.page]);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Security & Audit
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>
              Platform Activity Logs
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Immutable system event stream tracking registrations, listing updates, and handovers.
            </p>
          </div>

          {/* Module Filter Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {modules.map((m) => (
              <button
                key={m}
                onClick={() => setModuleFilter(m)}
                className={`btn btn-sm ${moduleFilter === m ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.775rem' }}
              >
                {m === 'all' ? 'All Modules' : m}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        {loading ? (
          <LoadingSpinner text="Fetching audit trail..." />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No Activity Logs Recorded"
            description="There are no audit records matching the specified module filter."
          />
        ) : (
          <div className="table-container" style={{ marginBottom: '2rem' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Code</th>
                  <th>Description</th>
                  <th>Triggered By</th>
                  <th>Module</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </div>
                    </td>

                    <td>
                      <code style={{ background: 'var(--bg-main)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--primary-800)', border: '1px solid var(--border-color)' }}>
                        {log.action}
                      </code>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', maxWidth: '400px' }}>
                        {log.description}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.user?.name || 'System / Guest'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.user?.role ? `(${log.user.role})` : ''}</div>
                    </td>

                    <td>
                      <span className="badge" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                        {log.module}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        />

      </div>
    </DashboardLayout>
  );
};

export default AdminActivityLogsPage;
