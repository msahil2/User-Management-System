import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUsers } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { Input, Select, Button, Alert, Spinner } from '../components/common/UI';

const UserFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { selectedUser, isLoading, fetchUserById, createUser, updateUser, clearError } = useUsers();

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'user', isActive: 'true',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) fetchUserById(id);
    return () => clearError();
  }, [id]); // eslint-disable-line

  useEffect(() => {
    if (isEdit && selectedUser && selectedUser._id === id) {
      setForm({
        name: selectedUser.name || '',
        email: selectedUser.email || '',
        password: '',
        role: selectedUser.role || 'user',
        isActive: String(selectedUser.isActive ?? true),
      });
    }
  }, [selectedUser, isEdit, id]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!isEdit || form.email) {
      if (!form.email) errs.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Valid email required';
    }
    if (!isEdit && !form.password) errs.password = 'Password is required';
    if (form.password && form.password.length < 6) errs.password = 'At least 6 characters';
    if (form.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      errs.password = 'Must contain uppercase, lowercase, and number';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);

    setSubmitting(true);
    setSubmitError('');

    const payload = { name: form.name, email: form.email, role: form.role, isActive: form.isActive === 'true' };
    if (form.password) payload.password = form.password;

    const result = isEdit
      ? await updateUser(id, payload)
      : await createUser(payload);

    setSubmitting(false);

    if (result.success) {
      navigate(isEdit ? `/users/${id}` : '/users');
    } else {
      setSubmitError(result.message || 'Operation failed. Please try again.');
    }
  };

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' },
  ];

  const statusOptions = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

  if (isEdit && isLoading) return <Layout><div className="page-container"><Spinner center size="lg" /></div></Layout>;

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
            <h1 className="page-title">{isEdit ? 'Edit User' : 'Create User'}</h1>
            <p className="page-subtitle">{isEdit ? `Editing profile for ${selectedUser?.name}` : 'Add a new user to the system'}</p>
          </div>
        </div>

        <div className="form-card">
          {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <Input
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="John Doe"
                required
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="john@example.com"
                required={!isEdit}
              />
              <Input
                label={isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                placeholder={isEdit ? '••••••••' : 'Min 6 chars, A-Z, a-z, 0-9'}
                required={!isEdit}
              />
              {currentUser?.role === 'admin' && (
                <Select
                  label="Role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  options={roleOptions}
                  error={errors.role}
                />
              )}
              {currentUser?.role === 'admin' && (
                <Select
                  label="Status"
                  name="isActive"
                  value={form.isActive}
                  onChange={handleChange}
                  options={statusOptions}
                />
              )}
            </div>

            <div className="form-actions">
              <Button variant="ghost" onClick={() => navigate(-1)} type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={submitting}>
                {isEdit ? 'Save Changes' : 'Create User'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default UserFormPage;
