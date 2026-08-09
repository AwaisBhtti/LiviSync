import { useState } from 'react';
import type { User, MatchRequest } from '../../types';
import { ConfirmationModal } from '../ConfirmationModal';
import { showToast } from '../../store/slices/toastSlice';
import { useAppDispatch } from '../../store/store';
import { CustomSelect } from '../ui/CustomSelect';
import { X } from 'lucide-react';

interface FriendProfileModalProps {
  selectedUser: User;
  currentUser: User;
  matchRequests: MatchRequest[];
  onClose: () => void;
  onUnfriend: (requestId: string) => void;
  onBlockUser?: (targetId: string) => void;
  onReportUser?: (reportedId: string, reason: string, description: string) => Promise<void>;
  showSafetyActions?: boolean;
}

export const FriendProfileModal = ({
  selectedUser,
  currentUser,
  matchRequests,
  onClose,
  onUnfriend,
  onBlockUser,
  onReportUser,
  showSafetyActions = false,
}: FriendProfileModalProps) => {
  const dispatch = useAppDispatch();
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('other');
  const [reportDescription, setReportDescription] = useState('');

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });

  const handleReportSubmit = async () => {
    if (!onReportUser) return;
    const wordCount = reportDescription.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 8) {
      dispatch(showToast({ message: 'Description must be at least 8 words long.', type: 'error' }));
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: `Report ${selectedUser.name}`,
      message: `Are you sure you want to submit this safety report for ${selectedUser.name}?`,
      confirmText: 'Submit Report',
      isDanger: true,
      onConfirm: async () => {
        try {
          await onReportUser(selectedUser.id, reportReason, reportDescription);
          setShowReportForm(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          onClose(); // auto close profile modal after successful report
        } catch (err: any) {
          dispatch(showToast({ message: err.message || 'Error submitting report', type: 'error' }));
        }
      },
    });
  };

  const connection = matchRequests.find(
    (r) =>
      r.status === 'accepted' &&
      ((r.senderId === currentUser.id && r.receiverId === selectedUser.id) ||
        (r.senderId === selectedUser.id && r.receiverId === currentUser.id))
  );

  return (
    <div
      className="friend-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(32, 30, 29, 0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
      }}
    >
      <style>{`
        .friend-modal-backdrop {
          animation: fpm-fade-in 0.25s ease both;
        }
        .friend-modal-content {
          animation: fpm-scale-in 0.35s cubic-bezier(0.19, 1, 0.22, 1) both;
        }
        @keyframes fpm-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fpm-scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div
        className="friend-modal-content"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: '20px',
          border: '1px solid var(--color-divider)',
          padding: '1.75rem',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
          color: 'var(--color-text)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--color-divider)',
            paddingBottom: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', fontWeight: 600, margin: 0, letterSpacing: '0.02em' }}>
            {showReportForm ? `Report ${selectedUser.name}` : 'Roommate Profile'}
          </h3>
          <button
            type="button"
            onClick={() => {
              onClose();
              setShowReportForm(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '50%',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(32, 30, 29, 0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>

        {showReportForm ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-neutral-600)', marginBottom: '0.35rem' }}>
                Reason
              </label>
              <CustomSelect
                value={reportReason}
                onChange={setReportReason}
                options={[
                  { value: 'fake-profile', label: 'Fake Profile' },
                  { value: 'harassment', label: 'Harassment' },
                  { value: 'spam', label: 'Spam' },
                  { value: 'other', label: 'Other' }
                ]}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-neutral-600)', marginBottom: '0.35rem' }}>
                Description (min. 8 words)
              </label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe the situation in detail..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-divider)',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-body)',
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleReportSubmit}>
                Submit Safety Report
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 0.5 }}
                onClick={() => setShowReportForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img
                src={
                  selectedUser.photo ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80'
                }
                alt=""
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--color-accent)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              />
              <div>
                <h4 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 600, margin: 0 }}>{selectedUser.name}</h4>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 500 }}>
                  {selectedUser.age} y/o • {selectedUser.gender}
                </span>
              </div>
            </div>

            <div>
              <h5 style={sectionTitleStyle}>
                Contact Info
              </h5>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text)' }}>Email: {selectedUser.email}</p>
              {selectedUser.phone && <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text)' }}>Phone: {selectedUser.phone}</p>}
            </div>

            {selectedUser.bio && (
              <div>
                <h5 style={sectionTitleStyle}>
                  Biography
                </h5>
                <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.45', color: 'var(--color-text)', fontStyle: 'italic' }}>
                  "{selectedUser.bio}"
                </p>
              </div>
            )}

            <div>
              <h5 style={sectionTitleStyle}>
                Details
              </h5>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Preferred Location: {selectedUser.location}</p>
              <p style={{ margin: 0, fontSize: '0.875rem', textTransform: 'capitalize' }}>
                Occupation: {selectedUser.occupation || 'student'}
                {selectedUser.institution && ` at ${selectedUser.institution}`}
                {selectedUser.company && ` at ${selectedUser.company}`}
              </p>
            </div>

            {selectedUser.preferences && (
              <div>
                <h5 style={sectionTitleStyle}>
                  Lifestyle Habits
                </h5>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                  }}
                >
                  <span style={pillTagStyle}>
                    Sleep: {selectedUser.preferences.sleepSchedule || 'flexible'}
                  </span>
                  <span style={pillTagStyle}>
                    Clean: {selectedUser.preferences.cleanliness || 'moderate'}
                  </span>
                  <span style={pillTagStyle}>
                    Smoke: {selectedUser.preferences.smoking || 'no'}
                  </span>
                  <span style={pillTagStyle}>
                    Pets: {selectedUser.preferences.pets || 'no'}
                  </span>
                  <span style={pillTagStyle}>
                    Guests: {selectedUser.preferences.guestTolerance || 'weekends'}
                  </span>
                  {selectedUser.preferences.noiseTolerance && (
                    <span style={pillTagStyle}>
                      Noise: {selectedUser.preferences.noiseTolerance}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginTop: '0.5rem',
                borderTop: '1px solid var(--color-divider)',
                paddingTop: '1.25rem',
              }}
            >
              <button
                type="button"
                className="btn btn-danger"
                style={{ flex: '1 1 100%', marginBottom: '0.25rem' }}
                onClick={() => {
                  if (connection) {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Unfriend Roommate',
                      message: `Are you sure you want to unfriend ${selectedUser.name}? You will no longer be connected.`,
                      confirmText: 'Unfriend',
                      isDanger: true,
                      onConfirm: () => {
                        onUnfriend(connection.id);
                        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                        onClose();
                      },
                    });
                  } else {
                    dispatch(showToast({ message: 'Could not find active match request to delete.', type: 'error' }));
                  }
                }}
              >
                Unfriend Roommate
              </button>

              {showSafetyActions && onBlockUser && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: '1', border: '1px solid var(--danger)', color: 'var(--danger)' }}
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Block User',
                      message: `Are you sure you want to block ${selectedUser.name}? You will no longer be connected.`,
                      confirmText: 'Block',
                      isDanger: true,
                      onConfirm: () => {
                        onBlockUser(selectedUser.id);
                        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                        onClose();
                      },
                    });
                  }}
                >
                  Block
                </button>
              )}

              {showSafetyActions && onReportUser && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: '1', border: '1px solid #d67f48', color: '#d67f48' }}
                  onClick={() => setShowReportForm(true)}
                >
                  Report
                </button>
              )}

              <button type="button" className="btn btn-secondary" style={{ flex: '0.5' }} onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {confirmModal.isOpen && (
        <ConfirmationModal
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          isDanger={confirmModal.isDanger}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
};

// ─── Themed Styles — Sand / Cream Organic Theme ────────────────────────────────

const pillTagStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.625rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  padding: '4px 10px',
  borderRadius: 'var(--radius-pill)',
  border: '1px solid var(--color-divider)',
  background: 'rgba(32, 30, 29, 0.04)',
  color: 'var(--color-text)',
  display: 'inline-flex',
  alignItems: 'center',
};


const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.725rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-accent-700)',
  margin: '0 0 0.15rem 0',
};
