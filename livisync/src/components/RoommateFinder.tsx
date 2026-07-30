/**
 * RoommateFinder — orchestrates filters, grid, request panel, and modals.
 * State management lives here; rendering is delegated to sub-components.
 */
import { useState } from 'react';
import type { User, MatchRequest, Hostel } from '../types';
import { calculateCompatibility } from '../utils';
import { RoommateFilters } from './roommate/RoommateFilters';
import { RoommateGrid } from './roommate/RoommateGrid';
import { RoommateModals } from './roommate/RoommateModals';
import { RoommateRequestsPanel } from './roommate/RoommateRequestsPanel';
import { Users, Search } from 'lucide-react';

interface RoommateFinderProps {
  currentUser: User;
  users: User[];
  matchRequests: MatchRequest[];
  onSendRequest: (receiverId: string, message: string) => void;
  onBlockUser: (targetId: string) => void;
  onReportUser: (targetId: string, reason: string, description: string) => void;
  hostels: Hostel[];
  onCancelRequest: (requestId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
}

export const RoommateFinder = ({
  currentUser,
  users,
  matchRequests,
  onSendRequest,
  onBlockUser,
  onReportUser,
  hostels,
  onCancelRequest,
  onAcceptRequest,
  onDeclineRequest,
}: RoommateFinderProps) => {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [filterSleep, setFilterSleep] = useState('all');
  const [filterCleanliness, setFilterCleanliness] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterHostel, setFilterHostel] = useState('all');
  const [maxBudget, setMaxBudget] = useState(200000);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Tab state (persisted in sessionStorage) ───────────────────────────────
  const [activeTab, setActiveTab] = useState<'find' | 'requests'>(() => {
    return (sessionStorage.getItem('livisync_roommate_tab') as 'find' | 'requests') || 'find';
  });

  const handleTabChange = (tab: 'find' | 'requests') => {
    setActiveTab(tab);
    sessionStorage.setItem('livisync_roommate_tab', tab);
  };

  // ── Modal / selection state ───────────────────────────────────────────────
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [reqMessage, setReqMessage] = useState("Hey! Let's match up and search for rooms together!");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('fake-profile');
  const [reportDesc, setReportDesc] = useState('');

  // ── Compute candidates ────────────────────────────────────────────────────
  const candidates = users
    .filter((u) => {
      if (u.id === currentUser.id) return false;
      if (u.role === 'admin' || u.role === 'owner') return false;
      if (u.status === 'suspended') return false;
      if (currentUser.blockedUsers?.includes(u.id)) return false;

      const hasConnection = matchRequests.some(
        (r) =>
          r.status === 'accepted' &&
          ((r.senderId === currentUser.id && r.receiverId === u.id) ||
            (r.senderId === u.id && r.receiverId === currentUser.id))
      );
      if (hasConnection) return false;

      const matchesSleep = filterSleep === 'all' || u.preferences?.sleepSchedule === filterSleep;
      const matchesClean = filterCleanliness === 'all' || u.preferences?.cleanliness === filterCleanliness;
      const matchesGender = filterGender === 'all' || u.gender === filterGender;
      const matchesBudget = (u.budget ?? 0) <= maxBudget;
      const matchesHostel = filterHostel === 'all' || u.hostelId === filterHostel;
      const matchesSearch = !searchQuery.trim() || u.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSleep && matchesClean && matchesGender && matchesBudget && matchesHostel && matchesSearch;
    })
    .map((u) => ({ ...u, score: calculateCompatibility(currentUser.preferences, u.preferences) }))
    .sort((a, b) => b.score - a.score);

