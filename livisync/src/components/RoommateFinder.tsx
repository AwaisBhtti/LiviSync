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
        .rm-input::placeholder { color: #8c7b70; }
        .rm-select option { background: #f0ece6; color: #332721; }
        .rm-card-hover:hover {
          border-color: #b55c3c !important;
          box-shadow: 0 8px 32px rgba(181, 92, 60, 0.1) !important;
          transform: translateY(-2px);
        }
        .rm-filter-toggle:hover { background: #e8e3da !important; }
        .rm-tab-btn:hover { color: #b55c3c !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={headerStyle}>
        <div className="rm-header-wrap" style={headerInnerWrapStyle}>
          <div className="rm-header-inner" style={headerInnerStyle}>
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
            <div className="rm-search-wrap" style={searchWrapStyle}>
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
          <div className="rm-tab-bar" style={tabBarStyle}>
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
                  background: '#f0ece6',
                  border: '1px solid #e0d6cb',
                  borderRadius: '10px',
                  color: '#332721',
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
                    background: '#f0ece6',
                    borderRadius: '20px 20px 0 0',
                    padding: '1.25rem 1.25rem 2rem',
                    width: '100%',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#332721' }}>Filters</span>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#8c7b70' }}
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

// ─── Warm Sand & Cashmere Theme ──────────────────────────────────────────────

const pageWrapStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 64px)',
  background: '#faf8f5', // Warm sand background
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
  background: '#f0ece6', // Linen beige header
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: '1px solid #e0d6cb',
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
  background: '#b55c3c', // Muted terracotta rose
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(181, 92, 60, 0.2)',
};

const pageTitleStyle: React.CSSProperties = {
  fontSize: '1.35rem',
  fontWeight: 800,
  color: '#332721', // Espresso brown text
  letterSpacing: '-0.03em',
};

const pageSubtitleStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#8c7b70', // Warm beige
  marginLeft: '36px',
};

const searchWrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: '#faf8f5',
  border: '1px solid #e0d6cb',
  borderRadius: '10px',
  padding: '0.5rem 0.875rem',
  // flex and minWidth intentionally omitted — controlled via .rm-search-wrap CSS class
};

const searchInputStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  outline: 'none',
  color: '#332721',
  fontSize: '0.85rem',
  flex: 1,
};

const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0',
  borderTop: '1px solid #e0d6cb',
  marginTop: '0.5rem',
};

const tabBtnStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.75rem 1.25rem',
  fontSize: '0.85rem',
  fontWeight: isActive ? 700 : 500,
  color: isActive ? '#b55c3c' : '#8c7b70',
  background: 'none',
  border: 'none',
  borderBottom: isActive ? '2.5px solid #b55c3c' : '2.5px solid transparent',
  cursor: 'pointer',
  transition: 'var(--transition)',
  whiteSpace: 'nowrap' as const,
});

const tabPillStyle: React.CSSProperties = {
  backgroundColor: '#b55c3c',
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

const warningBannerStyle: React.CSSProperties = {
  backgroundColor: 'var(--danger-bg)',
  border: '1px solid var(--danger-glow)',
  borderRadius: '12px',
  padding: '1rem 1.25rem',
  color: 'var(--danger)',
  fontSize: '0.875rem',
  fontWeight: 600,
  marginBottom: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};
