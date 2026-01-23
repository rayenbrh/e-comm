import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      toast.error(t('authErrors.loginRequired'));
    } else if (user.role !== 'admin') {
      toast.error(t('authErrors.adminRequired'));
    }
  }, [isAuthenticated, user, t]);

  // Not logged in, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is admin
  if (user.role !== 'admin') {
    // Not an admin, redirect to home
    return <Navigate to="/" replace />;
  }

  // User is authenticated and is admin, render the protected content
  return <>{children}</>;
};

