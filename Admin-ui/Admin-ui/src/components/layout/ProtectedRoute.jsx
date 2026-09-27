import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AccessDenied } from '../ui/AccessDenied';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children, permission }) {
  const { isAuthenticated, bootstrapping, hasPermission } = useAuth();
  const location = useLocation();

  if (bootstrapping) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand" size={28} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && !hasPermission(permission) && !hasPermission('*')) {
    return <AccessDenied />;
  }

  return children;
}
