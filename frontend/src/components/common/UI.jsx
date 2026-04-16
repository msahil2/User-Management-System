import React from 'react';

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ children, variant = 'default' }) => {
  const colors = {
    admin: 'badge-admin',
    manager: 'badge-manager',
    user: 'badge-user',
    active: 'badge-active',
    inactive: 'badge-inactive',
    default: 'badge-default',
  };
  return <span className={`badge ${colors[variant] || colors.default}`}>{children}</span>;
};

// ─── Button ───────────────────────────────────────────────────────────────────
export const Button = ({ children, variant = 'primary', size = 'md', disabled, loading, onClick, type = 'button', className = '' }) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <span className="btn-spinner" /> : children}
    </button>
  );
};

// ─── Input ────────────────────────────────────────────────────────────────────
export const Input = ({ label, name, type = 'text', value, onChange, error, placeholder, required, disabled }) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-input ${error ? 'input-error' : ''}`}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

// ─── Select ───────────────────────────────────────────────────────────────────
export const Select = ({ label, name, value, onChange, options, error, required, disabled }) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`form-select ${error ? 'input-error' : ''}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

// ─── Alert ────────────────────────────────────────────────────────────────────
export const Alert = ({ type = 'error', message, onClose }) => {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>
      {onClose && <button className="alert-close" onClick={onClose}>✕</button>}
    </div>
  );
};

// ─── Spinner ─────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', center = false }) => (
  <div className={center ? 'spinner-center' : ''}>
    <div className={`spinner spinner-${size}`} />
  </div>
);

// ─── Modal ───────────────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState = ({ title = 'No results found', message = '', icon = '📭' }) => (
  <div className="empty-state">
    <span className="empty-icon">{icon}</span>
    <h4>{title}</h4>
    {message && <p>{message}</p>}
  </div>
);

// ─── Pagination ───────────────────────────────────────────────────────────────
export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <span className="pagination-info">Showing {from}–{to} of {total}</span>
      <div className="pagination-controls">
        <button className="page-btn" onClick={() => onPageChange(page - 1)} disabled={!pagination.hasPrev}>‹ Prev</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => Math.abs(p - page) <= 2)
          .map((p) => (
            <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPageChange(p)}>
              {p}
            </button>
          ))}
        <button className="page-btn" onClick={() => onPageChange(page + 1)} disabled={!pagination.hasNext}>Next ›</button>
      </div>
    </div>
  );
};
