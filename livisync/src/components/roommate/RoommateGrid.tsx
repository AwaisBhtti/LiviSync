/** RoommateGrid — candidate cards, warm sand and cashmere style. */
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

const CARD_BG     = '#f0ece6'; // Linen beige
const CARD_BORDER = '#e0d6cb';
const TEXT        = '#332721'; // Espresso brown
const MUTED       = '#8c7b70'; // Warm beige

const getScoreColors = (score: number) => {
  if (score >= 80) return { color: '#b55c3c', bg: 'rgba(181, 92, 60, 0.12)', border: '#b55c3c' };
  if (score >= 50) return { color: '#d97706', bg: '#fffbeb',  border: 'rgba(217, 119, 6, 0.15)' };
  return              { color: MUTED,       bg: 'rgba(51, 39, 33, 0.04)',   border: '#e0d6cb' };
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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Sparkles size={36} style={{ color: '#b55c3c', opacity: 0.4 }} />
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
            onClick={() => onSelectCandidate(candidate)}
            style={{
              background: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: '16px',
              padding: '1.25rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
              transition: 'var(--transition)',
              boxShadow: '0 2px 12px rgba(51, 39, 33, 0.02)',
            }}
            className="rm-card-hover"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#b55c3c';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(181, 92, 60, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = CARD_BORDER;
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(51, 39, 33, 0.02)';
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <img
                src={candidate.photo || DEFAULT_AVATAR}
                alt={candidate.name}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid #e0d6cb',
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: '1.05rem',
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
                <p style={{ fontSize: '0.8rem', color: MUTED, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <span>{candidate.age ?? '?'} y/o</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span style={{ textTransform: 'capitalize' }}>{candidate.gender ?? 'N/A'}</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span
                    style={{
                      background: 'rgba(181, 92, 60, 0.12)',
                      color: '#b55c3c',
                      border: '1px solid rgba(181, 92, 60, 0.2)',
                      borderRadius: '20px',
                      padding: '0.1rem 0.5rem',
                      fontSize: '0.7rem',
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
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  border: `1.5px solid ${border}`,
                  background: bg,
                  color,
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 800, lineHeight: 1 }}>{candidate.score}%</span>
                <span style={{ fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.8, marginTop: '1px' }}>match</span>
              </div>
            </div>

            {/* Bio */}
            <p
              style={{
                fontSize: '0.85rem',
                color: '#332721',
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
                    <Clock size={12} />
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
                borderTop: '1px solid #e0d6cb',
                paddingTop: '0.75rem',
                marginTop: 'auto',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: MUTED, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} />
                {candidate.location || 'Islamabad'} · PKR {(candidate.budget ?? 0).toLocaleString()}/mo
              </span>

              {reqStatus === 'accepted' && (
                <span style={{ color: '#b55c3c', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Check size={12} /> Matched
                </span>
              )}
              {reqStatus === 'pending' && (
                <span style={{
                  color: '#b55c3c',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'rgba(181, 92, 60, 0.12)',
                  border: '1px solid rgba(181, 92, 60, 0.25)',
                  borderRadius: '20px',
                  padding: '0.15rem 0.5rem',
                }}>
                  Pending
                </span>
              )}
              {!reqStatus && (
                <span style={{ color: '#b55c3c', fontSize: '0.8rem', fontWeight: 600 }}>
                  View Profile →
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
  fontSize: '0.75rem',
  fontWeight: 600,
  color: MUTED,
  background: '#faf8f5', // Warm sand
  border: '1px solid #e0d6cb',
  borderRadius: '20px',
  padding: '0.2rem 0.6rem',
  textTransform: 'capitalize',
};
