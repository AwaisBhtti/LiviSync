import { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useAppDispatch } from '../../store/store';
import { showToast } from '../../store/slices/toastSlice';
import { modalOverlayStyle, modalContentStyle } from '../../styles/commonStyles';

const REPORT_REASONS = [
  { value: 'harassment', label: 'Harassment or Bullying' },
  { value: 'hate-speech', label: 'Hate Speech or Discrimination' },
  { value: 'threats', label: 'Threats or Violence' },
  { value: 'spam', label: 'Spam or Scam' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'other', label: 'Other' },
];

interface ReportMessageModalProps {
  messageId: string;
  messageText: string;
  reportedUserId: string;
  reportedUserName: string;
  token: string;
  onClose: () => void;
}

export const ReportMessageModal = ({
  messageId,
  messageText,
  reportedUserId,
  reportedUserName,
  token,
  onClose,
}: ReportMessageModalProps) => {
  const dispatch = useAppDispatch();
  const [selectedReason, setSelectedReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      dispatch(showToast({ message: 'Please select a reason for the report.', type: 'error' }));
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/students/message-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          reported_user_id: reportedUserId,
          message_id: messageId,
          message_text: messageText,
          reason: selectedReason,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to submit report.');
      }
      dispatch(showToast({ message: 'Report submitted. Our team will review it shortly.', type: 'success' }));
      onClose();
    } catch (err: any) {
      dispatch(showToast({ message: err.message || 'Error submitting report.', type: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div
        style={{ ...modalContentStyle, maxWidth: '420px', width: '90%', padding: '1.5rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flag size={18} style={{ color: '#a33b2a' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Report Message</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '0.25rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Message preview */}
        <div style={{ background: 'var(--card-hover)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1rem', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Message from {reportedUserName}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--foreground)', wordBreak: 'break-word', lineHeight: 1.5 }}>
            "{messageText}"
          </p>
        </div>

        {/* Reason selection */}
        <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.625rem', color: 'var(--foreground)' }}>
          Why are you reporting this message? <span style={{ color: '#a33b2a' }}>*</span>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {REPORT_REASONS.map((reason) => {
            const isSelected = selectedReason === reason.value;
            return (
              <button
                key={reason.value}
                type="button"
                onClick={() => setSelectedReason(reason.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-sm)',
                  border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  background: isSelected ? 'rgba(var(--primary-rgb, 99, 102, 241), 0.08)' : 'transparent',
                  color: isSelected ? 'var(--primary)' : 'var(--foreground)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: isSelected ? 600 : 400,
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  width: '100%',
                }}
              >
                <span style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--muted)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {isSelected && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', display: 'block' }} />}
                </span>
                {reason.label}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedReason}
            className="btn btn-primary"
            style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Flag size={14} />
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
};
