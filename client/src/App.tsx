import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { VisitProvider } from './contexts/VisitContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <VisitProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/doctor" element={
            <ProtectedRoute roles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/manager" element={
            <ProtectedRoute roles={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </VisitProvider>
    </AuthProvider>
  );
};

export default App; 
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { VisitProvider } from './contexts/VisitContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <VisitProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/doctor" element={
            <ProtectedRoute roles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/manager" element={
            <ProtectedRoute roles={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </VisitProvider>
    </AuthProvider>
  );
};

export default App; 