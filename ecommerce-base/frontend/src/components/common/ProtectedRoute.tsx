/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants/index';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 