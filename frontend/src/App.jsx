import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserListPage from './pages/UserListPage';
import UserDetailPage from './pages/UserDetailPage';
import UserFormPage from './pages/UserFormPage';
import MyProfilePage from './pages/MyProfilePage';

import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected - all roles */}
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><MyProfilePage /></ProtectedRoute>
            } />

            {/* Protected - admin & manager only */}
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}><UserListPage /></ProtectedRoute>
            } />
            <Route path="/users/create" element={
              <ProtectedRoute allowedRoles={['admin']}><UserFormPage /></ProtectedRoute>
            } />
            <Route path="/users/:id" element={
              <ProtectedRoute><UserDetailPage /></ProtectedRoute>
            } />
            <Route path="/users/:id/edit" element={
              <ProtectedRoute><UserFormPage /></ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
