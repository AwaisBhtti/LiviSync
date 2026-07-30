/**
 * RoommateFinder — orchestrates filters, grid, request panel, and modals.
 * State management lives here; rendering is delegated to sub-components.
 */
import { useState } from 'react';
import type { User, MatchRequest, Hostel } from '../types';
import { calculateCompatibility } from '../utils';
import { pageHeaderStyle } from '../styles/commonStyles';
import { RoommateFilters } from './roommate/RoommateFilters';
import { RoommateGrid } from './roommate/RoommateGrid';
import { RoommateModals } from './roommate/RoommateModals';
import { RoommateRequestsPanel } from './roommate/RoommateRequestsPanel';

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

      return matchesSleep && matchesClean && matchesGender && matchesBudget && matchesHostel;
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
      <div style={pageHeaderStyle}>
        <h1>Find Roommates</h1>
        <p style={{ color: 'var(--muted)' }}>
          Browse students, compare lifestyle compatibility scores, and start team ups.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => handleTabChange('find')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'find' ? '2px solid var(--primary)' : 'none',
            color: activeTab === 'find' ? 'var(--primary)' : 'var(--muted)',
            fontWeight: 600,
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.95rem',
          }}
        >
          Find Roommates
        </button>
        <button
          onClick={() => handleTabChange('requests')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'requests' ? '2px solid var(--primary)' : 'none',
            color: activeTab === 'requests' ? 'var(--primary)' : 'var(--muted)',
            fontWeight: 600,
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          My Requests
          {pendingReceivedCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white',
                fontSize: '0.7rem',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              {pendingReceivedCount}
            </span>
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
