import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUsers } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { Badge, Button, Spinner, Alert } from '../components/common/UI';

const AuditRow = ({ label, value, sub }) => (
  <div className="audit-row">
    <span className="audit-label">{label}</span>
    <span className="audit-value">
      {value || <span className="audit-empty">—</span>}
      {sub && <small className="audit-sub">{sub}</small>}
    </span>
  </div>
);

const UserDetailPage = () => {
  const { id } = useParams();
  const { selectedUser, isLoading, error, fetchUserById, clearError } = useUsers();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserById(id);
    return () => clearError();
  }, [id]); // eslint-disable-line

  const canEdit =
    currentUser?.role === 'admin' ||
    (currentUser?.role === 'manager' && selectedUser?.role !== 'admin') ||
    currentUser?._id === id;

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : null;

  if (isLoading) return <Layout><div className="page-container"><Spinner center size="lg" /></div></Layout>;

  if (error) return (
    <Layout>
      <div className="page-container">
        <Alert type="error" message={error} />
        <Button variant="ghost" onClick={() => navigate(-1)}>← Go Back</Button>
      </div>
    </Layout>
  );

  if (!selectedUser) return null;

  const u = selectedUser;

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
            <h1 className="page-title">User Detail</h1>
          </div>
          {canEdit && (
            <Link to={`/users/${id}/edit`}>
              <Button variant="primary">Edit User</Button>
            </Link>
          )}
        </div>

        <div className="detail-grid">
          {/* Profile Card */}
          <div className="detail-card profile-card">
            <div className="profile-hero">
              <div className="avatar-xl">{u.name?.charAt(0).toUpperCase()}</div>
              <div className="profile-hero-info">
                <h2>{u.name}</h2>
                <p>{u.email}</p>
                <div className="badge-row">
                  <Badge variant={u.role}>{u.role}</Badge>
                  <Badge variant={u.isActive ? 'active' : 'inactive'}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4 className="section-title">Account Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">User ID</span>
                  <span className="info-value mono">{u._id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Role</span>
                  <Badge variant={u.role}>{u.role}</Badge>
                </div>
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <Badge variant={u.isActive ? 'active' : 'inactive'}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Login</span>
                  <span className="info-value">{formatDate(u.lastLoginAt) || 'Never'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Trail Card — REQUIRED */}
          <div className="detail-card audit-card">
            <h4 className="section-title audit-title">
              <span>📋</span> Audit Trail
            </h4>
            <p className="audit-description">Full history of creation and modification.</p>

            <div className="audit-section">
              <h5 className="audit-section-label">Creation</h5>
              <AuditRow
                label="Created At"
                value={formatDate(u.createdAt)}
              />
              <AuditRow
                label="Created By"
                value={u.createdBy ? u.createdBy.name : 'System / Self'}
                sub={u.createdBy ? u.createdBy.email : null}
              />
            </div>

            <div className="audit-divider" />

            <div className="audit-section">
              <h5 className="audit-section-label">Last Modification</h5>
              <AuditRow
                label="Updated At"
                value={formatDate(u.updatedAt)}
              />
              <AuditRow
                label="Updated By"
                value={u.updatedBy ? u.updatedBy.name : '—'}
                sub={u.updatedBy ? u.updatedBy.email : null}
              />
            </div>

            {u.isDeleted && (
              <>
                <div className="audit-divider" />
                <div className="audit-section">
                  <h5 className="audit-section-label audit-deleted">Deletion</h5>
                  <AuditRow label="Deleted At" value={formatDate(u.deletedAt)} />
                  <AuditRow
                    label="Deleted By"
                    value={u.deletedBy ? u.deletedBy.name : '—'}
                    sub={u.deletedBy ? u.deletedBy.email : null}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDetailPage;
