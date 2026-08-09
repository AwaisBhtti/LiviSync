/**
 * RoommateModals — Detail Profile modal, Connect modal, and Report modal
 * for the Roommate Finder.
 */
import type { User, MatchRequest } from '../../types';
import { calculateCompatibility } from '../../utils';
import { X, MessageSquarePlus, ShieldAlert, UserCheck } from 'lucide-react';
import { DEFAULT_AVATAR } from '../../styles/commonStyles';
import { CustomSelect } from '../ui/CustomSelect';

interface RoommateModalsProps {
  selectedUser: User | null;
  currentUser: User;
  matchRequests: MatchRequest[];
  showConnectModal: boolean;
  showReportModal: boolean;
  reqMessage: string;
  reportReason: string;
  reportDesc: string;
  onCloseDetail: () => void;
  onOpenConnect: () => void;
  onCloseConnect: () => void;
  onOpenReport: () => void;
  onCloseReport: () => void;
  onBlockUser: (targetId: string) => void;
  onReqMessageChange: (val: string) => void;
  onReportReasonChange: (val: string) => void;
  onReportDescChange: (val: string) => void;
  onSubmitConnect: (e: React.FormEvent) => void;
  onSubmitReport: (e: React.FormEvent) => void;
  hideScores?: boolean;
}

const modalOverlay: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(32, 30, 29, 0.6)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '1rem',
};

const modalHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1.25rem 1.5rem',
  borderBottom: '1px solid var(--border)',
};

const closeBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--muted)',
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

const scoreStyle = (score: number): React.CSSProperties => {
  const isHigh = score >= 80;
  const isMid = score >= 50;
  return {
    textAlign: 'center',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius)',
    border: `1px solid ${isHigh ? 'var(--success)' : isMid ? '#f6a06b' : 'var(--border)'}`,
    color: isHigh ? 'var(--success)' : isMid ? '#8c491a' : 'var(--muted)',
    backgroundColor: isHigh ? 'var(--success-bg)' : isMid ? '#fff2eb' : 'var(--muted-bg)',
  };
};

