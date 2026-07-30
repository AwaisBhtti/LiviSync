/** RoommateGrid — candidate cards, dark navy theme. */
import type { User, MatchRequest } from '../../types';
import { Check, MapPin, Clock, Sparkles } from 'lucide-react';
import { DEFAULT_AVATAR } from '../../styles/commonStyles';

export type Candidate = User & { score: number };

interface RoommateGridProps {
  candidates: Candidate[];
  matchRequests: MatchRequest[];
  currentUserId: string;
  onSelectCandidate: (user: User) => void;
}

const CARD_BG     = 'rgba(30, 41, 59, 0.6)';
const CARD_BORDER = 'rgba(255, 255, 255, 0.07)';
const TEXT        = '#f1f5f9';
const MUTED       = '#94a3b8';

const getScoreColors = (score: number) => {
  if (score >= 80) return { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)' };
  if (score >= 50) return { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)' };
  return              { color: MUTED,       bg: 'rgba(100,116,139,0.1)',   border: 'rgba(100,116,139,0.2)' };
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
        style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          color: MUTED,
          background: CARD_BG,
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: '16px',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Sparkles size={36} style={{ color: 'rgba(99,102,241,0.4)' }} />
        <p style={{ fontWeight: 700, color: TEXT, fontSize: '1rem' }}>No matches found</p>
        <p style={{ fontSize: '0.85rem' }}>Try adjusting your filters to see more candidates.</p>
      </div>
    );
  }

  return (
    <div className="grid-2">
      {candidates.map((candidate) => {
        const reqStatus = getRequestStatus(candidate.id);
        const occupationDisplay = candidate.occupation === 'job' ? 'Job Holder' : 'Student';
        const { color, bg, border } = getScoreColors(candidate.score);
        const sleepLabel = candidate.preferences?.sleepSchedule?.replace('-', ' ') ?? null;

        return (
          <div
            key={candidate.id}
            className="rm-card-hover"
            onClick={() => onSelectCandidate(candidate)}
            style={{
              background: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: '16px',
              backdropFilter: 'blur(16px)',
              padding: '1.125rem 1.25rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
              <img
                src={candidate.photo || DEFAULT_AVATAR}
                alt={candidate.name}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: TEXT,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {candidate.name}
                </h3>
                <p style={{ fontSize: '0.75rem', color: MUTED, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                  <span>{candidate.age ?? '?'} y/o</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span style={{ textTransform: 'capitalize' }}>{candidate.gender ?? 'N/A'}</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span
                    style={{
                      background: 'rgba(99,102,241,0.15)',
                      color: 'rgba(165,180,252,0.9)',
                      border: '1px solid rgba(99,102,241,0.25)',
                      borderRadius: '20px',
                      padding: '0.05rem 0.45rem',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                    }}
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
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  border: `1.5px solid ${border}`,
                  background: bg,
                  color,
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 800, lineHeight: 1 }}>{candidate.score}%</span>
                <span style={{ fontSize: '0.48rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.7, marginTop: '2px' }}>match</span>
              </div>
            </div>

            {/* Bio */}
            <p
              style={{
                fontSize: '0.8rem',
                color: 'rgba(148,163,184,0.85)',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: '1.5',
              }}
            >
              {candidate.bio || 'No biography provided.'}
            </p>

            {/* Habit chips */}
            {(sleepLabel || candidate.preferences?.cleanliness) && (
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {sleepLabel && (
                  <span style={chipStyle}>
                    <Clock size={10} />
                    {sleepLabel}
                  </span>
                )}
                {candidate.preferences?.cleanliness && (
                  <span style={chipStyle}>
                    ✦ {candidate.preferences.cleanliness}
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                paddingTop: '0.625rem',
                marginTop: 'auto',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'rgba(100,116,139,0.8)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <MapPin size={11} />
                {candidate.location || 'Islamabad'} · PKR {(candidate.budget ?? 0).toLocaleString()}/mo
              </span>

              {reqStatus === 'accepted' && (
                <span style={{ color: '#34d399', fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Check size={11} /> Matched
                </span>
              )}
              {reqStatus === 'pending' && (
                <span style={{
                  color: '#fbbf24',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: 'rgba(251,191,36,0.1)',
                  border: '1px solid rgba(251,191,36,0.2)',
                  borderRadius: '20px',
                  padding: '0.15rem 0.5rem',
                }}>
                  Pending
                </span>
              )}
              {!reqStatus && (
                <span style={{ color: 'rgba(165,180,252,0.9)', fontSize: '0.72rem', fontWeight: 600 }}>
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

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  fontSize: '0.68rem',
  fontWeight: 600,
  color: 'rgba(148,163,184,0.8)',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
  padding: '0.18rem 0.5rem',
  textTransform: 'capitalize',
};
