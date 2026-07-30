import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/store';

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute = ({ redirectPath = '/login' }: ProtectedRouteProps) => {
  const token = useAppSelector((state) => state.auth.token);

  if (!token) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
