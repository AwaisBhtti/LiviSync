/**
 * RoommateFinder — orchestrates filters, grid, request panel, and modals.
 * Full dark navy theme scoped to this page only.
 */
import { useState } from 'react';
import type { User, MatchRequest, Hostel } from '../types';
import { calculateCompatibility } from '../utils';
import { RoommateFilters } from './roommate/RoommateFilters';
import { RoommateGrid } from './roommate/RoommateGrid';
import { RoommateModals } from './roommate/RoommateModals';
import { RoommateRequestsPanel } from './roommate/RoommateRequestsPanel';
import { Users, Search, ChevronLeft, Inbox } from 'lucide-react';

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
  const [filterSleep, setFilterSleep] = useState('all');
  const [filterCleanliness, setFilterCleanliness] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterHostel, setFilterHostel] = useState('all');
  const [maxBudget, setMaxBudget] = useState(200000);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  const [activeTab, setActiveTab] = useState<'find' | 'requests'>(() => {
    return (sessionStorage.getItem('livisync_roommate_tab') as 'find' | 'requests') || 'find';
  });

  const handleTabChange = (tab: 'find' | 'requests') => {
    setActiveTab(tab);
    sessionStorage.setItem('livisync_roommate_tab', tab);
  };

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [reqMessage, setReqMessage] = useState("Hey! Let's match up and search for rooms together!");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('fake-profile');
  const [reportDesc, setReportDesc] = useState('');

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

  const pendingReceivedCount = matchRequests.filter(
    (r) =>
      r.receiverId === currentUser.id &&
      r.status === 'pending' &&
      !(currentUser.blockedUsers ?? []).includes(r.senderId)
  ).length;

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
    <div style={pageWrapStyle}>
      <style>{`
        .rm-input::placeholder { color: rgba(148,163,184,0.6); }
        .rm-select option { background: #1e293b; color: #e2e8f0; }
        .rm-card-hover:hover {
          border-color: rgba(99,102,241,0.5) !important;
          box-shadow: 0 8px 32px rgba(99,102,241,0.2) !important;
          transform: translateY(-2px);
        }
        .rm-filter-toggle:hover { background: rgba(99,102,241,0.2) !important; }
        .rm-tab-btn:hover { color: rgba(255,255,255,0.9) !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={headerStyle}>
        <div style={headerInnerWrapStyle}>
          <div style={headerInnerStyle}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                <div style={iconBoxStyle}>
                  <Users size={16} color="white" strokeWidth={2.5} />
                </div>
                <h1 style={pageTitleStyle}>Find Roommates</h1>
              </div>
              <p style={pageSubtitleStyle}>
                {candidates.length} compatible students · sorted by lifestyle match
              </p>
            </div>

            {/* Search */}
            <div style={searchWrapStyle}>
              <Search size={15} color="rgba(148,163,184,0.7)" style={{ flexShrink: 0 }} />
              <input
                className="rm-input"
                type="text"
                placeholder="Search by name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={searchInputStyle}
              />
            </div>
          </div>

          {/* Tab bar */}
          <div style={tabBarStyle}>
          <button
            onClick={() => handleTabChange('find')}
            className="rm-tab-btn"
            style={tabBtnStyle(activeTab === 'find')}
          >
            <Users size={14} />
            Browse
          </button>
          <button
            onClick={() => handleTabChange('requests')}
            className="rm-tab-btn"
            style={tabBtnStyle(activeTab === 'requests')}
          >
            <Inbox size={14} />
            Requests
            {pendingReceivedCount > 0 && (
              <span style={tabPillStyle}>{pendingReceivedCount}</span>
            )}
          </button>
        </div>
      </div>
    </div>

      {/* ── Body ── */}
      <div style={bodyStyle}>
        {activeTab === 'find' ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {/* Sidebar */}
            {showFilters && (
              <div style={{ width: '220px', flexShrink: 0 }}>
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
              </div>
            )}

            {/* Main grid area */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters((v) => !v)}
                className="rm-filter-toggle"
                style={filterToggleStyle}
              >
                <ChevronLeft
                  size={13}
                  style={{
                    transition: 'transform 0.25s',
                    transform: showFilters ? 'rotate(0deg)' : 'rotate(180deg)',
                  }}
                />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>

              <RoommateGrid
                candidates={candidates}
                matchRequests={matchRequests}
                currentUserId={currentUser.id}
                onSelectCandidate={setSelectedUser}
              />
            </div>
          </div>
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
    </div>
  );
};

// ─── Dark-navy page theme ─────────────────────────────────────────────────────

const DARK_BG   = '#0f172a';   // Slate 900
const DARK_CARD = 'rgba(15, 23, 42, 0.75)';
const DARK_SURFACE = 'rgba(30, 41, 59, 0.7)';  // Slate 800 tinted
const DARK_BORDER = 'rgba(255,255,255,0.08)';
const DARK_TEXT = '#f1f5f9';    // Slate 100
const DARK_MUTED = '#94a3b8';   // Slate 400

const pageWrapStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 64px)',
  background: `linear-gradient(160deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)`,
  backgroundAttachment: 'fixed',
  /* Full-bleed escape from centered max-width container */
  width: '100vw',
  marginLeft: 'calc(-50vw + 50%)',
  marginTop: '-2.5rem',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  overflowX: 'hidden',
};

const headerStyle: React.CSSProperties = {
  background: 'rgba(15,23,42,0.9)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  padding: '0',
};

const headerInnerWrapStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '1.5rem 2rem 0',
};

const headerInnerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '1rem',
  marginBottom: '1.25rem',
};

const iconBoxStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '8px',
  background: 'var(--gradient-brand)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
};

const pageTitleStyle: React.CSSProperties = {
  fontSize: '1.35rem',
  fontWeight: 800,
  color: DARK_TEXT,
  letterSpacing: '-0.03em',
};

const pageSubtitleStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: DARK_MUTED,
  marginLeft: '36px',
};

const searchWrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: DARK_SURFACE,
  border: `1px solid ${DARK_BORDER}`,
  borderRadius: '10px',
  padding: '0.5rem 0.875rem',
  minWidth: '220px',
  flex: '0 1 260px',
};

const searchInputStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  outline: 'none',
  color: DARK_TEXT,
  fontSize: '0.85rem',
  flex: 1,
};

const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0',
  borderTop: '1px solid rgba(255,255,255,0.05)',
  marginTop: '0.5rem',
};

const tabBtnStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.75rem 1.25rem',
  fontSize: '0.85rem',
  fontWeight: isActive ? 700 : 500,
  color: isActive ? '#ffffff' : DARK_MUTED,
  background: 'none',
  border: 'none',
  borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
  cursor: 'pointer',
  transition: 'var(--transition)',
  whiteSpace: 'nowrap' as const,
});

const tabPillStyle: React.CSSProperties = {
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
};

const bodyStyle: React.CSSProperties = {
  flex: 1,
  maxWidth: '1200px',
  width: '100%',
  margin: '0 auto',
  padding: '1.5rem 2rem',
};

const filterToggleStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
  marginBottom: '0.875rem',
  padding: '0.3rem 0.7rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: DARK_MUTED,
  background: DARK_SURFACE,
  border: `1px solid ${DARK_BORDER}`,
  borderRadius: '9999px',
  cursor: 'pointer',
  transition: 'var(--transition)',
};
