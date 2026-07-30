import { useState } from 'react';
import type { User, MatchRequest, Hostel } from '../types';
import { calculateCompatibility } from '../utils';
import { SlidersHorizontal, MessageSquarePlus, ShieldAlert, X, Check, MapPin, UserCheck } from 'lucide-react';

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filterSleep, setFilterSleep] = useState<string>('all');
  const [filterCleanliness, setFilterCleanliness] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterHostel, setFilterHostel] = useState<string>('all');
  const [maxBudget, setMaxBudget] = useState<number>(200000);
  const [activeTab, setActiveTab] = useState<'find' | 'requests'>('find');
  
  // Connection and Report states
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [reqMessage, setReqMessage] = useState('Hey! Let\'s match up and search for rooms together!');
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<string>('fake-profile');
  const [reportDesc, setReportDesc] = useState('');

  // Filter & sort candidates
  const candidates = users
    .filter((u) => {
      // Don't show current user
      if (u.id === currentUser.id) return false;
      // Don't show admins
      if (u.role === 'admin') return false;
      // Don't show hostel owners
      if (u.role === 'owner') return false;
      // Don't show suspended users
      if (u.status === 'suspended') return false;
      // Don't show blocked users
      if (currentUser.blockedUsers?.includes(u.id)) return false;

      // Don't show already connected (accepted match) users
      const hasConnection = matchRequests.some(
        (r) => r.status === 'accepted' &&
               ((r.senderId === currentUser.id && r.receiverId === u.id) ||
                (r.senderId === u.id && r.receiverId === currentUser.id))
      );
      if (hasConnection) return false;

      // Apply Filters
      const matchesSleep = filterSleep === 'all' || u.preferences.sleepSchedule === filterSleep;
      const matchesClean = filterCleanliness === 'all' || u.preferences.cleanliness === filterCleanliness;
      const matchesGender = filterGender === 'all' || u.gender === filterGender;
      const matchesBudget = u.budget <= maxBudget;
      const matchesHostel = filterHostel === 'all' || u.hostelId === filterHostel;

      return matchesSleep && matchesClean && matchesGender && matchesBudget && matchesHostel;
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

  const handleSendRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    onSendRequest(selectedUser.id, reqMessage);
    setShowConnectModal(false);
    setSelectedUser(null);
    setReqMessage('Hey! Let\'s match up and search for rooms together!');
  };

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    // Validate report description is at least 8 words
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

  const renderPrefLabel = (key: string, val: string) => {
    return (
      <div style={prefTagStyle} key={key}>
        <span style={{ color: 'var(--muted)', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}:</span>
        <span style={{ fontWeight: 500 }}>{val}</span>
      </div>
    );
  };

  const sentRequests = matchRequests.filter(r => r.senderId === currentUser.id);
  const receivedRequests = matchRequests.filter(r => r.receiverId === currentUser.id && r.status === 'pending' && !currentUser.blockedUsers?.includes(r.senderId));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={headerStyle}>
        <h1>Find Roommates</h1>
        <p style={{ color: 'var(--muted)' }}>Browse students, compare lifestyle compatibility scores, and start team ups.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('find')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'find' ? '2px solid var(--primary)' : 'none',
            color: activeTab === 'find' ? 'var(--primary)' : 'var(--muted)',
            fontWeight: 600,
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          Find Roommates
        </button>
        <button
          onClick={() => setActiveTab('requests')}
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
            gap: '0.35rem'
          }}
        >
          My Requests 
          {receivedRequests.length > 0 && (
            <span style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              fontSize: '0.7rem',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {receivedRequests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'find' ? (
        <>
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
              min="20000"
              max="200000"
              step="5000"
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

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Current Hostel</label>
            <select className="form-select" value={filterHostel} onChange={(e) => setFilterHostel(e.target.value)}>
              <option value="all">Any Hostel</option>
              {hostels.map((hostel) => (
                <option key={hostel.id} value={hostel.id}>
                  {hostel.name}
                </option>
              ))}
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
                // Display Student or Job status
                const occupationDisplay = candidate.occupation === 'student' ? 'Student' : candidate.occupation === 'job' ? 'Job Holder' : 'Student';
                
                return (
                  <div
                    key={candidate.id}
                    className="card"
                    style={candidateCardStyle}
                    onClick={() => setSelectedUser(candidate)}
                  >
                    <div style={cardHeaderStyle}>
                      <img src={candidate.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80'} alt={candidate.name} style={avatarStyle} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {candidate.name}
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                          {candidate.age} y/o • {candidate.gender} • <span className="badge badge-neutral" style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>{occupationDisplay}</span>
                        </p>
                      </div>
                      <div style={scoreCircleStyle(candidate.score)}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{candidate.score}%</span>
                        <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', opacity: 0.8 }}>Match</span>
                      </div>
                    </div>

                    <p style={bioTextStyle}>{candidate.bio || "No biography provided."}</p>

                    <div style={cardFooterStyle}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <MapPin size={12} />
                        {candidate.location || "Islamabad"} • PKR {candidate.budget.toLocaleString()}/mo
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
      {selectedUser && !showConnectModal && !showReportModal && (
        <div style={modalOverlayStyle}>
          <div className="card" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3>Compatibility Profile</h3>
              <button style={closeBtnStyle} onClick={() => setSelectedUser(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={modalBodyStyle}>
              {/* Profile Card Summary */}
              <div style={profileSummaryCardStyle}>
                <img src={selectedUser.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80'} alt={selectedUser.name} style={modalAvatarStyle} />
                <div style={{ flex: 1 }}>
                  <h2>{selectedUser.name}</h2>
                  <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                    {selectedUser.age} years old • {selectedUser.gender} • {selectedUser.location || "Islamabad"}
                  </p>
                  
                  {/* Student vs Job specific details */}
                  {selectedUser.occupation === 'job' ? (
                    selectedUser.company && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--foreground)', marginTop: '0.25rem' }}>
                        💼 Working at: <strong>{selectedUser.company}</strong>
                      </p>
                    )
                  ) : (
                    selectedUser.institution && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--foreground)', marginTop: '0.25rem' }}>
                        🎓 Studying at: <strong>{selectedUser.institution}</strong>
                      </p>
                    )
                  )}
                  
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
                  {selectedUser.bio || "No bio added."}
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
                  {renderPrefLabel('noiseTolerance', selectedUser.preferences.noiseTolerance || 'moderate')}
                </div>
              </div>

              {/* Action Buttons */}
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
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={() => setShowConnectModal(true)}>
                      <MessageSquarePlus size={16} />
                      Connect
                    </button>
                    <button className="btn btn-danger" onClick={() => setShowReportModal(true)}>
                      <ShieldAlert size={16} />
                      Report
                    </button>
                    <button className="btn btn-secondary" onClick={() => { onBlockUser(selectedUser.id); setSelectedUser(null); }}>
                      Block
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect Popup Modal */}
      {showConnectModal && selectedUser && (
        <div style={modalOverlayStyle}>
          <form className="card" style={connectModalContentStyle} onSubmit={handleSendRequestSubmit}>
            <div style={modalHeaderStyle}>
              <h3>Connect with {selectedUser.name}</h3>
              <button type="button" style={closeBtnStyle} onClick={() => setShowConnectModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>
                You are sending a connection match request. You can add an optional friendly note below:
              </p>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={reqMessage}
                  onChange={(e) => setReqMessage(e.target.value)}
                  placeholder="Tell them a bit about yourself or why you want to connect..."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowConnectModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <UserCheck size={16} />
                  Send Request
                </button>
              </div>
            </div>
          </form>
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
                  placeholder="Provide details. Description must be at least 8 words long..."
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
      </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Received Requests column */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              Received Requests ({receivedRequests.length})
            </h3>
            {receivedRequests.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>No pending received requests.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {receivedRequests.map((req) => {
                  const sender = users.find(u => u.id === req.senderId);
                  if (!sender) return null;
                  return (
                    <div key={req.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <img src={sender.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80'} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{sender.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Budget: PKR {sender.budget.toLocaleString()}/mo</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--foreground)', margin: '0.5rem 0', fontStyle: 'italic' }}>
                        "{req.message}"
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => onAcceptRequest(req.id)}>
                          Accept
                        </button>
                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => onDeclineRequest(req.id)}>
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sent Requests column */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              Sent Requests ({sentRequests.length})
            </h3>
            {sentRequests.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>No sent requests.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sentRequests.map((req) => {
                  const receiver = users.find(u => u.id === req.receiverId);
                  if (!receiver) return null;
                  return (
                    <div key={req.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <img src={receiver.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80'} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{receiver.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Budget: PKR {receiver.budget.toLocaleString()}/mo</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--foreground)', margin: '0.5rem 0', fontStyle: 'italic' }}>
                        "{req.message}"
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: req.status === 'accepted' ? 'var(--success)' : req.status === 'declined' ? 'var(--danger)' : 'var(--muted)',
                          textTransform: 'uppercase'
                        }}>
                          Status: {req.status}
                        </span>
                        {req.status === 'pending' && (
                          <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => onCancelRequest(req.id)}>
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
  padding: '2.5rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const candidateCardStyle: React.CSSProperties = {
  padding: '1.5rem',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  background: 'var(--gradient-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  boxShadow: 'var(--shadow)',
  transition: 'var(--transition)',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
};

const avatarStyle: React.CSSProperties = {
  width: '52px',
  height: '52px',
  borderRadius: '50%',
  objectFit: 'cover',
  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.1)',
  border: '2px solid white',
};

const scoreCircleStyle = (score: number): React.CSSProperties => {
  const isHigh = score >= 80;
  const isMid = score >= 50;
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    border: `3px solid ${isHigh ? 'var(--success)' : isMid ? '#fbbf24' : 'var(--border)'}`,
    color: isHigh ? 'var(--success)' : isMid ? '#d97706' : 'var(--muted)',
    backgroundColor: isHigh ? 'var(--success-bg)' : isMid ? '#fffbeb' : 'var(--muted-bg)',
    fontWeight: 700,
    fontSize: '0.9rem',
    boxShadow: isHigh ? '0 0 12px rgba(16, 185, 129, 0.1)' : isMid ? '0 0 12px rgba(251, 191, 36, 0.1)' : 'none',
  };
};

const bioTextStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--muted)',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  lineHeight: '1.5',
};

const cardFooterStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '0.5rem',
  borderTop: '1px solid var(--border)',
  paddingTop: '1rem',
};

// Modal styles
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.4)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '1rem',
};

const modalContentStyle: React.CSSProperties = {
  maxWidth: '600px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: 'var(--shadow-lg)',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
  background: 'var(--gradient-card)',
  backdropFilter: 'blur(16px)',
};

const connectModalContentStyle: React.CSSProperties = {
  maxWidth: '450px',
  width: '100%',
  boxShadow: 'var(--shadow-lg)',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
  background: 'var(--gradient-card)',
  backdropFilter: 'blur(16px)',
};

const reportModalContentStyle: React.CSSProperties = {
  maxWidth: '450px',
  width: '100%',
  boxShadow: 'var(--shadow-lg)',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
  background: 'var(--gradient-card)',
  backdropFilter: 'blur(16px)',
};

const modalHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1.5rem 1.75rem',
  borderBottom: '1px solid var(--border)',
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--muted)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'var(--transition)',
};

const modalBodyStyle: React.CSSProperties = {
  padding: '1.75rem',
};

const profileSummaryCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.25rem',
  backgroundColor: 'rgba(248, 250, 252, 0.6)',
  border: '1px solid var(--border)',
  padding: '1.25rem',
  borderRadius: 'var(--radius-sm)',
};

const modalAvatarStyle: React.CSSProperties = {
  width: '72px',
  height: '72px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid white',
  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.1)',
};

const modalScoreStyle = (score: number): React.CSSProperties => {
  const isHigh = score >= 80;
  const isMid = score >= 50;
  return {
    textAlign: 'center',
    padding: '0.625rem 1.25rem',
    borderRadius: 'var(--radius-sm)',
    border: `1px solid ${isHigh ? 'var(--success)' : isMid ? '#fbbf24' : 'var(--border)'}`,
    color: isHigh ? 'var(--success)' : isMid ? '#d97706' : 'var(--muted)',
    backgroundColor: isHigh ? 'var(--success-bg)' : isMid ? '#fffbeb' : 'var(--muted-bg)',
    fontWeight: 700,
  };
};

const prefGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '0.875rem',
  marginTop: '0.5rem',
};

const prefTagStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0.625rem 1rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: '0.85rem',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
};

const alertSuccessStyle: React.CSSProperties = {
  backgroundColor: 'var(--success-bg)',
  color: 'var(--success)',
  padding: '1rem 1.25rem',
  borderRadius: 'var(--radius-sm)',
  fontSize: '0.875rem',
  fontWeight: 600,
  border: '1px solid rgba(16, 185, 129, 0.2)',
};

const alertPendingStyle: React.CSSProperties = {
  backgroundColor: '#fffbeb',
  color: '#d97706',
  padding: '1rem 1.25rem',
  borderRadius: 'var(--radius-sm)',
  fontSize: '0.875rem',
  fontWeight: 600,
  border: '1px solid rgba(251, 191, 36, 0.2)',
};
