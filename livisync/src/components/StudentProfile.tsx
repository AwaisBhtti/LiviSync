import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Student, Hostel, User } from '../types';
import { Settings, ShieldAlert, LogOut, Users, Key, Heart } from 'lucide-react';
import { ProfileTab } from './profile/ProfileTab';
import { FriendsTab } from './profile/FriendsTab';
import { LifestyleTab } from './profile/LifestyleTab';
import { AccountTab } from './profile/AccountTab';
import { BlocklistTab } from './profile/BlocklistTab';
import { useAppDispatch, useAppSelector } from '../store/store';
import { useMatchRequests } from '../hooks/useMatchRequests';
import { useUserActions } from '../hooks/useUserActions';
import { useCountUp } from '../hooks/useReveal';
import { logout } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import { FriendProfileModal } from './profile/FriendProfileModal';
import { DEFAULT_AVATAR } from '../styles/commonStyles';
import logo from '../assets/logo.png';

interface StudentProfileProps {
  currentUser: Student;
  onSave: (updatedUser: User) => void;
  hostels: Hostel[];
  users: User[];
  onUnblockUser: (targetId: string) => void;
}

type TabType = 'profile' | 'friends' | 'lifestyle' | 'account' | 'blocklist';

const SECTIONS: { key: TabType; icon: React.ReactNode; label: string }[] = [
  { key: 'profile', icon: <Settings size={13} strokeWidth={2.75} />, label: 'Profile' },
  { key: 'lifestyle', icon: <Heart size={13} strokeWidth={2.75} />, label: 'Lifestyle' },
  { key: 'friends', icon: <Users size={13} strokeWidth={2.75} />, label: 'Connections' },
  { key: 'account', icon: <Key size={13} strokeWidth={2.75} />, label: 'Account' },
  { key: 'blocklist', icon: <ShieldAlert size={13} strokeWidth={2.75} />, label: 'Blocklist' },
];

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

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType;

  const [activeSection, setActiveSection] = useState<TabType>(() => {
    return tabParam || (sessionStorage.getItem('livisync_profile_section') as TabType) || 'profile';
  });

  // Sync state if tabParam query parameter changes
  useEffect(() => {
    if (tabParam && tabParam !== activeSection) {
      setActiveSection(tabParam);
    }
  }, [tabParam, activeSection]);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);

  const connectionsCount = matchRequests.filter(
    (r) => r.status === 'accepted' && (r.senderId === currentUser.id || r.receiverId === currentUser.id)
  ).length;

  const requestsCount = matchRequests.filter(
    (r) => r.status === 'pending' && r.receiverId === currentUser.id
  ).length;

  const connections = useCountUp(connectionsCount, true);
  const requests = useCountUp(requestsCount, true);

  const isComplete = currentUser.isProfileComplete || currentUser.is_profile_complete;

  const handleSectionChange = (section: TabType) => {
    setActiveSection(section);
    sessionStorage.setItem('livisync_profile_section', section);
    setSearchParams({ tab: section });
  };

  const handleSaveFields = (updatedFields: Partial<User>) => {
    onSave({
      ...currentUser,
      ...updatedFields,
    } as User);
  };

  return (
    <div style={{ paddingTop: '1.5rem' }}>
      <style>{`
        .sp-signout:hover { background: var(--color-accent-100) !important; }
        .sp-tabs::-webkit-scrollbar { display: none; }
        .sp-tabs {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media (max-width: 640px) {
          .sp-hero { padding: 32px 24px !important; }
          .sp-stats { margin-left: 0 !important; width: 100%; gap: 20px !important; }
          .sp-tabs { flex-wrap: nowrap !important; overflow-x: auto; padding-bottom: 8px; }
          .sp-card { padding: 1.25rem !important; }
        }
        @media (max-width: 480px) {
          .sp-hero { padding: 24px 16px !important; border-radius: var(--radius-lg) !important; }
        }
      `}</style>

      {/* ── Hero banner ── */}
      <div className="sp-hero" style={heroStyle}>
        <img src={logo} alt="" style={heroMarkStyle} />
        <div style={heroInnerStyle}>
          <img
            src={currentUser.photo || DEFAULT_AVATAR}
            alt={currentUser.name}
            style={heroAvatarStyle}
          />
          <div style={{ minWidth: 0 }}>
            <div style={heroEyebrowStyle}>Student profile</div>
            <div className="display" style={heroNameStyle}>{currentUser.name}</div>
            <div style={heroMetaStyle}>
              {[
                currentUser.institution || currentUser.company,
                currentUser.location,
                isComplete ? 'Profile complete' : 'Profile incomplete',
              ]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </div>

          <div className="sp-stats" style={heroStatsStyle}>
            <div>
              <div style={heroStatValueStyle}>{connections}</div>
              <div style={heroStatLabelStyle}>Connections</div>
            </div>
            <div>
              <div style={heroStatValueStyle}>{requests}</div>
              <div style={heroStatLabelStyle}>Requests</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section pills ── */}
      <div className="sp-tabs" style={tabRowStyle}>
        {SECTIONS.map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => handleSectionChange(key)}
            className={activeSection === key ? 'pill pill-active' : 'pill'}
          >
            {icon}
            {label}
          </button>
        ))}
        <button onClick={handleLogout} className="pill sp-signout" style={{ marginLeft: 'auto' }}>
          <LogOut size={13} strokeWidth={2.75} />
          Sign out
        </button>
      </div>

      {/* ── Section content ── */}
      <div className="sp-card" style={contentCardStyle}>
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const heroStyle: React.CSSProperties = {
  position: 'relative',
  borderRadius: 'calc(var(--radius-lg) * 1.3)',
  overflow: 'hidden',
  background: 'var(--color-text)',
  color: 'var(--color-bg)',
  padding: '48px',
  animation: 'ls-fade 0.8s ease both',
};

const heroMarkStyle: React.CSSProperties = {
  position: 'absolute',
  right: '-40px',
  top: '-60px',
  width: '320px',
  opacity: 0.1,
  animation: 'ls-float 8s ease-in-out infinite',
};

const heroInnerStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '26px',
  flexWrap: 'wrap',
};

const heroAvatarStyle: React.CSSProperties = {
  width: '104px',
  height: '104px',
  borderRadius: 'var(--radius-pill)',
  objectFit: 'cover',
  border: '4px solid var(--color-accent)',
  flexShrink: 0,
};

const heroEyebrowStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--color-accent-300)',
  marginBottom: '8px',
};

const heroNameStyle: React.CSSProperties = {
  fontSize: 'clamp(32px, 4.2vw, 64px)',
  letterSpacing: '0.05em',
  lineHeight: 0.94,
  color: 'var(--color-bg)',
};

const heroMetaStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: 'rgba(245, 234, 216, 0.7)',
  marginTop: '6px',
};

const heroStatsStyle: React.CSSProperties = {
  marginLeft: 'auto',
  display: 'flex',
  gap: '34px',
};

const heroStatValueStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: '2rem',
  lineHeight: 1.1,
};

const heroStatLabelStyle: React.CSSProperties = {
  fontSize: '0.66rem',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'rgba(245, 234, 216, 0.65)',
};

const tabRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '6px',
  flexWrap: 'wrap',
  alignItems: 'center',
  margin: '34px 0 30px',
};

const contentCardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'calc(var(--radius-lg) * 1.15)',
  padding: '2rem',
  boxShadow: 'var(--shadow-sm)',
  animation: 'ls-fade 0.5s ease both',
};
