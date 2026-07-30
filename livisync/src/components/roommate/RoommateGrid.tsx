/** RoommateGrid — candidate cards grid for the Roommate Finder. */
import type { User, MatchRequest } from '../../types';
import { Check, MapPin } from 'lucide-react';
import { DEFAULT_AVATAR } from '../../styles/commonStyles';

// Candidate extends User fields with a computed score
export type Candidate = User & { score: number };

interface RoommateGridProps {
  candidates: Candidate[];
  matchRequests: MatchRequest[];
  currentUserId: string;
  onSelectCandidate: (user: User) => void;
}

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

export const RoommateGrid = ({
  candidates,
  matchRequests,
  currentUserId,
  onSelectCandidate,
}: RoommateGridProps) => {
  const getRequestStatus = (userId: string) => {
    const req = matchRequests.find(
      (r) =>
        (r.senderId === currentUserId && r.receiverId === userId) ||
        (r.senderId === userId && r.receiverId === currentUserId)
    );
    return req ? req.status : null;
  };

  if (candidates.length === 0) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
        No potential roommates match your filter criteria.
      </div>
    );
  }

  return (
    <div className="grid-2">
      {candidates.map((candidate) => {
        const reqStatus = getRequestStatus(candidate.id);
        const occupationDisplay = candidate.occupation === 'job' ? 'Job Holder' : 'Student';

        return (
          <div
            key={candidate.id}
            className="card"
            style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            onClick={() => onSelectCandidate(candidate)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src={candidate.photo || DEFAULT_AVATAR}
                alt={candidate.name}
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: '1rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {candidate.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  {candidate.age ?? '?'} y/o • {candidate.gender ?? 'N/A'} •{' '}
                  <span
                    className="badge badge-neutral"
                    style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}
                  >
                    {occupationDisplay}
                  </span>
                </p>
              </div>
              <div style={scoreCircleStyle(candidate.score)}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{candidate.score}%</span>
                <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', opacity: 0.8 }}>
                  Match
                </span>
              </div>
            </div>

            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--muted)',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: '1.45',
              }}
            >
              {candidate.bio || 'No biography provided.'}
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.5rem',
                borderTop: '1px solid var(--border)',
                paddingTop: '0.75rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <MapPin size={12} />
                {candidate.location || 'Islamabad'} • PKR {(candidate.budget ?? 0).toLocaleString()}/mo
              </span>

              {reqStatus === 'accepted' && (
                <span
                  style={{
                    color: 'var(--success)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <Check size={12} /> Matched
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
  );
};
