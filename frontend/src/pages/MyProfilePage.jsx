import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../context/UserContext';
import Layout from '../components/layout/Layout';
import { Input, Button, Alert, Badge, Spinner } from '../components/common/UI';

const MyProfilePage = () => {
  const { user: currentUser, updateUser: updateAuthUser } = useAuth();
  const { selectedUser, isLoading, fetchUserById, updateUser } = useUsers();

  const [form, setForm] = useState({ name: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser?._id) fetchUserById(currentUser._id);
  }, [currentUser?._id]); // eslint-disable-line

  useEffect(() => {
    if (selectedUser) {
      setForm((p) => ({ ...p, name: selectedUser.name || '' }));
    }
  }, [selectedUser]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    else if (form.name.trim().length < 2) errs.name = 'At least 2 characters';
    if (form.password) {
      if (form.password.length < 6) errs.password = 'At least 6 characters';
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) errs.password = 'Must contain uppercase, lowercase, and number';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    setSubmitError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);

    setSubmitting(true);
    const payload = { name: form.name };
    if (form.password) payload.password = form.password;

    const result = await updateUser(currentUser._id, payload);
    setSubmitting(false);

    if (result.success) {
      updateAuthUser({ name: form.name });
      setForm((p) => ({ ...p, password: '', confirmPassword: '' }));
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setSubmitError(result.message || 'Update failed.');
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';

  if (isLoading && !selectedUser) return <Layout><div className="page-container"><Spinner center size="lg" /></div></Layout>;

  const u = selectedUser || currentUser;

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">View and update your personal information</p>
          </div>
          <Badge variant={currentUser?.role}>{currentUser?.role?.toUpperCase()}</Badge>
        </div>

        <div className="profile-page-grid">
          {/* Profile Summary */}
          <div className="detail-card">
            <div className="profile-hero compact">
              <div className="avatar-xl">{u?.name?.charAt(0).toUpperCase()}</div>
              <div>
                <h3>{u?.name}</h3>
                <p className="muted">{u?.email}</p>
                <Badge variant={u?.role}>{u?.role}</Badge>
              </div>
            </div>

            <div className="audit-section" style={{ marginTop: '1.5rem' }}>
              <h5 className="audit-section-label">Account Details</h5>
              <div className="audit-row">
                <span className="audit-label">Member Since</span>
                <span className="audit-value">{formatDate(u?.createdAt)}</span>
              </div>
              <div className="audit-row">
                <span className="audit-label">Last Login</span>
                <span className="audit-value">{formatDate(u?.lastLoginAt)}</span>
              </div>
              <div className="audit-row">
                <span className="audit-label">Last Updated</span>
                <span className="audit-value">{formatDate(u?.updatedAt)}</span>
              </div>
              <div className="audit-row">
                <span className="audit-label">Updated By</span>
                <span className="audit-value">
                  {u?.updatedBy ? u.updatedBy.name : '—'}
                  {u?.updatedBy?.email && <small className="audit-sub">{u.updatedBy.email}</small>}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="detail-card">
            <h4 className="section-title">Update Profile</h4>
            <p className="muted" style={{ marginBottom: '1.5rem' }}>You can update your display name and change your password.</p>

            {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}
            {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}

            <form onSubmit={handleSubmit} noValidate>
              <Input
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Your full name"
                required
              />
              <div className="form-divider"><span>Change Password (optional)</span></div>
              <Input
                label="New Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Leave blank to keep current"
              />
              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Repeat new password"
              />
              <div className="form-actions">
                <Button type="submit" variant="primary" loading={submitting}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyProfilePage;
