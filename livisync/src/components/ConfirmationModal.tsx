import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isDanger?: boolean;
}

export const ConfirmationModal = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = false,
}: ConfirmationModalProps) => {
  return (
    <div style={overlayStyle}>
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .custom-confirm-card {
          animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <div className="custom-confirm-card card" style={cardStyle}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={iconContainerStyle(isDanger)}>
            <AlertTriangle size={20} color={isDanger ? 'var(--danger)' : 'var(--primary)'} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--foreground)' }}>
              {title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0, lineHeight: '1.5' }}>
              {message}
            </p>
          </div>
        </div>

        <div style={buttonGroupStyle}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.85rem' }}
          >
            <X size={14} />
            {cancelText}
          </button>
          <button
            type="button"
            className={isDanger ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={onConfirm}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.85rem' }}
          >
            <Check size={14} />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Styles
const overlayStyle: React.CSSProperties = {
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
  zIndex: 999999,
  padding: '1.5rem',
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '440px',
  padding: '1.75rem',
  background: 'var(--gradient-card, #ffffff)',
  borderRadius: 'var(--radius, 12px)',
  border: '1px solid var(--border)',
  boxShadow: 'var(--shadow-lg)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const iconContainerStyle = (isDanger: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: isDanger ? 'rgba(163, 59, 42, 0.1)' : 'rgba(99, 102, 241, 0.1)',
  flexShrink: 0,
});

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.75rem',
};
