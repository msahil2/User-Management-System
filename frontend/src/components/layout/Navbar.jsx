import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const roleBadgeColor = {
    admin: '#ef4444',
    manager: '#f59e0b',
    user: '#3b82f6',
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">
          <span className="brand-icon">⬡</span>
          <span className="brand-text">UMS</span>
        </Link>
      </div>

      <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
          Dashboard
        </Link>

        {/* Admin & Manager can view user list */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Link to="/users" className={`nav-link ${isActive('/users') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            Users
          </Link>
        )}

        <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
          My Profile
        </Link>
      </div>

      <div className="navbar-right">
        <div className="user-info">
          <span className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-role" style={{ color: roleBadgeColor[user?.role] }}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span /><span /><span />
      </button>
    </nav>
  );
};

export default Navbar;
