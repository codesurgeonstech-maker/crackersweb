import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, requiredRole }) {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-6">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!currentUser && !userProfile) {
    const loginRedirect = requiredRole === 'developer' ? '/developer/login' : '/admin/login';
    return <Navigate to={loginRedirect} state={{ from: location }} replace />;
  }

  // Check role
  const userRole = userProfile?.role;
  if (requiredRole === 'developer' && userRole !== 'developer') {
    return <Navigate to="/developer/login" replace />;
  }

  // Allow developer to also inspect owner panels if needed, otherwise must be owner
  if (requiredRole === 'owner' && userRole !== 'owner' && userRole !== 'developer') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
