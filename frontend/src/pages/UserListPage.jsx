import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUsers } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { Badge, Button, Spinner, Alert, Pagination, EmptyState, Modal } from '../components/common/UI';

const UserListPage = () => {
  const { users, pagination, isLoading, error, fetchUsers, deleteUser, clearError } = useUsers();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ search: '', role: '', isActive: '', page: 1, limit: 10 });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadUsers = useCallback(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.role) params.role = filters.role;
    if (filters.isActive !== '') params.isActive = filters.isActive;
    params.page = filters.page;
    params.limit = filters.limit;
    fetchUsers(params);
  }, [filters, fetchUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.page !== 1) {
        setFilters((p) => ({ ...p, page: 1 }));
      } else {
        loadUsers();
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [filters.search]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value, page: 1 }));
  };

  const handlePageChange = (page) => setFilters((p) => ({ ...p, page }));

  const confirmDelete = (u) => setDeleteModal({ open: true, user: u });
  const cancelDelete = () => setDeleteModal({ open: false, user: null });

  const handleDelete = async () => {
    if (!deleteModal.user) return;
    setDeleteLoading(true);
    const result = await deleteUser(deleteModal.user._id);
    setDeleteLoading(false);
    cancelDelete();
    if (result.success) {
      setSuccessMsg(`${deleteModal.user.name} has been deactivated.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">
              {pagination ? `${pagination.total} total users` : 'Manage your organization users'}
            </p>
          </div>
          {currentUser?.role === 'admin' && (
            <Button variant="primary" onClick={() => navigate('/users/create')}>
              + Create User
            </Button>
          )}
        </div>

        {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}
        {error && <Alert type="error" message={error} onClose={clearError} />}

        {/* Filters */}
        <div className="filter-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              name="search"
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={handleFilterChange}
              className="search-input"
            />
          </div>
          <select name="role" value={filters.role} onChange={handleFilterChange} className="filter-select">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
          <select name="isActive" value={filters.isActive} onChange={handleFilterChange} className="filter-select">
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select name="limit" value={filters.limit} onChange={handleFilterChange} className="filter-select">
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-card">
          {isLoading ? (
            <Spinner center size="lg" />
          ) : users.length === 0 ? (
            <EmptyState title="No users found" message="Try adjusting your search or filter." icon="👥" />
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className={!u.isActive ? 'row-inactive' : ''}>
                      <td>
                        <div className="user-cell">
                          <span className="avatar-sm">{u.name?.charAt(0).toUpperCase()}</span>
                          <span className="user-name-cell">{u.name}</span>
                        </div>
                      </td>
                      <td className="email-cell">{u.email}</td>
                      <td><Badge variant={u.role}>{u.role}</Badge></td>
                      <td><Badge variant={u.isActive ? 'active' : 'inactive'}>{u.isActive ? 'Active' : 'Inactive'}</Badge></td>
                      <td className="date-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/users/${u._id}`} className="action-btn view-btn" title="View">👁</Link>
                          {(currentUser?.role === 'admin' ||
                            (currentUser?.role === 'manager' && u.role !== 'admin')) && (
                            <Link to={`/users/${u._id}/edit`} className="action-btn edit-btn" title="Edit">✏️</Link>
                          )}
                          {currentUser?.role === 'admin' && u._id !== currentUser._id && (
                            <button
                              className="action-btn delete-btn"
                              onClick={() => confirmDelete(u)}
                              title="Deactivate"
                              disabled={!u.isActive}
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.open} onClose={cancelDelete} title="Confirm Deactivation">
        <p className="modal-message">
          Are you sure you want to deactivate <strong>{deleteModal.user?.name}</strong>?
          <br />
          <small>This is a soft delete. The user will be deactivated but data is preserved.</small>
        </p>
        <div className="modal-actions">
          <Button variant="ghost" onClick={cancelDelete}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleteLoading}>
            Deactivate
          </Button>
        </div>
      </Modal>
    </Layout>
  );
};

export default UserListPage;
