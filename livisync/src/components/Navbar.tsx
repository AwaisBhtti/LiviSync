import { Link, useLocation } from 'react-router-dom';
import { Building, Users, MessageSquare, User, Shield } from 'lucide-react';
import type { User as UserType } from '../types';

interface NavbarProps {
  currentUser: UserType;
  onLogout: () => void;
  unreadMessagesCount: number;
  pendingRequestsCount: number;
}

export const Navbar = ({
  currentUser,
  onLogout,
  unreadMessagesCount,
  pendingRequestsCount,
}: NavbarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <>
      {/* Desktop Top Navbar */}
      <header style={headerStyle}>
        <div style={navContainerStyle}>
          <Link style={logoSectionStyle} to="/hostels">
            <Building size={20} strokeWidth={2.2} />
            <span style={logoTextStyle}>LiviSync</span>
          </Link>

          <nav style={desktopNavStyle}>
            <Link
              to="/hostels"
              style={tabButtonStyle(currentPath === '/hostels' || currentPath === '/')}
            >
              <Building size={16} />
              Hostels
            </Link>
            {currentUser.role === 'student' && (
              <>
                <Link
                  to="/roommates"
                  style={tabButtonStyle(currentPath === '/roommates')}
                >
                  <Users size={16} />
                  Roommates
                  {pendingRequestsCount > 0 && <span style={unreadBadgeStyle}>{pendingRequestsCount}</span>}
                </Link>
                <Link
                  to="/chats"
                  style={tabButtonStyle(currentPath === '/chats')}
                >
                  <MessageSquare size={16} />
                  Inbox
                  {unreadMessagesCount > 0 && <span style={unreadBadgeStyle}>{unreadMessagesCount}</span>}
                </Link>
              </>
            )}
            <Link
              to="/profile"
              style={tabButtonStyle(currentPath === '/profile')}
            >
              <User size={16} />
              Profile
            </Link>
            {currentUser.role === 'owner' && (
              <Link
                to="/owner"
                style={tabButtonStyle(currentPath === '/owner')}
              >
                <Building size={16} />
                Owner Portal
              </Link>
            )}
            {currentUser.role === 'admin' && (
              <Link
                to="/admin"
                style={tabButtonStyle(currentPath === '/admin')}
              >
                <Shield size={16} />
                Admin
              </Link>
            )}
          </nav>

          <div style={userControlStyle}>
            <div style={roleDisplayStyle}>
              <span style={roleLabelStyle}>Role:</span>
              <span style={roleBadgeStyle(currentUser.role)}>
                {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'owner' ? 'Owner' : 'Student'}
              </span>
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }} onClick={onLogout}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navbar */}
      <div className="mobile-nav-bar">
        <Link
          to="/hostels"
          style={mobileTabButtonStyle(currentPath === '/hostels' || currentPath === '/')}
        >
          <Building size={20} />
          <span style={mobileTabTextStyle}>Hostels</span>
        </Link>
        {currentUser.role === 'student' && (
          <>
            <Link
              to="/roommates"
              style={mobileTabButtonStyle(currentPath === '/roommates')}
            >
              <div style={{ position: 'relative' }}>
                <Users size={20} />
                {pendingRequestsCount > 0 && <span style={mobileUnreadBadgeStyle}>{pendingRequestsCount}</span>}
              </div>
              <span style={mobileTabTextStyle}>Roommates</span>
            </Link>
            <Link
              to="/chats"
              style={mobileTabButtonStyle(currentPath === '/chats')}
            >
              <div style={{ position: 'relative' }}>
                <MessageSquare size={20} />
                {unreadMessagesCount > 0 && <span style={mobileUnreadBadgeStyle}>{unreadMessagesCount}</span>}
              </div>
              <span style={mobileTabTextStyle}>Inbox</span>
            </Link>
          </>
        )}
        <Link
          to="/profile"
          style={mobileTabButtonStyle(currentPath === '/profile')}
        >
          <User size={20} />
          <span style={mobileTabTextStyle}>Profile</span>
        </Link>
        {currentUser.role === 'owner' && (
          <Link
            to="/owner"
            style={mobileTabButtonStyle(currentPath === '/owner')}
          >
            <Building size={20} />
            <span style={mobileTabTextStyle}>Owner</span>
          </Link>
        )}
        {currentUser.role === 'admin' && (
          <Link
            to="/admin"
            style={mobileTabButtonStyle(currentPath === '/admin')}
          >
            <Shield size={20} />
            <span style={mobileTabTextStyle}>Admin</span>
          </Link>
        )}
      </div>
    </>
  );
};

// Styles
const headerStyle: React.CSSProperties = {
  backgroundColor: 'var(--card)',
  borderBottom: '1px solid var(--border)',
  position: 'sticky',
  top: 0,
  zIndex: 90,
};

const navContainerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '56px',
  padding: '0 1.5rem',
};

const logoSectionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
};

const logoTextStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: '1.05rem',
  letterSpacing: '-0.03em',
};

const desktopNavStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
};

const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  padding: '0.5rem 0.75rem',
  fontSize: '0.85rem',
  fontWeight: 500,
  color: isActive ? 'var(--foreground)' : 'var(--muted)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  borderRadius: 'var(--radius)',
  transition: 'var(--transition)',
  position: 'relative',
});

const unreadBadgeStyle: React.CSSProperties = {
  backgroundColor: 'var(--primary)',
  color: 'var(--primary-foreground)',
  fontSize: '0.7rem',
  fontWeight: 600,
  borderRadius: '9999px',
  minWidth: '16px',
  height: '16px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 4px',
  marginLeft: '4px',
};

const mobileUnreadBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-5px',
  right: '-8px',
  backgroundColor: 'var(--danger)',
  color: 'white',
  fontSize: '0.65rem',
  fontWeight: 600,
  borderRadius: '9999px',
  width: '14px',
  height: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const userControlStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const roleDisplayStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  fontSize: '0.8rem',
};

const roleLabelStyle: React.CSSProperties = {
  color: 'var(--muted)',
};

const roleBadgeStyle = (role: string): React.CSSProperties => ({
  fontWeight: 600,
  color: role === 'admin' ? 'var(--danger)' : role === 'owner' ? 'var(--success)' : 'var(--primary)',
});

const mobileTabButtonStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
  background: 'none',
  border: 'none',
  color: isActive ? 'var(--foreground)' : 'var(--muted)',
  cursor: 'pointer',
  fontSize: '0.75rem',
  width: '20%',
  padding: '4px 0',
});

const mobileTabTextStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  fontWeight: 500,
};