  // ── Pending received count (for tab badge) ────────────────────────────────
  const pendingReceivedCount = matchRequests.filter(
    (r) =>
      r.receiverId === currentUser.id &&
      r.status === 'pending' &&
      !(currentUser.blockedUsers ?? []).includes(r.senderId)
  ).length;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSubmitConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    onSendRequest(selectedUser.id, reqMessage);
    setShowConnectModal(false);
    setSelectedUser(null);
    setReqMessage("Hey! Let's match up and search for rooms together!");
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const wordCount = reportDesc.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 8) {
      alert('Please provide a detailed description (at least 8 words).');
      return;
    }
    onReportUser(selectedUser.id, reportReason, reportDesc);
    setShowReportModal(false);
    setSelectedUser(null);
    setReportDesc('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Premium Page Header */}
      <div style={pageHeroStyle}>
        <div style={pageHeroInnerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={heroIconBoxStyle}>
              <Users size={18} color="white" />
            </div>
            <h1 style={heroTitleStyle}>Find Roommates</h1>
          </div>
          <p style={heroSubtitleStyle}>
            Browse students, compare lifestyle compatibility, and build your team.
          </p>
        </div>

        {/* Search Bar */}
        <div style={searchBarWrapperStyle}>
          <Search size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchInputStyle}
          />
          {candidates.length > 0 && (
            <span style={resultCountStyle}>{candidates.length} found</span>
          )}
        </div>
      </div>

      {/* Premium Tab Switch */}
      <div style={tabTrackStyle}>
        <button
          onClick={() => handleTabChange('find')}
          style={tabStyle(activeTab === 'find')}
        >
          <Users size={15} />
          Browse
        </button>
        <button
          onClick={() => handleTabChange('requests')}
          style={tabStyle(activeTab === 'requests')}
        >
          Requests
          {pendingReceivedCount > 0 && (
            <span style={tabBadgeStyle}>{pendingReceivedCount}</span>
          )}
        </button>
      </div>

      {activeTab === 'find' ? (
        <>
          <div className="split-layout">
            <RoommateFilters
              maxBudget={maxBudget}
              filterGender={filterGender}
              filterSleep={filterSleep}
              filterCleanliness={filterCleanliness}
              filterHostel={filterHostel}
              hostels={hostels}
              onMaxBudgetChange={setMaxBudget}
              onGenderChange={setFilterGender}
              onSleepChange={setFilterSleep}
              onCleanlinessChange={setFilterCleanliness}
              onHostelChange={setFilterHostel}
            />
            <RoommateGrid
              candidates={candidates}
              matchRequests={matchRequests}
              currentUserId={currentUser.id}
              onSelectCandidate={setSelectedUser}
            />
          </div>

          <RoommateModals
            selectedUser={selectedUser}
            currentUser={currentUser}
            matchRequests={matchRequests}
            showConnectModal={showConnectModal}
            showReportModal={showReportModal}
            reqMessage={reqMessage}
            reportReason={reportReason}
            reportDesc={reportDesc}
            onCloseDetail={() => setSelectedUser(null)}
            onOpenConnect={() => setShowConnectModal(true)}
            onCloseConnect={() => setShowConnectModal(false)}
            onOpenReport={() => setShowReportModal(true)}
            onCloseReport={() => setShowReportModal(false)}
            onBlockUser={onBlockUser}
            onReqMessageChange={setReqMessage}
            onReportReasonChange={setReportReason}
            onReportDescChange={setReportDesc}
            onSubmitConnect={handleSubmitConnect}
            onSubmitReport={handleSubmitReport}
          />
        </>
      ) : (
        <RoommateRequestsPanel
          users={users}
          currentUser={currentUser}
          matchRequests={matchRequests}
          onAcceptRequest={onAcceptRequest}
          onDeclineRequest={onDeclineRequest}
          onCancelRequest={onCancelRequest}
        />
      )}
    </div>
  );
};

// ─── Page-level styles ────────────────────────────────────────────────────────

const pageHeroStyle: React.CSSProperties = {
  background: 'var(--gradient-brand)',
  borderRadius: 'var(--radius)',
  padding: '1.75rem 2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '1rem',
  boxShadow: '0 8px 30px var(--primary-glow)',
};

const pageHeroInnerStyle: React.CSSProperties = {
  flex: '1 1 auto',
};

const heroIconBoxStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  background: 'rgba(255, 255, 255, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(8px)',
};

const heroTitleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 800,
  color: 'white',
  letterSpacing: '-0.02em',
  margin: 0,
};

const heroSubtitleStyle: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.75)',
  fontSize: '0.875rem',
  marginTop: '0.25rem',
};

const searchBarWrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  borderRadius: '12px',
  padding: '0.6rem 1rem',
  minWidth: '240px',
  flex: '0 1 300px',
};

const searchInputStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  outline: 'none',
  color: 'white',
  fontSize: '0.875rem',
  flex: 1,
  minWidth: 0,
};

const resultCountStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 700,
  color: 'rgba(255,255,255,0.6)',
  background: 'rgba(255,255,255,0.15)',
  padding: '0.2rem 0.5rem',
  borderRadius: '20px',
  whiteSpace: 'nowrap',
};

const tabTrackStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  background: 'rgba(241, 245, 249, 0.6)',
  borderRadius: '12px',
  padding: '0.3rem',
  border: '1px solid var(--border)',
  width: 'fit-content',
};

const tabStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.5rem 1.25rem',
  fontSize: '0.875rem',
  fontWeight: isActive ? 700 : 500,
  color: isActive ? 'var(--foreground)' : 'var(--muted)',
  background: isActive ? 'white' : 'transparent',
  border: 'none',
  cursor: 'pointer',
  borderRadius: '9px',
  transition: 'var(--transition)',
  boxShadow: isActive ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
  whiteSpace: 'nowrap' as const,
});

const tabBadgeStyle: React.CSSProperties = {
  backgroundColor: 'var(--primary)',
  color: 'white',
  fontSize: '0.65rem',
  fontWeight: 700,
  borderRadius: '9999px',
  minWidth: '18px',
  height: '18px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 4px',
  boxShadow: '0 2px 5px var(--primary-glow)',
};
