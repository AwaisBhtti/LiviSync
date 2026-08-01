import { Link, useLocation } from 'react-router-dom';
import { Building, Users, MessageSquare, User, Shield } from 'lucide-react';
import type { User as UserType } from '../types';
import logo from '../assets/logo.png';

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
            <div style={logoBoxStyle}>
              <img src={logo} alt="LiviSync Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={logoTextStyle}>LIVISYNC</span>
          </Link>

          <nav className="desktop-nav-tabs" style={desktopNavStyle}>
            <div style={navTrackStyle}>
              <Link
                to="/hostels"
                style={tabButtonStyle(currentPath === '/hostels' || currentPath === '/')}
              >
                <Building size={15} />
                Hostels
              </Link>
              {currentUser.role === 'student' && (
                <>
                  <Link
                    to="/roommates"
                    style={tabButtonStyle(currentPath === '/roommates')}
                  >
                    <Users size={15} />
                    Roommates
                    {pendingRequestsCount > 0 && <span style={unreadBadgeStyle}>{pendingRequestsCount}</span>}
                  </Link>
                  <Link
                    to="/chats"
                    style={tabButtonStyle(currentPath === '/chats')}
                  >
                    <MessageSquare size={15} />
                    Inbox
                    {unreadMessagesCount > 0 && <span style={unreadBadgeStyle}>{unreadMessagesCount}</span>}
                  </Link>
                </>
              )}
              <Link
                to="/profile"
                style={tabButtonStyle(currentPath === '/profile')}
              >
                <User size={15} />
                Profile
              </Link>
              {currentUser.role === 'owner' && (
                <Link
                  to="/owner"
                  style={tabButtonStyle(currentPath === '/owner')}
                >
                  <Building size={15} />
                  Owner Portal
                </Link>
              )}
              {currentUser.role === 'admin' && (
                <Link
                  to="/admin"
                  style={tabButtonStyle(currentPath === '/admin')}
                >
                  <Shield size={15} />
                  Admin
                </Link>
              )}
            </div>
          </nav>

          <div style={userControlStyle}>
            {currentUser.role !== 'student' && (
              <div style={roleDisplayStyle}>
                <span style={roleLabelStyle}>Role:</span>
                <span style={roleBadgeStyle(currentUser.role)}>
                  {currentUser.role === 'admin' ? 'Admin' : 'Owner'}
                </span>
              </div>
            )}
            <button className="btn btn-primary" style={{ padding: '0.375rem 0.875rem', fontSize: '0.775rem' }} onClick={onLogout}>
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

// ─── Styles — Organic: cream bar, dark pill nav track ─────────────────────────

const headerStyle: React.CSSProperties = {
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  backgroundColor: 'rgba(245, 234, 216, 0.90)',
  position: 'sticky',
  top: 0,
  zIndex: 90,
};

const navContainerStyle: React.CSSProperties = {
  maxWidth: '1240px',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1.5rem',
  height: '76px',
  padding: '0 1.5rem',
};

const logoBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '26px',
  height: '26px',
  flexShrink: 0,
};

const logoSectionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
  cursor: 'pointer',
  textDecoration: 'none',
};

const logoTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 400,
  fontSize: '1.1875rem',
  letterSpacing: '0.2em',
  color: 'var(--color-text)',
};

const desktopNavStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

/* The floating "island": a dark pill holding the section tabs */
const navTrackStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  background: 'var(--color-text)',
  padding: '8px',
  borderRadius: 'var(--radius-pill)',
  boxShadow: '0 10px 34px rgba(32, 30, 29, 0.22)',
};

const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.5625rem 1rem',
  fontFamily: 'var(--font-body)',
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--color-bg)',
  opacity: isActive ? 1 : 0.72,
  background: isActive ? 'var(--color-accent)' : 'transparent',
  border: 'none',
  borderRadius: 'var(--radius-pill)',
  cursor: 'pointer',
  transition: 'var(--transition)',
  position: 'relative',
  textDecoration: 'none',
  whiteSpace: 'nowrap' as const,
});

const unreadBadgeStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-accent-300)',
  color: 'var(--color-accent-900)',
  fontSize: '0.625rem',
  fontWeight: 800,
  borderRadius: 'var(--radius-pill)',
  minWidth: '17px',
  height: '17px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 5px',
  marginLeft: '2px',
  letterSpacing: 0,
};

const mobileUnreadBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-4px',
  right: '-6px',
  backgroundColor: 'var(--color-accent)',
  color: 'var(--color-bg)',
  fontSize: '0.625rem',
  fontWeight: 800,
  borderRadius: 'var(--radius-pill)',
  width: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const userControlStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const roleDisplayStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  fontSize: '0.6875rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  background: 'var(--color-neutral-200)',
  padding: '0.4375rem 0.875rem',
  borderRadius: 'var(--radius-pill)',
};

const roleLabelStyle: React.CSSProperties = {
  color: 'var(--muted)',
  fontWeight: 600,
};

const roleBadgeStyle = (role: string): React.CSSProperties => ({
  fontWeight: 800,
  color: role === 'admin' ? 'var(--color-accent-700)' : 'var(--color-accent-2-700)',
});

const mobileTabButtonStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  background: 'none',
  border: 'none',
  color: isActive ? 'var(--color-accent-300)' : 'rgba(245, 234, 216, 0.65)',
  cursor: 'pointer',
  fontSize: '0.75rem',
  width: '20%',
  padding: '6px 0',
  transition: 'var(--transition)',
});

const mobileTabTextStyle: React.CSSProperties = {
  fontSize: '0.5625rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};
