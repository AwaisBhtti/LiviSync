/** RoommateGrid — candidate cards grid for the Roommate Finder. */
import type { User, MatchRequest } from '../../types';
import { Check, MapPin, Clock, Sparkles } from 'lucide-react';
import { DEFAULT_AVATAR } from '../../styles/commonStyles';

// Candidate extends User fields with a computed score
export type Candidate = User & { score: number };

interface RoommateGridProps {
  candidates: Candidate[];
  matchRequests: MatchRequest[];
  currentUserId: string;
  onSelectCandidate: (user: User) => void;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return { color: 'var(--success)', bg: 'var(--success-bg)', border: 'var(--success-border)' };
  if (score >= 50) return { color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'var(--warning-border)' };
  return { color: 'var(--muted)', bg: 'var(--muted-bg)', border: 'var(--border)' };
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
      <div
        className="card"
        style={{
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Sparkles size={32} style={{ opacity: 0.3 }} />
        <p style={{ fontWeight: 600 }}>No matches found</p>
        <p style={{ fontSize: '0.85rem' }}>Try adjusting your filters to see more candidates.</p>
      </div>
    );
  }

  return (
    <div className="grid-2">
      {candidates.map((candidate) => {
        const reqStatus = getRequestStatus(candidate.id);
        const occupationDisplay = candidate.occupation === 'job' ? 'Job Holder' : 'Student';
        const { color, bg, border } = getScoreColor(candidate.score);
        const sleepLabel = candidate.preferences?.sleepSchedule
          ? candidate.preferences.sleepSchedule.replace('-', ' ')
          : null;

        return (
          <div
            key={candidate.id}
            className="candidate-card"
            onClick={() => onSelectCandidate(candidate)}
          >
            {/* Top row: avatar + name + score */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={candidate.photo || DEFAULT_AVATAR}
                  alt={candidate.name}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    objectFit: 'cover',
                    border: '2px solid var(--border)',
                  }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {candidate.name}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                  <span>{candidate.age ?? '?'} y/o</span>
                  <span style={{ opacity: 0.4 }}>•</span>
                  <span style={{ textTransform: 'capitalize' }}>{candidate.gender ?? 'N/A'}</span>
                  <span style={{ opacity: 0.4 }}>•</span>
                  <span
                    className="badge badge-neutral"
                    style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}
                  >
                    {occupationDisplay}
                  </span>
                </p>
              </div>

              {/* Score badge */}
              <div
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  border: `1.5px solid ${border}`,
                  backgroundColor: bg,
                  color,
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 800, lineHeight: 1 }}>{candidate.score}%</span>
                <span style={{ fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.75, marginTop: '1px' }}>
                  match
                </span>
              </div>
            </div>

            {/* Bio */}
            <p
              style={{
                fontSize: '0.825rem',
                color: 'var(--muted)',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: '1.5',
              }}
            >
              {candidate.bio || 'No biography provided.'}
            </p>

            {/* Habit tags */}
            {(sleepLabel || candidate.preferences?.cleanliness) && (
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {sleepLabel && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: 'var(--muted)',
                      background: 'var(--secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '20px',
                      padding: '0.2rem 0.55rem',
                      textTransform: 'capitalize',
                    }}
                  >
                    <Clock size={10} />
                    {sleepLabel}
                  </span>
                )}
                {candidate.preferences?.cleanliness && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: 'var(--muted)',
                      background: 'var(--secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '20px',
                      padding: '0.2rem 0.55rem',
                      textTransform: 'capitalize',
                    }}
                  >
                    ✦ {candidate.preferences.cleanliness}
                  </span>
                )}
              </div>
            )}

            {/* Footer: location + status */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border)',
                paddingTop: '0.625rem',
                marginTop: 'auto',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <MapPin size={11} />
                {candidate.location || 'Islamabad'} • PKR {(candidate.budget ?? 0).toLocaleString()}/mo
              </span>

              {reqStatus === 'accepted' && (
                <span
                  style={{
                    color: 'var(--success)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <Check size={12} /> Matched
                </span>
              )}
              {reqStatus === 'pending' && (
                <span
                  style={{
                    color: 'var(--warning)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: 'var(--warning-bg)',
                    border: '1px solid var(--warning-border)',
                    borderRadius: '20px',
                    padding: '0.15rem 0.5rem',
                  }}
                >
                  Pending
                </span>
              )}
              {!reqStatus && (
                <span
                  style={{
                    color: 'var(--primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  View →
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
