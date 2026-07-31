/** RoommateRequestsPanel — warm sand & cashmere theme to match the rest of the page. */
import type { User, MatchRequest } from '../../types';
import { DEFAULT_AVATAR } from '../../styles/commonStyles';
import { Inbox, Send, Clock, CheckCircle, XCircle } from 'lucide-react';

interface RoommateRequestsPanelProps {
  users: User[];
  currentUser: User;
  matchRequests: MatchRequest[];
  onAcceptRequest: (reqId: string) => void;
  onDeclineRequest: (reqId: string) => void;
  onCancelRequest: (reqId: string) => void;
}

// ── Warm sand palette (matches RoommateGrid / page header) ──────────────────
const BG       = '#faf8f5';
const CARD_BG  = '#f0ece6';
const BORDER   = '#e0d6cb';
const TEXT     = '#332721';
const MUTED    = '#8c7b70';
const ACCENT   = '#b55c3c';

export const RoommateRequestsPanel = ({
  users,
  currentUser,
  matchRequests,
  onAcceptRequest,
  onDeclineRequest,
  onCancelRequest,
}: RoommateRequestsPanelProps) => {
  const receivedRequests = matchRequests.filter(
    (r) =>
      r.receiverId === currentUser.id &&
      r.status === 'pending' &&
      !currentUser.blockedUsers?.includes(r.senderId)
  );
  const sentRequests = matchRequests.filter(
    (r) => r.senderId === currentUser.id && r.status === 'pending'
  );

  const renderRequestCard = (req: MatchRequest, person: User, side: 'received' | 'sent') => (
    <div
      key={req.id}
      style={{
        background: BG,
        border: `1px solid ${BORDER}`,
        borderRadius: '14px',
        padding: '1rem 1.125rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* Person row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img
          src={person.photo || DEFAULT_AVATAR}
          alt=""
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: `1.5px solid ${BORDER}`,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {person.name}
          </h4>
          <span style={{ fontSize: '0.72rem', color: MUTED }}>
            PKR {(person.budget ?? 0).toLocaleString()}/mo
          </span>
        </div>
        {/* Status badge */}
        {side === 'sent' && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.68rem', fontWeight: 700,
            color: '#d97706',
            background: '#fffbeb',
            border: '1px solid rgba(217,119,6,0.2)',
            borderRadius: '20px',
            padding: '0.2rem 0.55rem',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            <Clock size={10} />
            Pending
          </span>
        )}
        {side === 'received' && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.68rem', fontWeight: 700,
            color: ACCENT,
            background: 'rgba(181,92,60,0.1)',
            border: `1px solid rgba(181,92,60,0.2)`,
            borderRadius: '20px',
            padding: '0.2rem 0.55rem',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            New
          </span>
        )}
      </div>

      {/* Message */}
      <p style={{
        fontSize: '0.8rem',
        color: MUTED,
        fontStyle: 'italic',
        lineHeight: 1.55,
        margin: 0,
        background: CARD_BG,
        borderRadius: '8px',
        padding: '0.5rem 0.75rem',
        borderLeft: `3px solid ${BORDER}`,
      }}>
        "{req.message}"
      </p>

      {/* Actions */}
      {side === 'received' ? (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onAcceptRequest(req.id)}
            style={actionBtnStyle('accept')}
          >
            <CheckCircle size={13} />
            Accept
          </button>
          <button
            onClick={() => onDeclineRequest(req.id)}
            style={actionBtnStyle('decline')}
          >
            <XCircle size={13} />
            Decline
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => onCancelRequest(req.id)}
            style={actionBtnStyle('cancel')}
          >
            <XCircle size={13} />
            Withdraw
          </button>
        </div>
      )}
    </div>
  );

  const emptyState = (label: string) => (
    <div style={{
      padding: '2rem 1rem',
      textAlign: 'center',
      color: MUTED,
      fontSize: '0.85rem',
    }}>
      <p style={{ fontWeight: 600, color: TEXT, marginBottom: '0.25rem' }}>No {label} requests</p>
      <p>Nothing here yet.</p>
    </div>
  );

  return (
    <div className="rm-requests-grid">
      {/* Received */}
      <div style={panelStyle}>
        <div style={sectionHeadStyle}>
          <Inbox size={15} style={{ color: ACCENT }} />
          <span>Received</span>
          {receivedRequests.length > 0 && (
            <span style={countPillStyle}>{receivedRequests.length}</span>
          )}
        </div>
        {receivedRequests.length === 0 ? emptyState('received') : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {receivedRequests.map((req) => {
              const sender = users.find((u) => u.id === req.senderId);
              return sender ? renderRequestCard(req, sender, 'received') : null;
            })}
          </div>
        )}
      </div>

      {/* Sent */}
      <div style={panelStyle}>
        <div style={sectionHeadStyle}>
          <Send size={14} style={{ color: ACCENT }} />
          <span>Sent</span>
          {sentRequests.length > 0 && (
            <span style={countPillStyle}>{sentRequests.length}</span>
          )}
        </div>
        {sentRequests.length === 0 ? emptyState('sent') : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sentRequests.map((req) => {
              const receiver = users.find((u) => u.id === req.receiverId);
              return receiver ? renderRequestCard(req, receiver, 'sent') : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Shared styles ────────────────────────────────────────────────────────────

const panelStyle: React.CSSProperties = {
  background: CARD_BG,
  border: `1px solid ${BORDER}`,
  borderRadius: '16px',
  padding: '1.25rem',
};

const sectionHeadStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.9rem',
  fontWeight: 700,
  color: TEXT,
  borderBottom: `1px solid ${BORDER}`,
  paddingBottom: '0.75rem',
  marginBottom: '1rem',
};

const countPillStyle: React.CSSProperties = {
  backgroundColor: ACCENT,
  color: 'white',
  fontSize: '0.65rem',
  fontWeight: 700,
  borderRadius: '9999px',
  minWidth: '18px',
  height: '18px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 5px',
  marginLeft: 'auto',
};

const actionBtnStyle = (type: 'accept' | 'decline' | 'cancel'): React.CSSProperties => {
  const map = {
    accept:  { color: '#059669', bg: 'rgba(5,150,105,0.08)',  border: 'rgba(5,150,105,0.25)'  },
    decline: { color: '#dc2626', bg: 'rgba(220,38,38,0.07)',  border: 'rgba(220,38,38,0.2)'   },
    cancel:  { color: MUTED,     bg: 'rgba(140,123,112,0.08)',border: 'rgba(140,123,112,0.2)'  },
  };
  const { color, bg, border } = map[type];
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.35rem 0.875rem',
    fontSize: '0.775rem',
    fontWeight: 700,
    color,
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };
};
