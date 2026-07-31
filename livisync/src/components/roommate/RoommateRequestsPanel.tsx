/** RoommateRequestsPanel — "My Requests" tab, dark navy theme. */
import type { User, MatchRequest } from '../../types';
import { DEFAULT_AVATAR } from '../../styles/commonStyles';
import { colors } from '../../styles/colors';

interface RoommateRequestsPanelProps {
  users: User[];
  currentUser: User;
  matchRequests: MatchRequest[];
  onAcceptRequest: (reqId: string) => void;
  onDeclineRequest: (reqId: string) => void;
  onCancelRequest: (reqId: string) => void;
}

const CARD_BG     = colors.dark.card;
const CARD_BORDER = colors.dark.border;
const ITEM_BG     = colors.dark.inputBg;
const TEXT        = colors.dark.text;
const MUTED       = colors.dark.muted;

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
  const sentRequests = matchRequests.filter((r) => r.senderId === currentUser.id && r.status === 'pending');

  const panelStyle: React.CSSProperties = {
    background: CARD_BG,
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: '16px',
    backdropFilter: 'blur(16px)',
    padding: '1.5rem',
  };

  const sectionHeadStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: TEXT,
    borderBottom: `1px solid ${CARD_BORDER}`,
    paddingBottom: '0.625rem',
    marginBottom: '1rem',
  };

  const itemStyle: React.CSSProperties = {
    padding: '0.875rem',
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: '12px',
    backgroundColor: ITEM_BG,
  };

  const renderRequestCard = (req: MatchRequest, person: User, side: 'received' | 'sent') => (
    <div key={req.id} style={itemStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem' }}>
        <img
          src={person.photo || DEFAULT_AVATAR}
          alt=""
          style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover', border: `1px solid ${CARD_BORDER}` }}
        />
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: TEXT }}>{person.name}</h4>
          <span style={{ fontSize: '0.72rem', color: MUTED }}>
            PKR {(person.budget ?? 0).toLocaleString()}/mo
          </span>
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'rgba(148,163,184,0.8)', fontStyle: 'italic', margin: '0.5rem 0', lineHeight: 1.5 }}>
        "{req.message}"
      </p>

      {side === 'received' ? (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <button
            onClick={() => onAcceptRequest(req.id)}
            style={actionBtnStyle('#34d399', 'rgba(52,211,153,0.12)', 'rgba(52,211,153,0.25)')}
          >
            Accept
          </button>
          <button
            onClick={() => onDeclineRequest(req.id)}
            style={actionBtnStyle('#f87171', 'rgba(248,113,113,0.1)', 'rgba(248,113,113,0.2)')}
          >
            Decline
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Awaiting response
          </span>
          <button
            onClick={() => onCancelRequest(req.id)}
            style={actionBtnStyle('#f87171', 'rgba(248,113,113,0.08)', 'rgba(248,113,113,0.15)')}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="rm-requests-grid">
      <div style={panelStyle}>
        <h3 style={sectionHeadStyle}>Received ({receivedRequests.length})</h3>
        {receivedRequests.length === 0 ? (
          <p style={{ color: MUTED, fontSize: '0.85rem' }}>No pending received requests.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {receivedRequests.map((req) => {
              const sender = users.find((u) => u.id === req.senderId);
              return sender ? renderRequestCard(req, sender, 'received') : null;
            })}
          </div>
        )}
      </div>

      <div style={panelStyle}>
        <h3 style={sectionHeadStyle}>Sent ({sentRequests.length})</h3>
        {sentRequests.length === 0 ? (
          <p style={{ color: MUTED, fontSize: '0.85rem' }}>No pending sent requests.</p>
        ) : (
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

const actionBtnStyle = (color: string, bg: string, border: string): React.CSSProperties => ({
  padding: '0.3rem 0.75rem',
  fontSize: '0.775rem',
  fontWeight: 700,
  color,
  background: bg,
  border: `1px solid ${border}`,
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s',
});
