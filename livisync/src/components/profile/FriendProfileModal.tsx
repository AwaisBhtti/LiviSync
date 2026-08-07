import { useState } from 'react';
import type { User, MatchRequest } from '../../types';
import { ConfirmationModal } from '../ConfirmationModal';
import { showToast } from '../../store/slices/toastSlice';
import { useAppDispatch } from '../../store/store';
import { CustomSelect } from '../ui/CustomSelect';

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
    onConfirm: () => {},
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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(32, 30, 29, 0.4)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: '1.5rem',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          color: 'var(--foreground)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
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
              fontSize: '1.25rem',
            }}
          >
            ✕
          </button>
        </div>

        {showReportForm ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
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
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Description (min. 8 words)
              </label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe the situation in detail..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--card-bg)',
                  resize: 'vertical',
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
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--primary)',
                }}
              />
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{selectedUser.name}</h4>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  {selectedUser.age} y/o • {selectedUser.gender}
                </span>
              </div>
            </div>

            <div>
              <h5 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--muted)' }}>
                Contact Info
              </h5>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>📧 Email: {selectedUser.email}</p>
              {selectedUser.phone && <p style={{ margin: 0, fontSize: '0.875rem' }}>📞 Phone: {selectedUser.phone}</p>}
            </div>

            {selectedUser.bio && (
              <div>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--muted)' }}>
                  Biography
                </h5>
                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.4', color: 'var(--muted)' }}>
                  {selectedUser.bio}
                </p>
              </div>
            )}

            <div>
              <h5 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--muted)' }}>
                Details
              </h5>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>📍 Preferred Location: {selectedUser.location}</p>

              <p style={{ margin: 0, fontSize: '0.875rem', textTransform: 'capitalize' }}>
                💼 Occupation: {selectedUser.occupation || 'student'}
                {selectedUser.institution && ` at ${selectedUser.institution}`}
                {selectedUser.company && ` at ${selectedUser.company}`}
              </p>
            </div>

            {selectedUser.preferences && (
              <div>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--muted)' }}>
                  Lifestyle Habits
                </h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                    🛌 Sleep: {selectedUser.preferences.sleepSchedule || 'flexible'}
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                    🧹 Cleanliness: {selectedUser.preferences.cleanliness || 'moderate'}
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                    🚬 Smoking: {selectedUser.preferences.smoking || 'no'}
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                    🐾 Pets: {selectedUser.preferences.pets || 'no'}
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                    👥 Guests: {selectedUser.preferences.guestTolerance || 'weekends'}
                  </span>
                  {selectedUser.preferences.noiseTolerance && (
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                      🔊 Noise: {selectedUser.preferences.noiseTolerance}
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
                marginTop: '1rem',
                borderTop: '1px solid var(--border)',
                paddingTop: '1rem',
              }}
            >
              <button
                type="button"
                className="btn btn-danger"
                style={{ flex: '1 1 100%' }}
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
