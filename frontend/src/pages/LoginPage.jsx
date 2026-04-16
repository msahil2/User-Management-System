import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Button } from '../components/common/UI';

const LoginPage = () => {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'At least 6 characters';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setFormErrors(errs);

    setSubmitting(true);
    await login(form.email, form.password);
    setSubmitting(false);
  };

  if (isLoading) return null;

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <span className="brand-icon-lg">⬡</span>
          <h1>User Management<br />System</h1>
          <p>Secure, role-based access control for your organization</p>
        </div>
        <div className="login-features">
          <div className="feature-item"><span>🔐</span><span>JWT Authentication</span></div>
          <div className="feature-item"><span>👥</span><span>Role-Based Access Control</span></div>
          <div className="feature-item"><span>📋</span><span>Full Audit Trail</span></div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <Alert type="error" message={error} onClose={clearError} />

          <div className="demo-creds">
            <span>🔑 Demo:</span>
            <code>admin@example.com</code>
            <span>/</span>
            <code>Admin@123</code>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address <span className="required">*</span></label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`form-input ${formErrors.email ? 'input-error' : ''}`}
                autoComplete="email"
                autoFocus
              />
              {formErrors.email && <span className="error-text">{formErrors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password <span className="required">*</span></label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                className={`form-input ${formErrors.password ? 'input-error' : ''}`}
                autoComplete="current-password"
              />
              {formErrors.password && <span className="error-text">{formErrors.password}</span>}
            </div>

            <Button type="submit" variant="primary" size="lg" loading={submitting} className="login-btn">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
