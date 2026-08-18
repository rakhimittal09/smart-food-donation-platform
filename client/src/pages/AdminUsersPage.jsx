import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../components/ConfirmationModal';
import { Users, UserX, UserCheck, Trash2, Shield, Building2, MapPin } from 'lucide-react';

const AdminUsersPage = () => {
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });

  // Delete modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await adminService.getUsers(params);
      if (res.success) {
        setUsers(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      showToast('error', 'Failed to retrieve user directory.');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, searchTerm, showToast]);

  useEffect(() => {
    fetchUsers(pagination.page);
  }, [fetchUsers, pagination.page]);

  const handleToggleStatus = async (userObj) => {
    const newStatus = userObj.status === 'active' ? 'blocked' : 'active';
    try {
      const res = await adminService.updateUserStatus(userObj._id, newStatus);
      if (res.success) {
        showToast('success', `User account ${newStatus === 'active' ? 'activated' : 'suspended'}.`);
        fetchUsers(pagination.page);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Status update failed.');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setDeleting(true);
      const res = await adminService.deleteUser(selectedUser._id);
      if (res.success) {
        showToast('info', 'User deleted successfully.');
        setShowDeleteModal(false);
        fetchUsers(pagination.page);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Delete operation failed.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Administration
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>
              User Directory & Moderation
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Monitor registered donors, recipient NGOs, and system access permissions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'donor', 'receiver', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}
              >
                {r === 'all' ? 'All Roles' : r === 'receiver' ? 'NGOs' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <SearchBar onSearch={setSearchTerm} placeholder="Search users by name, email, organization, or phone..." />
        </div>

        {/* Users Table */}
        {loading ? (
          <LoadingSpinner text="Fetching user accounts..." />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Users Found"
            description="No user accounts match your search or filter parameters."
          />
        ) : (
          <div className="table-container" style={{ marginBottom: '2rem' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Role</th>
                  <th>Organization & City</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: u.role === 'admin' ? 'var(--rose-100)' : u.role === 'donor' ? 'var(--primary-100)' : 'var(--amber-100)',
                            color: u.role === 'admin' ? 'var(--rose-700)' : u.role === 'donor' ? 'var(--primary-700)' : 'var(--amber-700)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-rejected' : u.role === 'donor' ? 'badge-available' : 'badge-requested'}`}>
                        {u.role}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{u.organizationName || 'Individual'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.city ? `${u.city}, ${u.state || ''}` : 'Location unlisted'}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{u.phone}</div>
                    </td>

                    <td>
                      <span className={`badge ${u.status === 'active' ? 'badge-available' : 'badge-rejected'}`}>
                        {u.status}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {u.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`btn btn-sm ${u.status === 'active' ? 'btn-secondary' : 'btn-primary'}`}
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                              title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                            >
                              {u.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                              {u.status === 'active' ? 'Block' : 'Unblock'}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setShowDeleteModal(true);
                              }}
                              className="btn btn-secondary btn-icon"
                              style={{ color: 'var(--rose-600)' }}
                              title="Delete user"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
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

      {/* Delete User Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user "${selectedUser?.name}" (${selectedUser?.email})?`}
        confirmText="Confirm Delete"
        isDanger={true}
        loading={deleting}
      />

    </DashboardLayout>
  );
};

export default AdminUsersPage;
