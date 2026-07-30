/** RoommateRequestsPanel — "My Requests" tab: received + sent request columns. */
import type { User, MatchRequest } from '../../types';
import { DEFAULT_AVATAR } from '../../styles/commonStyles';

interface RoommateRequestsPanelProps {
  users: User[];
  currentUser: User;
  matchRequests: MatchRequest[];
  onAcceptRequest: (reqId: string) => void;
  onDeclineRequest: (reqId: string) => void;
  onCancelRequest: (reqId: string) => void;
}

const requestCardStyle: React.CSSProperties = {
  padding: '1rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  backgroundColor: 'var(--secondary)',
};

const senderAvatarStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  objectFit: 'cover',
};

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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      {/* Received */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            borderBottom: '1px solid var(--border)',
            paddingBottom: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          Received Requests ({receivedRequests.length})
        </h3>
        {receivedRequests.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
            No pending received requests.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {receivedRequests.map((req) => {
              const sender = users.find((u) => u.id === req.senderId);
              if (!sender) return null;
              return (
                <div key={req.id} style={requestCardStyle}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}
                  >
                    <img src={sender.photo || DEFAULT_AVATAR} alt="" style={senderAvatarStyle} />
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{sender.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        Budget: PKR {(sender.budget ?? 0).toLocaleString()}/mo
                      </span>
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--foreground)',
                      margin: '0.5rem 0',
                    }}
                  >
                    "{req.message}"
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => onAcceptRequest(req.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => onDeclineRequest(req.id)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sent */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            borderBottom: '1px solid var(--border)',
            paddingBottom: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          Sent Requests ({sentRequests.length})
        </h3>
        {sentRequests.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>No sent requests.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sentRequests.map((req) => {
              const receiver = users.find((u) => u.id === req.receiverId);
              if (!receiver) return null;
              return (
                <div key={req.id} style={requestCardStyle}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}
                  >
                    <img src={receiver.photo || DEFAULT_AVATAR} alt="" style={senderAvatarStyle} />
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{receiver.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        Budget: PKR {(receiver.budget ?? 0).toLocaleString()}/mo
                      </span>
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--foreground)',
                      margin: '0.5rem 0',
                    }}
                  >
                    "{req.message}"
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '0.75rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color:
                          req.status === 'accepted'
                            ? 'var(--success)'
                            : req.status === 'declined'
                              ? 'var(--danger)'
                              : 'var(--muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Status: {req.status}
                    </span>
                    {req.status === 'pending' && (
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => onCancelRequest(req.id)}
                      >
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
  );
};
