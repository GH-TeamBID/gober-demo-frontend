import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gober-bg-100 dark:bg-gober-primary-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gober-accent-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the intended destination for after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 