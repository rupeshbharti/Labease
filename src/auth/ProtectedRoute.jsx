import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import LoadingSpinner from '../shared/LoadingSpinner';

/**
 * ProtectedRoute — Guards routes based on authentication and role.
 *
 * @param {string} role - Required role to access this route (optional)
 * @param {React.ReactNode} children - Child components to render if authorized
 */
export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, profile, loading } = useAuth();
  const location = useLocation();

  // Still checking auth state
  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but no profile → redirect to profile setup
  if (!profile) {
    return <Navigate to="/profile-setup" replace />;
  }

  // Profile exists but role doesn't match → redirect to correct dashboard
  if (role && profile.role !== role) {
    const correctDashboard = {
      patient: '/patient',
      lab_staff: '/lab',
      phlebotomist: '/phlebo',
      platform_admin: '/admin',
    };
    return <Navigate to={correctDashboard[profile.role] || '/'} replace />;
  }

  return children;
}
