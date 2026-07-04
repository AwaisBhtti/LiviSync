import { Building, Users, MessageSquare, User, Shield } from 'lucide-react';
import type { User as UserType } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserType;
  onToggleRole: () => void;
  unreadCount: number;
}

export const Navbar = ({
  activeTab,
  setActiveTab,
  currentUser,
  onToggleRole,
  unreadCount,
}: NavbarProps) => {
  return (
    <>
      {/* Desktop Top Navbar */}
      <header style={headerStyle}>
        <div style={navContainerStyle}>
          <div style={logoSectionStyle} onClick={() => setActiveTab('hostels')}>
            <Building size={20} strokeWidth={2.2} />
            <span style={logoTextStyle}>LiviSync</span>
          </div>

          <nav style={desktopNavStyle}>
            <button
              onClick={() => setActiveTab('hostels')}
              style={tabButtonStyle(activeTab === 'hostels')}
            >
              <Building size={16} />
              Hostels
            </button>
            <button
              onClick={() => setActiveTab('roommates')}
              style={tabButtonStyle(activeTab === 'roommates')}
            >
              <Users size={16} />
              Roommates
            </button>
            <button
              onClick={() => setActiveTab('chats')}
              style={tabButtonStyle(activeTab === 'chats')}
            >
              <MessageSquare size={16} />
              Inbox
              {unreadCount > 0 && <span style={unreadBadgeStyle}>{unreadCount}</span>}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              style={tabButtonStyle(activeTab === 'profile')}
            >
              <User size={16} />
              Profile
            </button>
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                style={tabButtonStyle(activeTab === 'admin')}
              >
                <Shield size={16} />
                Admin
              </button>
            )}
          </nav>

          <div style={userControlStyle}>
            <div style={roleDisplayStyle}>
              <span style={roleLabelStyle}>Simulated Role:</span>
              <span style={roleBadgeStyle(currentUser.role)}>
                {currentUser.role === 'admin' ? 'Admin' : 'Student'}
              </span>
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }} onClick={onToggleRole}>
              Switch Role
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navbar */}
      <div className="mobile-nav-bar">
        <button
          onClick={() => setActiveTab('hostels')}
          style={mobileTabButtonStyle(activeTab === 'hostels')}
        >
          <Building size={20} />
          <span style={mobileTabTextStyle}>Hostels</span>
        </button>
        <button
          onClick={() => setActiveTab('roommates')}
          style={mobileTabButtonStyle(activeTab === 'roommates')}
        >
          <Users size={20} />
          <span style={mobileTabTextStyle}>Roommates</span>
        </button>
        <button
          onClick={() => setActiveTab('chats')}
          style={mobileTabButtonStyle(activeTab === 'chats')}
        >
          <div style={{ position: 'relative' }}>
            <MessageSquare size={20} />
            {unreadCount > 0 && <span style={mobileUnreadBadgeStyle}>{unreadCount}</span>}
          </div>
          <span style={mobileTabTextStyle}>Inbox</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          style={mobileTabButtonStyle(activeTab === 'profile')}
        >
          <User size={20} />
          <span style={mobileTabTextStyle}>Profile</span>
        </button>
        {currentUser.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            style={mobileTabButtonStyle(activeTab === 'admin')}
          >
            <Shield size={20} />
            <span style={mobileTabTextStyle}>Admin</span>
          </button>
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
  color: role === 'admin' ? 'var(--danger)' : 'var(--primary)',
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
