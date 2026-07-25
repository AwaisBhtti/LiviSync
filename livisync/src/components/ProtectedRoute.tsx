import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute = ({ redirectPath = '/login' }: ProtectedRouteProps) => {
  const token = localStorage.getItem('livisync_token');

  if (!token) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
