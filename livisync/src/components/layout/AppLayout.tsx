import { Outlet } from 'react-router-dom';
import { Navbar } from '../Navbar';
import type { User } from '../../types';

interface AppLayoutProps {
  currentUser: User;
  onLogout: () => void;
  unreadMessagesCount: number;
  pendingRequestsCount: number;
}

export const AppLayout = ({
  currentUser,
  onLogout,
  unreadMessagesCount,
  pendingRequestsCount,
}: AppLayoutProps) => (
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
export default AppLayout;