export const RoommateModals = ({
  selectedUser,
  currentUser,
  matchRequests,
  showConnectModal,
  showReportModal,
  reqMessage,
  reportReason,
  reportDesc,
  onCloseDetail,
  onOpenConnect,
  onCloseConnect,
  onOpenReport,
  onCloseReport,
  onBlockUser,
  onReqMessageChange,
  onReportReasonChange,
  onReportDescChange,
  onSubmitConnect,
  onSubmitReport,
  hideScores = false,
}: RoommateModalsProps) => {
  if (!selectedUser) return null;

  const score = calculateCompatibility(currentUser.preferences, selectedUser.preferences, currentUser.budget, selectedUser.budget);

  const getRequestStatus = () => {
    const req = matchRequests.find(
      (r) =>
        (r.senderId === currentUser.id && r.receiverId === selectedUser.id) ||
        (r.senderId === selectedUser.id && r.receiverId === currentUser.id)
    );
    return req ? req.status : null;
  };
  const reqStatus = getRequestStatus();

  return (
    <>
      {/* Detail Profile Modal */}
      {!showConnectModal && !showReportModal && (
        <div style={modalOverlay}>
          <div
            className="card"
            style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
          >
            <div style={modalHeader}>
              <h3>Compatibility Profile</h3>
              <button style={closeBtn} onClick={onCloseDetail}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {/* Summary card */}
              <div className="compatibility-summary">
                <img
                  src={selectedUser.photo || DEFAULT_AVATAR}
                  alt={selectedUser.name}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <h2>{selectedUser.name}</h2>
                  <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                    {selectedUser.age} years old • {selectedUser.gender} •{' '}
                    {selectedUser.location || 'Islamabad'}
                  </p>
                  {selectedUser.occupation === 'job'
                    ? selectedUser.company && (
                        <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                          💼 Working at: <strong>{selectedUser.company}</strong>
                        </p>
                      )
                    : selectedUser.institution && (
                        <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                          🎓 Studying at: <strong>{selectedUser.institution}</strong>
                        </p>
                      )}
                </div>
                {!hideScores && (
                  <div style={scoreStyle(score)}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{score}%</h3>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>
                      Compatibility
                    </span>
                  </div>
                )}
              </div>

              {/* About */}
              <div style={{ marginTop: '1.5rem' }}>
                <h4>About</h4>
                <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem', lineHeight: '1.5' }}>
                  {selectedUser.bio || 'No bio added.'}
                </p>
              </div>

              {/* Habits */}
              <div style={{ marginTop: '1.5rem' }}>
                <h4>Habits &amp; Routine</h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '0.75rem',
                    marginTop: '0.5rem',
                  }}
                >
                  {Object.entries({
                    sleepSchedule: selectedUser.preferences?.sleepSchedule ?? 'flexible',
                    cleanliness: selectedUser.preferences?.cleanliness ?? 'moderate',
                    smoking: selectedUser.preferences?.smoking ?? 'no',
                    pets: selectedUser.preferences?.pets ?? 'no',
                    guestTolerance: selectedUser.preferences?.guestTolerance ?? 'weekends',
                    noiseTolerance: selectedUser.preferences?.noiseTolerance ?? 'moderate',
                  }).map(([key, val]) => (
                    <div style={prefTagStyle} key={key}>
                      <span style={{ color: 'var(--muted)', textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1')}:
                      </span>
                      <span style={{ fontWeight: 500 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  marginTop: '2rem',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '1.5rem',
                }}
              >
                {reqStatus === 'accepted' ? (
                  <div
                    style={{
                      backgroundColor: 'var(--success-bg)',
                      color: 'var(--success)',
                      padding: '0.875rem 1rem',
                      borderRadius: 'var(--radius)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      border: '1px solid rgba(114, 129, 87, 0.2)',
                    }}
                  >
                    You and {selectedUser.name} are matched roommates. Go to the Inbox tab to chat!
                  </div>
                ) : reqStatus === 'pending' ? (
                  <div
                    style={{
                      backgroundColor: '#fff2eb',
                      color: '#8c491a',
                      padding: '0.875rem 1rem',
                      borderRadius: 'var(--radius)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      border: '1px solid rgba(140, 73, 26, 0.2)',
                    }}
                  >
                    Your match request is currently pending review by {selectedUser.name}.
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={onOpenConnect}>
                      <MessageSquarePlus size={16} /> Connect
                    </button>
                    <button className="btn btn-danger" onClick={onOpenReport}>
                      <ShieldAlert size={16} /> Report
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        onBlockUser(selectedUser.id);
                        onCloseDetail();
                      }}
                    >
                      Block
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect Modal */}
      {showConnectModal && (
        <div style={modalOverlay}>
          <form
            className="card"
            style={{ maxWidth: '450px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
            onSubmit={onSubmitConnect}
          >
            <div style={modalHeader}>
              <h3>Connect with {selectedUser.name}</h3>
              <button type="button" style={closeBtn} onClick={onCloseConnect}>
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
                  onChange={(e) => onReqMessageChange(e.target.value)}
                  placeholder="Tell them a bit about yourself or why you want to connect..."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onCloseConnect}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <UserCheck size={16} /> Send Request
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div style={modalOverlay}>
          <form
            className="card"
            style={{ maxWidth: '450px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
            onSubmit={onSubmitReport}
          >
            <div style={modalHeader}>
              <h3>Report {selectedUser.name}</h3>
              <button type="button" style={closeBtn} onClick={onCloseReport}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <CustomSelect
                  value={reportReason}
                  onChange={onReportReasonChange}
                  options={[
                    { value: 'fake-profile', label: 'Fake Profile' },
                    { value: 'harassment', label: 'Harassment' },
                    { value: 'spam', label: 'Spam / Advertising' },
                    { value: 'other', label: 'Other' }
                  ]}
                  style={{ background: '#f5ead8', border: '1px solid #dcd3c4', color: '#201e1d' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Details</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  required
                  value={reportDesc}
                  onChange={(e) => onReportDescChange(e.target.value)}
                  placeholder="Provide details. Description must be at least 8 words long..."
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem',
                  marginTop: '1.5rem',
                }}
              >
                <button type="button" className="btn btn-secondary" onClick={onCloseReport}>
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
  );
};
