/** RoommateGrid — candidate cards in the Organic style: soft sand surfaces, ring scores, pill tags. */
import type { User, MatchRequest, Preferences } from '../../types';
import { Check, MapPin } from 'lucide-react';
import { DEFAULT_AVATAR } from '../../styles/commonStyles';

export type Candidate = User & { score: number };

interface RoommateGridProps {
  candidates: Candidate[];
  matchRequests: MatchRequest[];
  currentUserId: string;
  onSelectCandidate: (user: User) => void;
  hideScores?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

const RING_CIRCUMFERENCE = 263.9;

const SLEEP_LABELS: Record<Preferences['sleepSchedule'], string> = {
  'early-bird': 'Early Bird',
  'night-owl': 'Night Owl',
  flexible: 'Flexible',
};

const CLEAN_LABELS: Record<Preferences['cleanliness'], string> = {
  meticulous: 'Very Tidy',
  moderate: 'Moderately Tidy',
  relaxed: 'Relaxed',
};

const SMOKING_LABELS: Record<Preferences['smoking'], string> = {
  no: 'No Smoking',
  yes: 'Smoker',
  'outside-only': 'Outdoors Only',
};

/** The three lifestyle traits the card leads with — the ones that decide a room. */
const lifestyleTags = (prefs?: Preferences) => {
  if (!prefs) return [];
  return [
    SLEEP_LABELS[prefs.sleepSchedule],
    CLEAN_LABELS[prefs.cleanliness],
    SMOKING_LABELS[prefs.smoking],
  ].filter(Boolean);
};

export const RoommateGrid = ({
  candidates,
  matchRequests,
  currentUserId,
  onSelectCandidate,
  hideScores = false,
  containerRef,
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
      <div style={emptyStateStyle}>
        <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', fontSize: '1.25rem' }}>
          No matches found
        </p>
        <p style={{ fontSize: '0.875rem' }}>Try adjusting your filters to see more candidates.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="grid-2 rm-grid-mobile-single">
      {candidates.map((candidate, i) => {
        const reqStatus = getRequestStatus(candidate.id);
        const occupationDisplay = candidate.occupation === 'job' ? 'Job Holder' : 'Student';
        const tags = lifestyleTags(candidate.preferences);

        return (
          <div
            key={candidate.id}
            onClick={() => onSelectCandidate(candidate)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') onSelectCandidate(candidate); }}
            className="reveal rm-card-hover"
            data-reveal
            data-delay={((i % 2) * 0.06).toFixed(2)}
            style={cardStyle}
          >
            {/* Top row — avatar, identity, ring score */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img
                src={candidate.photo || DEFAULT_AVATAR}
                alt={candidate.name}
                style={avatarStyle}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={nameStyle}>{candidate.name}</h3>
                <p style={metaStyle}>
                  <span>{candidate.age ?? '?'} y/o</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span style={{ textTransform: 'capitalize' }}>{candidate.gender ?? 'N/A'}</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span style={{ fontWeight: 600 }}>
                    {occupationDisplay}
                    {candidate.occupation === 'student' && candidate.institution ? ` · ${candidate.institution}` : ''}
                    {candidate.occupation === 'job' && candidate.company ? ` · ${candidate.company}` : ''}
                  </span>
                </p>
              </div>

              {!hideScores && (
                <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="42" stroke="var(--color-accent-200)" strokeWidth="8" fill="transparent" />
                    <circle
                      cx="50" cy="50" r="42"
                      stroke="var(--color-accent)" strokeWidth="8" fill="transparent"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      strokeDashoffset={RING_CIRCUMFERENCE * (1 - candidate.score / 100)}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1.3s var(--ease-organic)' }}
                    />
                  </svg>
                  <div style={ringValueStyle}>{candidate.score}</div>
                </div>
              )}
            </div>

            {/* Lifestyle tags */}
            {tags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {tags.map((t) => (
                  <span key={t} className="badge badge-neutral">{t}</span>
                ))}
              </div>
            )}

            {/* Bio */}
            <p style={bioStyle}>{candidate.bio || 'No biography provided.'}</p>

            {/* Footer */}
            <div style={footerStyle}>
              <span style={locationStyle}>
                <MapPin size={12} strokeWidth={2.75} />
                {candidate.location || 'Lahore'}
              </span>

              {reqStatus === 'accepted' && (
                <span style={matchedStyle}>
                  <Check size={12} strokeWidth={2.75} /> Matched
                </span>
              )}
              {reqStatus === 'pending' && <span style={pendingStyle}>Pending</span>}
              {!reqStatus && <span style={viewProfileStyle}>View profile →</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'calc(var(--radius-lg) * 1.15)',
  padding: '26px',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
  boxShadow: 'var(--shadow-sm)',
  transition: 'transform 0.5s var(--ease-organic), box-shadow 0.5s ease',
};

const avatarStyle: React.CSSProperties = {
  width: '62px',
  height: '62px',
  borderRadius: 'var(--radius-pill)',
  objectFit: 'cover',
  flexShrink: 0,
};

const nameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontWeight: 400,
  fontSize: '1.1875rem',
  color: 'var(--color-text)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const metaStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--color-neutral-600)',
  marginTop: '0.2rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  flexWrap: 'wrap',
};

const ringValueStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.8125rem',
  fontWeight: 700,
  color: 'var(--color-text)',
};

const bioStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--color-neutral-700)',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  lineHeight: 1.6,
  margin: 0,
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTop: '1px solid var(--color-divider)',
  paddingTop: '16px',
  marginTop: 'auto',
};

const locationStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--color-neutral-600)',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
};

const matchedStyle: React.CSSProperties = {
  color: 'var(--color-accent-2-700)',
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
};

const pendingStyle: React.CSSProperties = {
  color: 'var(--color-accent-800)',
  background: 'var(--color-accent-100)',
  fontSize: '0.625rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  borderRadius: 'var(--radius-pill)',
  padding: '5px 12px',
};

const viewProfileStyle: React.CSSProperties = {
  color: 'var(--color-accent-700)',
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
};

const emptyStateStyle: React.CSSProperties = {
  padding: '4rem 2rem',
  textAlign: 'center',
  color: 'var(--color-neutral-600)',
  background: 'var(--color-surface)',
  borderRadius: 'calc(var(--radius-lg) * 1.15)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.75rem',
};
