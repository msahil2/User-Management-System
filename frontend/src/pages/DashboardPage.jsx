import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import Layout from '../components/layout/Layout';
import { Spinner, Badge } from '../components/common/UI';

const StatCard = ({ icon, label, value, color, to }) => (
  <Link to={to || '#'} className="stat-card" style={{ '--card-accent': color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  </Link>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (user.role === 'admin' || user.role === 'manager') {
          const [all, active, admins, managers] = await Promise.all([
            usersAPI.getAll({ limit: 100 }),
            usersAPI.getAll({ isActive: true, limit: 100 }),
            usersAPI.getAll({ role: 'admin', limit: 100 }),
            usersAPI.getAll({ role: 'manager', limit: 100 }),
          ]);
          setStats({
            total: all.data.meta?.total || 0,
            active: active.data.meta?.total || 0,
            admins: admins.data.meta?.total || 0,
            managers: managers.data.meta?.total || 0,
          });
          const recent = await usersAPI.getAll({ limit: 5, sort: '-createdAt' });
          setRecentUsers(recent.data.data || []);
        }
      } catch {
        // stats not critical
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user.role]);

  const roleGreeting = {
    admin: 'Full administrative access',
    manager: 'User management access',
    user: 'Standard user access',
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              Welcome back, <strong>{user?.name}</strong> — {roleGreeting[user?.role]}
            </p>
          </div>
          <Badge variant={user?.role}>{user?.role?.toUpperCase()}</Badge>
        </div>

        {loading ? (
          <Spinner center size="lg" />
        ) : (
          <>
            {stats && (
              <div className="stats-grid">
                <StatCard icon="👥" label="Total Users" value={stats.total} color="#3b82f6" to="/users" />
                <StatCard icon="✅" label="Active Users" value={stats.active} color="#10b981" to="/users?isActive=true" />
                <StatCard icon="🛡️" label="Admins" value={stats.admins} color="#ef4444" to="/users?role=admin" />
                <StatCard icon="📋" label="Managers" value={stats.managers} color="#f59e0b" to="/users?role=manager" />
              </div>
            )}

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Your Profile</h3>
                  <Link to="/profile" className="card-link">Edit →</Link>
                </div>
                <div className="profile-info">
                  <div className="avatar-lg">{user?.name?.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="profile-name">{user?.name}</p>
                    <p className="profile-email">{user?.email}</p>
                    <Badge variant={user?.role}>{user?.role}</Badge>
                  </div>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Your Permissions</h3>
                </div>
                <div className="permissions-list">
                  {user?.role === 'admin' && (
                    <>
                      <div className="permission-item allowed">✓ Create & delete users</div>
                      <div className="permission-item allowed">✓ Assign roles</div>
                      <div className="permission-item allowed">✓ View all users</div>
                      <div className="permission-item allowed">✓ Full system access</div>
                    </>
                  )}
                  {user?.role === 'manager' && (
                    <>
                      <div className="permission-item allowed">✓ View all users</div>
                      <div className="permission-item allowed">✓ Update non-admin users</div>
                      <div className="permission-item denied">✗ Cannot create/delete users</div>
                      <div className="permission-item denied">✗ Cannot change roles</div>
                    </>
                  )}
                  {user?.role === 'user' && (
                    <>
                      <div className="permission-item allowed">✓ View own profile</div>
                      <div className="permission-item allowed">✓ Update name & password</div>
                      <div className="permission-item denied">✗ Cannot access other profiles</div>
                      <div className="permission-item denied">✗ No admin privileges</div>
                    </>
                  )}
                </div>
              </div>

              {recentUsers.length > 0 && (
                <div className="dashboard-card full-width">
                  <div className="card-header">
                    <h3>Recently Added Users</h3>
                    <Link to="/users" className="card-link">View all →</Link>
                  </div>
                  <div className="recent-table">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentUsers.map((u) => (
                          <tr key={u._id}>
                            <td>
                              <Link to={`/users/${u._id}`} className="user-link">
                                <span className="avatar-sm">{u.name?.charAt(0).toUpperCase()}</span>
                                {u.name}
                              </Link>
                            </td>
                            <td>{u.email}</td>
                            <td><Badge variant={u.role}>{u.role}</Badge></td>
                            <td><Badge variant={u.isActive ? 'active' : 'inactive'}>{u.isActive ? 'Active' : 'Inactive'}</Badge></td>
                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
