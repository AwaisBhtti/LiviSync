import { useState } from 'react';
import type { User, MatchRequest } from '../types';
import { calculateCompatibility } from '../utils';
import { SlidersHorizontal, MessageSquarePlus, ShieldAlert, X, Check, MapPin } from 'lucide-react';

interface RoommateFinderProps {
  currentUser: User;
  users: User[];
  matchRequests: MatchRequest[];
  onSendRequest: (receiverId: string, message: string) => void;
  onBlockUser: (targetId: string) => void;
  onReportUser: (targetId: string, reason: string, description: string) => void;
}

export const RoommateFinder = ({
  currentUser,
  users,
  matchRequests,
  onSendRequest,
  onBlockUser,
  onReportUser,
}: RoommateFinderProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filterSleep, setFilterSleep] = useState<string>('all');
  const [filterCleanliness, setFilterCleanliness] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [maxBudget, setMaxBudget] = useState<number>(30000);
  const [reqMessage, setReqMessage] = useState('Hey! Let\'s match up and search for rooms together!');
  const [reportReason, setReportReason] = useState<string>('fake-profile');
  const [reportDesc, setReportDesc] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  // Filter & sort candidates
  const candidates = users
    .filter((u) => {
      // Don't show current user
      if (u.id === currentUser.id) return false;
      // Don't show admins
      if (u.role === 'admin') return false;
      // Don't show suspended users
      if (u.status === 'suspended') return false;
      // Don't show blocked users
      if (currentUser.blockedUsers.includes(u.id)) return false;

      // Apply Filters
      const matchesSleep = filterSleep === 'all' || u.preferences.sleepSchedule === filterSleep;
      const matchesClean = filterCleanliness === 'all' || u.preferences.cleanliness === filterCleanliness;
      const matchesGender = filterGender === 'all' || u.gender === filterGender;
      const matchesBudget = u.budget <= maxBudget;

      return matchesSleep && matchesClean && matchesGender && matchesBudget;
    })
    .map((u) => ({
      ...u,
      score: calculateCompatibility(currentUser.preferences, u.preferences),
    }))
    // Sort by compatibility score in descending order
    .sort((a, b) => b.score - a.score);

  const getRequestStatus = (userId: string) => {
    const req = matchRequests.find(
      (r) =>
        (r.senderId === currentUser.id && r.receiverId === userId) ||
        (r.senderId === userId && r.receiverId === currentUser.id)
    );
    return req ? req.status : null;
  };

  const handleSendRequest = () => {
    if (!selectedUser) return;
    onSendRequest(selectedUser.id, reqMessage);
    setSelectedUser(null);
    setReqMessage('Hey! Let\'s match up and search for rooms together!');
  };

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    onReportUser(selectedUser.id, reportReason, reportDesc);
    setShowReportModal(false);
    setSelectedUser(null);
    setReportDesc('');
  };

  const renderPrefLabel = (key: string, val: string) => {
    return (
      <div style={prefTagStyle}>
        <span style={{ color: 'var(--muted)', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}:</span>
        <span style={{ fontWeight: 500 }}>{val}</span>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={headerStyle}>
        <h1>Find Roommates</h1>
        <p style={{ color: 'var(--muted)' }}>Browse students, compare lifestyle compatibility scores, and start team ups.</p>
      </div>

      <div className="split-layout">
        {/* Filter Bar */}
        <div className="card" style={{ padding: '1.25rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '0.95rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={14} />
            Filters
          </h3>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Max Roommate Budget: {maxBudget.toLocaleString()}</label>
            <input
              type="range"
              min="10000"
              max="30000"
              step="1000"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Gender</label>
            <select className="form-select" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
              <option value="all">Any Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Sleep Schedule</label>
            <select className="form-select" value={filterSleep} onChange={(e) => setFilterSleep(e.target.value)}>
              <option value="all">Any Sleep Cycle</option>
              <option value="early-bird">Early Bird</option>
              <option value="night-owl">Night Owl</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Cleanliness</label>
            <select className="form-select" value={filterCleanliness} onChange={(e) => setFilterCleanliness(e.target.value)}>
              <option value="all">Any Cleanliness</option>
              <option value="meticulous">Meticulous</option>
              <option value="moderate">Moderate</option>
              <option value="relaxed">Relaxed</option>
            </select>
          </div>
        </div>

        {/* Roommates Grid */}
        <div>
          {candidates.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
              No potential roommates match your filter criteria.
            </div>
          ) : (
            <div className="grid-2">
              {candidates.map((candidate) => {
                const reqStatus = getRequestStatus(candidate.id);
                return (
                  <div
                    key={candidate.id}
                    className="card"
                    style={candidateCardStyle}
                    onClick={() => setSelectedUser(candidate)}
                  >
                    <div style={cardHeaderStyle}>
                      <img src={candidate.photo} alt={candidate.name} style={avatarStyle} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {candidate.name}
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                          {candidate.age} y/o • {candidate.gender}
                        </p>
                      </div>
                      <div style={scoreCircleStyle(candidate.score)}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{candidate.score}%</span>
                        <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', opacity: 0.8 }}>Match</span>
                      </div>
                    </div>

                    <p style={bioTextStyle}>{candidate.bio}</p>

                    <div style={cardFooterStyle}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <MapPin size={12} />
                        {candidate.location} • PKR {candidate.budget.toLocaleString()}/mo
                      </span>

                      {reqStatus === 'accepted' && (
                        <span style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Check size={12} />
                          Matched
                        </span>
                      )}
                      {reqStatus === 'pending' && (
                        <span style={{ color: '#d97706', fontSize: '0.75rem', fontWeight: 500 }}>
                          Pending
                        </span>
                      )}
                      {!reqStatus && (
                        <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 500 }}>
                          View Details →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal Overlay */}
      {selectedUser && (
        <div style={modalOverlayStyle}>
          <div className="card" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3>Roommate Compatibility Profile</h3>
              <button style={closeBtnStyle} onClick={() => setSelectedUser(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={modalBodyStyle}>
              {/* Profile Card Summary */}
              <div style={profileSummaryCardStyle}>
                <img src={selectedUser.photo} alt={selectedUser.name} style={modalAvatarStyle} />
                <div style={{ flex: 1 }}>
                  <h2>{selectedUser.name}</h2>
                  <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                    {selectedUser.age} years old • {selectedUser.gender} • {selectedUser.location}
                  </p>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Max Budget: PKR {selectedUser.budget.toLocaleString()}/mo
                  </p>
                </div>
                <div style={modalScoreStyle(calculateCompatibility(currentUser.preferences, selectedUser.preferences))}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                    {calculateCompatibility(currentUser.preferences, selectedUser.preferences)}%
                  </h3>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>Compatibility</span>
                </div>
              </div>

              {/* Bio & Preferences */}
              <div style={{ marginTop: '1.5rem' }}>
                <h4>About</h4>
                <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem', lineHeight: '1.5' }}>
                  {selectedUser.bio}
                </p>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <h4>Habits & Routine</h4>
                <div style={prefGridStyle}>
                  {renderPrefLabel('sleepSchedule', selectedUser.preferences.sleepSchedule)}
                  {renderPrefLabel('cleanliness', selectedUser.preferences.cleanliness)}
                  {renderPrefLabel('smoking', selectedUser.preferences.smoking)}
                  {renderPrefLabel('pets', selectedUser.preferences.pets)}
                  {renderPrefLabel('guestTolerance', selectedUser.preferences.guestTolerance)}
                </div>
              </div>

              {/* Request Messaging System */}
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                {getRequestStatus(selectedUser.id) === 'accepted' ? (
                  <div style={alertSuccessStyle}>
                    You and {selectedUser.name} are matched roommates. Go to the Inbox tab to chat!
                  </div>
                ) : getRequestStatus(selectedUser.id) === 'pending' ? (
                  <div style={alertPendingStyle}>
                    Your match request is currently pending review by {selectedUser.name}.
                  </div>
                ) : (
                  <div>
                    <h4 style={{ marginBottom: '0.5rem' }}>Send Match Request</h4>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      value={reqMessage}
                      onChange={(e) => setReqMessage(e.target.value)}
                      placeholder="Add a friendly greeting..."
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button className="btn btn-primary" onClick={handleSendRequest}>
                        <MessageSquarePlus size={16} />
                        Request Match
                      </button>
                      <button className="btn btn-danger" onClick={() => setShowReportModal(true)}>
                        <ShieldAlert size={16} />
                        Report User
                      </button>
                      <button className="btn btn-secondary" onClick={() => { onBlockUser(selectedUser.id); setSelectedUser(null); }}>
                        Block User
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && selectedUser && (
        <div style={modalOverlayStyle}>
          <form className="card" style={reportModalContentStyle} onSubmit={handleReport}>
            <div style={modalHeaderStyle}>
              <h3>Report {selectedUser.name}</h3>
              <button type="button" style={closeBtnStyle} onClick={() => setShowReportModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <select className="form-select" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                  <option value="fake-profile">Fake Profile</option>
                  <option value="harassment">Harassment</option>
                  <option value="spam">Spam / Advertising</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Details</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  required
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Provide details about why you are reporting this user..."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Report
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Styles
const headerStyle: React.CSSProperties = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const candidateCardStyle: React.CSSProperties = {
  padding: '1.25rem',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const avatarStyle: React.CSSProperties = {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  objectFit: 'cover',
};

const scoreCircleStyle = (score: number): React.CSSProperties => {
  const isHigh = score >= 80;
  const isMid = score >= 50;
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: `2px solid ${isHigh ? 'var(--success)' : isMid ? '#fef3c7' : 'var(--border)'}`,
    color: isHigh ? 'var(--success)' : isMid ? '#d97706' : 'var(--muted)',
    backgroundColor: isHigh ? 'var(--success-bg)' : isMid ? '#fffbeb' : 'var(--muted-bg)',
  };
};

const bioTextStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--muted)',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  lineHeight: '1.45',
};

const cardFooterStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '0.5rem',
  borderTop: '1px solid var(--border)',
  paddingTop: '0.75rem',
};

// Modal styles
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1rem',
};

const modalContentStyle: React.CSSProperties = {
  maxWidth: '600px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
};

const reportModalContentStyle: React.CSSProperties = {
  maxWidth: '450px',
  width: '100%',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
};

const modalHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1.25rem 1.5rem',
  borderBottom: '1px solid var(--border)',
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--muted)',
};

const modalBodyStyle: React.CSSProperties = {
  padding: '1.5rem',
};

const profileSummaryCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  backgroundColor: 'var(--background)',
  border: '1px solid var(--border)',
  padding: '1rem',
  borderRadius: 'var(--radius)',
};

const modalAvatarStyle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  objectFit: 'cover',
};

const modalScoreStyle = (score: number): React.CSSProperties => {
  const isHigh = score >= 80;
  const isMid = score >= 50;
  return {
    textAlign: 'center',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius)',
    border: `1px solid ${isHigh ? 'var(--success)' : isMid ? '#fbbf24' : 'var(--border)'}`,
    color: isHigh ? 'var(--success)' : isMid ? '#d97706' : 'var(--muted)',
    backgroundColor: isHigh ? 'var(--success-bg)' : isMid ? '#fffbeb' : 'var(--muted-bg)',
  };
};

const prefGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '0.75rem',
  marginTop: '0.5rem',
};

const prefTagStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  fontSize: '0.8rem',
  backgroundColor: 'var(--background)',
};

const alertSuccessStyle: React.CSSProperties = {
  backgroundColor: 'var(--success-bg)',
  color: 'var(--success)',
  padding: '0.875rem 1rem',
  borderRadius: 'var(--radius)',
  fontSize: '0.85rem',
  fontWeight: 500,
  border: '1px solid rgba(16, 185, 129, 0.2)',
};

const alertPendingStyle: React.CSSProperties = {
  backgroundColor: '#fffbeb',
  color: '#d97706',
  padding: '0.875rem 1rem',
  borderRadius: 'var(--radius)',
  fontSize: '0.85rem',
  fontWeight: 500,
  border: '1px solid rgba(217, 119, 6, 0.2)',
};
