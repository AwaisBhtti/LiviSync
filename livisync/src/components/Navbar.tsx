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
            <div style={logoBoxStyle}>
              <Building size={16} color="white" strokeWidth={2.5} />
            </div>
            <span style={logoTextStyle}>LiviSync</span>
          </Link>

          <nav style={desktopNavStyle}>
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
            <button className="btn btn-secondary" style={{ padding: '0.375rem 0.875rem', fontSize: '0.775rem' }} onClick={onLogout}>
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const headerStyle: React.CSSProperties = {
  backgroundColor: 'var(--glass-bg)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderBottom: '1px solid var(--border)',
  position: 'sticky',
  top: 0,
  zIndex: 90,
  boxShadow: '0 1px 24px rgba(99, 102, 241, 0.06)',
};

const navContainerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '64px',
  padding: '0 1.5rem',
};

const logoBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '30px',
  height: '30px',
  borderRadius: '8px',
  background: 'var(--gradient-brand)',
  boxShadow: '0 4px 10px var(--primary-glow)',
  flexShrink: 0,
};

const logoSectionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  textDecoration: 'none',
};

const logoTextStyle: React.CSSProperties = {
  fontWeight: 800,
  fontSize: '1.2rem',
  letterSpacing: '-0.04em',
  background: 'var(--gradient-brand)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontFamily: 'var(--font-sans)',
};

const desktopNavStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const navTrackStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  background: 'rgba(241, 245, 249, 0.6)',
  borderRadius: '12px',
  padding: '0.3rem',
  border: '1px solid var(--border)',
};

const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.45rem 0.875rem',
  fontSize: '0.85rem',
  fontWeight: isActive ? 700 : 500,
  color: isActive ? 'var(--foreground)' : 'var(--muted)',
  background: isActive ? 'white' : 'transparent',
  border: 'none',
  cursor: 'pointer',
  borderRadius: '9px',
  transition: 'var(--transition)',
  position: 'relative',
  boxShadow: isActive ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
  textDecoration: 'none',
  whiteSpace: 'nowrap' as const,
});

const unreadBadgeStyle: React.CSSProperties = {
  backgroundColor: 'var(--primary)',
  color: 'var(--primary-foreground)',
  fontSize: '0.65rem',
  fontWeight: 700,
  borderRadius: '9999px',
  minWidth: '16px',
  height: '16px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 4px',
  marginLeft: '2px',
  boxShadow: '0 2px 5px var(--primary-glow)',
};

const mobileUnreadBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-4px',
  right: '-6px',
  backgroundColor: 'var(--danger)',
  color: 'white',
  fontSize: '0.65rem',
  fontWeight: 700,
  borderRadius: '9999px',
  width: '15px',
  height: '15px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 5px var(--danger-glow)',
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
  background: 'var(--secondary)',
  padding: '0.375rem 0.75rem',
  borderRadius: '9999px',
};

const roleLabelStyle: React.CSSProperties = {
  color: 'var(--muted)',
  fontWeight: 500,
};

const roleBadgeStyle = (role: string): React.CSSProperties => ({
  fontWeight: 700,
  color: role === 'admin' ? 'var(--danger)' : 'var(--success)',
});

const mobileTabButtonStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  background: 'none',
  border: 'none',
  color: isActive ? 'var(--primary)' : 'var(--muted)',
  cursor: 'pointer',
  fontSize: '0.75rem',
  width: '20%',
  padding: '6px 0',
  transition: 'var(--transition)',
});

const mobileTabTextStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  fontWeight: 600,
};
