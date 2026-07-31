import { useState } from 'react';
import type { Student, Hostel, User } from '../types';
import { User as UserIcon, Settings, ShieldAlert, LogOut, Users, Key, Heart } from 'lucide-react';
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

  const handleSectionChange = (section: TabType) => {
    setActiveSection(section);
    sessionStorage.setItem('livisync_profile_section', section);
  };

  const handleSaveFields = (updatedFields: Partial<User>) => {
    onSave({
      ...currentUser,
      ...updatedFields,
    } as User);
  };


  return (
    <div style={splitLayoutContainerStyle}>
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
  gridTemplateColumns: '260px 1fr',
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
