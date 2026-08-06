import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../Navbar';
import type { User } from '../../types';

interface AppLayoutProps {
  currentUser: User;
  onLogout: () => void;
  unreadMessagesCount: number;
  pendingRequestsCount: number;
}

const isBasicProfileComplete = (user: any): boolean => {
  if (!user || user.role !== 'student') return true;
  return !!(
    user.name && user.name.trim() &&
    user.age && user.age >= 16 &&
    user.gender &&
    user.location && user.location.trim() &&
    user.budget && user.budget > 0 &&
    user.occupation
  );
};

export const AppLayout = ({
  currentUser,
  onLogout,
  unreadMessagesCount,
  pendingRequestsCount,
}: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (currentUser && currentUser.role === 'student') {
      const isComplete = currentUser.isProfileComplete || currentUser.is_profile_complete;
      const path = location.pathname;
      const tabParam = new URLSearchParams(location.search).get('tab');

      if (!isComplete) {
        const hasBasic = isBasicProfileComplete(currentUser);
        if (!hasBasic) {
          if (path !== '/profile' || tabParam !== 'profile') {
            navigate('/profile?tab=profile', { replace: true });
          }
        } else {
          if (path !== '/profile' || tabParam !== 'lifestyle') {
            navigate('/profile?tab=lifestyle', { replace: true });
          }
        }
      }
    }
  }, [currentUser, location.pathname, location.search, navigate]);

  return (
    <div className="app-container">
      <Navbar
        currentUser={currentUser}
        onLogout={onLogout}
        unreadMessagesCount={unreadMessagesCount}
        pendingRequestsCount={pendingRequestsCount}
      />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
