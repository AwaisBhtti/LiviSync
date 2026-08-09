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

  const isActive = (to: string) =>
    to === '/hostels' ? currentPath === '/hostels' || currentPath === '/' : currentPath === to;

  const navItems = [
    { to: '/hostels', label: 'Hostels', icon: <Building size={14} strokeWidth={2.75} />, badge: 0 },
    ...(currentUser.role === 'student'
      ? [
        { to: '/roommates', label: 'Roommates', icon: <Users size={14} strokeWidth={2.75} />, badge: pendingRequestsCount },
        { to: '/chats', label: 'Inbox', icon: <MessageSquare size={14} strokeWidth={2.75} />, badge: unreadMessagesCount },
      ]
      : []),
    { to: '/profile', label: 'Profile', icon: <User size={14} strokeWidth={2.75} />, badge: 0 },
    ...(currentUser.role === 'owner'
      ? [{ to: '/owner', label: 'Owner Portal', icon: <Building size={14} strokeWidth={2.75} />, badge: 0 }]
      : []),
    ...(currentUser.role === 'admin'
      ? [{ to: '/admin', label: 'Admin', icon: <Shield size={14} strokeWidth={2.75} />, badge: 0 }]
      : []),
  ];

  // Surfaced on the collapsed capsule so a closed menu never hides a notification
  const notificationCount = unreadMessagesCount + pendingRequestsCount;

  return (
    <>
      {/* Desktop Top Navbar */}
      <header className="app-header" style={headerStyle}>
        <style>{`
          /* Collapsed by default; hover or keyboard focus opens it. Tabbing into
             a link trips :focus-within, so the menu is reachable without a mouse. */
          .ls-island {
            border-radius: 14px;
            transform: scale(0.97);
            transition: border-radius 0.5s var(--ease-organic),
                        padding 0.5s var(--ease-organic),
                        transform 0.5s var(--ease-organic);
          }
          .ls-island:hover,
          .ls-island:focus-within {
            border-radius: 999px;
            transform: scale(1);
            padding-right: 14px;
          }

          .ls-island-mark {
            border-radius: 9px;
            transition: border-radius 0.5s var(--ease-organic), transform 0.5s var(--ease-organic);
          }
          .ls-island:hover .ls-island-mark,
          .ls-island:focus-within .ls-island-mark {
            border-radius: 999px;
            transform: rotate(360deg);
          }

          .ls-island-label {
            max-width: 140px;
            opacity: 1;
            transition: max-width 0.5s var(--ease-organic), opacity 0.3s ease;
          }
          .ls-island:hover .ls-island-label,
          .ls-island:focus-within .ls-island-label {
            max-width: 0;
            opacity: 0;
          }

          .ls-island-items {
            max-width: 0;
            opacity: 0;
            transition: max-width 0.55s var(--ease-organic), opacity 0.35s ease 0.1s;
          }
          .ls-island:hover .ls-island-items,
          .ls-island:focus-within .ls-island-items {
            max-width: 680px;
            opacity: 1;
          }

          .ls-island-items a:hover { opacity: 1; background: rgba(245, 234, 216, 0.12); }

          @media (prefers-reduced-motion: reduce) {
            .ls-island, .ls-island-mark, .ls-island-label, .ls-island-items { transition: none; }
          }
        `}</style>
        <div style={navContainerStyle}>
          <Link style={logoSectionStyle} to="/hostels">
            <div style={logoBoxStyle}>
              <img src={logo} alt="LiviSync Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={logoTextStyle}>LIVISYNC</span>
          </Link>

          {/* The island: collapsed to a "Menu" capsule, expanding on hover or
              keyboard focus to reveal the sections. */}
          <nav className="desktop-nav-tabs" style={desktopNavStyle} aria-label="Sections">
            <div className="ls-island" style={islandStyle}>

              <span className="ls-island-label" style={islandLabelStyle} aria-hidden="true">
                <span>Menu</span>
                {notificationCount > 0 ? (
                  <span style={unreadBadgeStyle}>{notificationCount}</span>
                ) : (
                  <span style={blinkDotStyle} />
                )}
              </span>

              <span className="ls-island-items" style={islandItemsStyle}>
                {navItems.map(({ to, label, icon, badge }) => (
                  <Link key={to} to={to} style={tabButtonStyle(isActive(to))}>
                    {icon}
                    {label}
                    {badge > 0 && <span style={unreadBadgeStyle}>{badge}</span>}
                  </Link>
                ))}
              </span>
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

/* The floating "island" — a dark capsule that opens to reveal the sections */
const islandStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: 'var(--color-text)',
  padding: '8px 16px 8px 8px',
  boxShadow: '0 10px 34px rgba(32, 30, 29, 0.32)',
};

const islandLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '9px',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  fontSize: '0.6875rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  fontWeight: 700,
  color: 'var(--color-bg)',
};

const blinkDotStyle: React.CSSProperties = {
  width: '5px',
  height: '5px',
  borderRadius: 'var(--radius-pill)',
  background: 'var(--color-accent)',
  animation: 'ls-blink 1.8s ease-in-out infinite',
  flexShrink: 0,
};

const islandItemsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
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
