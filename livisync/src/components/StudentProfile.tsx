import { useState } from 'react';
import type { Student, Hostel, User } from '../types';
import { User as UserIcon, Settings, ShieldAlert, LogOut, Users, Key, Heart, ChevronRight, ArrowLeft } from 'lucide-react';
import { ProfileTab } from './profile/ProfileTab';
import { FriendsTab } from './profile/FriendsTab';
import { LifestyleTab } from './profile/LifestyleTab';
import { AccountTab } from './profile/AccountTab';
import { BlocklistTab } from './profile/BlocklistTab';
import { useAppDispatch, useAppSelector } from '../store/store';
import { useMatchRequests } from '../hooks/useMatchRequests';
import { useUserActions } from '../hooks/useUserActions';
import { logout } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import { FriendProfileModal } from './profile/FriendProfileModal';

interface StudentProfileProps {
  currentUser: Student;
  onSave: (updatedUser: User) => void;
  hostels: Hostel[];
  users: User[];
  onUnblockUser: (targetId: string) => void;
}

type TabType = 'profile' | 'friends' | 'lifestyle' | 'account' | 'blocklist';

export const StudentProfile = ({
  currentUser,
  onSave,
  hostels,
  users,
  onUnblockUser,
}: StudentProfileProps) => {
  const dispatch = useAppDispatch();
  
  // Retrieve matches & actions directly from hooks/store to keep App.tsx props unchanged
  const { matchRequests } = useAppSelector((state) => state.matches);
  const { handleUnfriend } = useMatchRequests();
  const { handleBlockUser, handleReportUser } = useUserActions();
  const handleLogout = () => {
    dispatch(logout());
  };

  const [activeSection, setActiveSection] = useState<TabType>(() => {
    return (sessionStorage.getItem('livisync_profile_section') as TabType) || 'profile';
  });
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  // mobileDrilled: true when user has tapped into a section on narrow screens
  const [mobileDrilled, setMobileDrilled] = useState(false);

  const handleSectionChange = (section: TabType) => {
    setActiveSection(section);
    setMobileDrilled(true);
    sessionStorage.setItem('livisync_profile_section', section);
  };

  const handleMobileBack = () => {
    setMobileDrilled(false);
  };

  const handleSaveFields = (updatedFields: Partial<User>) => {
    onSave({
      ...currentUser,
      ...updatedFields,
    } as User);
  };


  return (
    <div className="split-layout profile-split-layout" style={splitLayoutContainerStyle}>
      {/* Sidebar Navigation */}
      <div style={sidebarStyle} className="mobile-hide">
        <div style={sidebarHeaderStyle}>
          <UserIcon size={18} />
          <h4>Your Account</h4>
        </div>
        <div
          style={sidebarItemStyle(activeSection === 'profile')}
          onClick={() => handleSectionChange('profile')}
          className="sidebar-tab"
        >
          <Settings size={14} />
          Profile Settings
        </div>
        <div
          style={sidebarItemStyle(activeSection === 'friends')}
          onClick={() => handleSectionChange('friends')}
          className="sidebar-tab"
        >
          <Users size={14} />
          My Friends
        </div>
        <div
          style={sidebarItemStyle(activeSection === 'lifestyle')}
          onClick={() => handleSectionChange('lifestyle')}
          className="sidebar-tab"
        >
          <Heart size={14} />
          Lifestyle &amp; Habits
        </div>
        <div
          style={sidebarItemStyle(activeSection === 'account')}
          onClick={() => handleSectionChange('account')}
          className="sidebar-tab"
        >
          <Key size={14} />
          Account Security
        </div>
        <div
          style={sidebarItemStyle(activeSection === 'blocklist')}
          onClick={() => handleSectionChange('blocklist')}
          className="sidebar-tab"
        >
          <ShieldAlert size={14} />
          Blocked Users
        </div>

        {/* Logout Button on Bottom */}
        <button
          onClick={handleLogout}
          className="btn btn-primary"
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            width: '100%',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>

      {/* Main Settings Card */}
      <div className="card" style={rightCardStyle}>

        {/* ── Mobile: Section List (shown when NOT drilled into a section) ── */}
        {!mobileDrilled && (
          <div className="mobile-section-list">
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Account</p>
            {([
              { key: 'profile',   icon: <Settings size={16} />,     label: 'Profile Settings' },
              { key: 'friends',   icon: <Users size={16} />,        label: 'My Friends' },
              { key: 'lifestyle', icon: <Heart size={16} />,        label: 'Lifestyle & Habits' },
              { key: 'account',   icon: <Key size={16} />,          label: 'Account Security' },
              { key: 'blocklist', icon: <ShieldAlert size={16} />,  label: 'Blocked Users' },
            ] as { key: TabType; icon: React.ReactNode; label: string }[]).map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => handleSectionChange(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  width: '100%', padding: '0.85rem 1rem',
                  background: 'transparent',
                  border: 'none', borderBottom: '1px solid var(--border-solid)',
                  borderRadius: 0, cursor: 'pointer',
                  color: '#332721', fontSize: '0.9rem', fontWeight: 500,
                  textAlign: 'left',
                }}
              >
                <span style={{ color: 'var(--primary)', opacity: 0.75 }}>{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                <ChevronRight size={15} style={{ color: 'var(--muted)', opacity: 0.6 }} />
              </button>
            ))}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                width: '100%', padding: '0.85rem 1rem', marginTop: '0.5rem',
                background: 'transparent',
                border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600,
                textAlign: 'left',
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}

        {/* ── Mobile: Back button (shown when drilled into a section) ── */}
        {mobileDrilled && (
          <button
            className="mobile-back-btn"
            onClick={handleMobileBack}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600,
              padding: '0 0 1rem 0', marginBottom: '0.25rem',
            }}
          >
            <ArrowLeft size={15} />
            Back
          </button>
        )}

        {/* ── Section Content (always shown on desktop; on mobile only when drilled) ── */}
        <div className={mobileDrilled ? 'mobile-section-content drilled' : 'mobile-section-content'}>
          {activeSection === 'profile' && (
            <ProfileTab currentUser={currentUser} hostels={hostels} onSave={handleSaveFields} />
          )}

          {activeSection === 'friends' && (
            <FriendsTab
              currentUser={currentUser}
              users={users}
              matchRequests={matchRequests}
              onUnfriend={handleUnfriend}
              onSelectFriend={setSelectedFriend}
            />
          )}

          {activeSection === 'lifestyle' && (
            <LifestyleTab currentUser={currentUser} onSave={handleSaveFields} />
          )}

          {activeSection === 'account' && <AccountTab onLogout={handleLogout} />}

          {activeSection === 'blocklist' && (
            <BlocklistTab currentUser={currentUser} users={users} onUnblockUser={onUnblockUser} />
          )}
        </div>
      </div>

      {selectedFriend && (
        <FriendProfileModal
          selectedUser={selectedFriend}
          currentUser={currentUser}
          matchRequests={matchRequests}
          onClose={() => setSelectedFriend(null)}
          onUnfriend={async (id) => {
            try {
              await handleUnfriend(id);
              setSelectedFriend(null);
            } catch (err: any) {
              dispatch(showToast({ message: err.message || 'Error unfriending.', type: 'error' }));
            }
          }}
          onBlockUser={async (id) => {
            try {
              await handleBlockUser(id);
              setSelectedFriend(null);
            } catch (err: any) {
              dispatch(showToast({ message: err.message || 'Error blocking user.', type: 'error' }));
            }
          }}
          onReportUser={async (reportedId, reason, desc) => {
            try {
              await handleReportUser(reportedId, reason, desc);
              const stillConnected = matchRequests.some(
                (r) => r.status === 'accepted' &&
                  ((r.senderId === currentUser.id && r.receiverId === reportedId) ||
                    (r.senderId === reportedId && r.receiverId === currentUser.id))
              );
              if (!stillConnected) {
                setSelectedFriend(null);
              }
            } catch (err: any) {
              dispatch(showToast({ message: err.message || 'Error submitting report', type: 'error' }));
            }
          }}
          showSafetyActions={true}
        />
      )}
    </div>
  );
};

// Sidebar & Layout Styles
const splitLayoutContainerStyle: React.CSSProperties = {
  display: 'grid',
  // gridTemplateColumns is controlled by the .split-layout CSS class to allow responsive overrides
  gap: '2rem',
  height: 'calc(100vh - 180px)',
  minHeight: '520px',
};

const sidebarStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  height: '100%',
};

const rightCardStyle: React.CSSProperties = {
  padding: '2rem',
  height: '100%',
  overflowY: 'auto',
};

const sidebarHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem',
  borderBottom: '1px solid var(--border)',
  marginBottom: '0.5rem',
};

const sidebarItemStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.625rem 0.875rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  borderRadius: 'var(--radius)',
  backgroundColor: isActive ? 'var(--secondary)' : 'transparent',
  color: isActive ? 'var(--foreground)' : 'var(--muted)',
  cursor: 'pointer',
});
