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
import { Users, Search, Inbox, SlidersHorizontal, X } from 'lucide-react';


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
  const isProfileIncomplete = currentUser.role === 'student' && !(currentUser.isProfileComplete || currentUser.is_profile_complete);

  const [filterSleep, setFilterSleep] = useState('all');
  const [filterCleanliness, setFilterCleanliness] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterHostel, setFilterHostel] = useState('all');
  const [maxBudget, setMaxBudget] = useState(200000);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
    .map((u) => ({ ...u, score: calculateCompatibility(currentUser.preferences, u.preferences, currentUser.budget, u.budget) }))
    .sort((a, b) => b.score - a.score);

  const pendingReceivedCount = matchRequests.filter(
    (r) =>
      r.receiverId === currentUser.id &&
      r.status === 'pending' &&
      !(currentUser.blockedUsers ?? []).includes(r.senderId)
  ).length;

  const handleClearFilters = () => {
    setFilterSleep('all');
    setFilterCleanliness('all');
    setFilterGender('all');
    setFilterHostel('all');
    setMaxBudget(200000);
    setSearchQuery('');
  };

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
        .rm-input::placeholder { color: var(--color-neutral-500); }
        .rm-select option { background: var(--color-surface); color: var(--color-text); }
        .rm-card-hover:hover {
          box-shadow: var(--shadow-lg) !important;
          transform: translateY(-6px);
        }
        .rm-filter-toggle:hover { background: var(--color-accent-100) !important; }
        @media (max-width: 900px) {
          .rm-headline-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={headerStyle}>
        <div className="rm-header-wrap" style={headerInnerWrapStyle}>
          <div style={eyebrowStyle}>Roommate finder</div>

          <div className="rm-headline-grid" style={headlineGridStyle}>
          </div>

          <div className="rm-header-inner" style={headerInnerStyle}>
            {/* Tab bar */}
            <div className="rm-tab-bar" style={tabBarStyle}>
              <button
                onClick={() => handleTabChange('find')}
                className={activeTab === 'find' ? 'pill pill-active rm-tab-btn' : 'pill rm-tab-btn'}
              >
                <Users size={13} strokeWidth={2.75} />
                Browse · {candidates.length}
              </button>
              <button
                onClick={() => handleTabChange('requests')}
                className={activeTab === 'requests' ? 'pill pill-active rm-tab-btn' : 'pill rm-tab-btn'}
              >
                <Inbox size={13} strokeWidth={2.75} />
                Requests
                {pendingReceivedCount > 0 && (
                  <span style={tabPillStyle}>{pendingReceivedCount}</span>
                )}
              </button>
            </div>

            {/* Search */}
            <div className="rm-search-wrap" style={searchWrapStyle}>
              <Search size={15} strokeWidth={2.75} style={{ flexShrink: 0, color: 'var(--muted)' }} />
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
        </div>
      </div>

      {/* ── Body ── */}
      <div className="rm-body" style={bodyStyle}>
        {isProfileIncomplete && (
          <div style={warningBannerStyle}>
            <span>⚠️ <strong>Complete your profile:</strong> You must fill out all your personal details (under Basic & Personal Info) and lifestyle preferences (under Lifestyle and Habits) under the Profile tab in order to connect with other students.</span>
          </div>
        )}
        {activeTab === 'find' ? (
          <div className="rm-browse-layout" style={!showFilters ? { gridTemplateColumns: '1fr' } : undefined}>
            {/* Desktop sidebar — hidden on mobile via CSS */}
            {showFilters && (
              <div className="rm-filter-sidebar">
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
                  onHideFilters={() => {
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur();
                    }
                    setShowFilters(false);
                  }}
                  onClearFilters={handleClearFilters}
                />
              </div>
            )}

            {/* Main grid area */}
            <div className="rm-browse-main" style={{ flex: 1, minWidth: 0 }}>
              {/* Desktop: show filter toggle when sidebar collapsed */}
              {!showFilters && (
                <button
                  onClick={() => setShowFilters(true)}
                  className="btn btn-secondary rm-filter-toggle-desktop"
                  style={{
                    marginBottom: '0.875rem',
                    width: 'fit-content',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.875rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <SlidersHorizontal size={13} />
                  Show Filters
                </button>
              )}

              {/* Mobile: filter toggle bar always visible */}
              <button
                className="rm-mobile-filter-btn"
                onClick={() => setShowMobileFilters(true)}
                style={{
                  display: 'none', // shown via CSS at narrow breakpoint
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.625rem 1rem',
                  marginBottom: '0.875rem',
                  background: '#ebddc5',
                  border: '1px solid #dcd3c4',
                  borderRadius: '10px',
                  color: '#201e1d',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  justifyContent: 'center',
                }}
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>

              {/* Mobile filter overlay */}
              {showMobileFilters && (
                <div
                  style={{
                    position: 'fixed', inset: 0, zIndex: 200,
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'flex-end',
                  }}
                  onClick={(e) => { if (e.target === e.currentTarget) setShowMobileFilters(false); }}
                >
                  <div style={{
                    background: '#ebddc5',
                    borderRadius: '20px 20px 0 0',
                    padding: '1.25rem 1.25rem 2rem',
                    width: '100%',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#201e1d' }}>Filters</span>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#82796a' }}
                      >
                        <X size={18} />
                      </button>
                    </div>
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
                      onHideFilters={() => setShowMobileFilters(false)}
                      onClearFilters={handleClearFilters}
                    />
                  </div>
                </div>
              )}

              <RoommateGrid
                candidates={candidates}
                matchRequests={matchRequests}
                currentUserId={currentUser.id}
                onSelectCandidate={setSelectedUser}
                hideScores={isProfileIncomplete}
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
        hideScores={isProfileIncomplete}
      />
    </div>
  );
};

// ─── Organic theme ───────────────────────────────────────────────────────────

const pageWrapStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 76px)',
  background: 'var(--color-bg)',
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
  background: 'var(--color-bg)',
  padding: '0',
};

const headerInnerWrapStyle: React.CSSProperties = {
  maxWidth: '1240px',
  margin: '0 auto',
  padding: '2.5rem 2rem 0',
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--color-accent-700)',
  marginBottom: '22px',
  animation: 'ls-fade 0.7s ease both',
};

const headlineGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 0.8fr',
  gap: '56px',
  alignItems: 'end',
  marginBottom: '36px',
};

const headerInnerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '1rem',
  marginBottom: '0.5rem',
  animation: 'ls-fade 0.9s ease 0.25s both',
};

const searchWrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-divider)',
  borderRadius: 'var(--radius-pill)',
  padding: '0.5rem 1.125rem',
  // flex and minWidth intentionally omitted — controlled via .rm-search-wrap CSS class
};

const searchInputStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  outline: 'none',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.875rem',
  flex: 1,
  minWidth: 0,
};

const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: '6px',
  flexWrap: 'wrap',
};

const tabPillStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-accent-300)',
  color: 'var(--color-accent-900)',
  fontSize: '0.625rem',
  fontWeight: 800,
  letterSpacing: 0,
  borderRadius: 'var(--radius-pill)',
  minWidth: '18px',
  height: '18px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 5px',
};

const bodyStyle: React.CSSProperties = {
  flex: 1,
  maxWidth: '1240px',
  width: '100%',
  margin: '0 auto',
  padding: '1.75rem 2rem 3rem',
};

const warningBannerStyle: React.CSSProperties = {
  backgroundColor: 'var(--danger-bg)',
  borderRadius: 'var(--radius-lg)',
  padding: '1.125rem 1.5rem',
  color: 'var(--danger)',
  fontSize: '0.875rem',
  fontWeight: 600,
  marginBottom: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};
