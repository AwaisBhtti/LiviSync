import type { Hostel } from '../../types';
import { SlidersHorizontal } from 'lucide-react';
import { colors } from '../../styles/colors';

interface RoommateFiltersProps {
  maxBudget: number;
  filterGender: string;
  filterSleep: string;
  filterCleanliness: string;
  filterHostel: string;
  hostels: Hostel[];
  onMaxBudgetChange: (val: number) => void;
  onGenderChange: (val: string) => void;
  onSleepChange: (val: string) => void;
  onCleanlinessChange: (val: string) => void;
  onHostelChange: (val: string) => void;
}

const CARD_BG     = colors.dark.card;
const CARD_BORDER = colors.dark.border;
const TEXT        = colors.dark.text;
const MUTED       = colors.dark.muted;
const INPUT_BG    = colors.dark.inputBg;
const INPUT_BORDER = colors.dark.inputBorder;

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.55rem 0.75rem',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.825rem',
  background: INPUT_BG,
  border: `1px solid ${INPUT_BORDER}`,
  borderRadius: '8px',
  color: TEXT,
  outline: 'none',
  cursor: 'pointer',
  transition: 'var(--transition)',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 700,
  color: MUTED,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  marginBottom: '0.35rem',
  display: 'block',
};

export const RoommateFilters = ({
  maxBudget,
  filterGender,
  filterSleep,
  filterCleanliness,
  filterHostel,
  hostels,
  onMaxBudgetChange,
  onGenderChange,
  onSleepChange,
  onCleanlinessChange,
  onHostelChange,
}: RoommateFiltersProps) => (
  <div
    style={{
      background: CARD_BG,
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: '16px',
      backdropFilter: 'blur(16px)',
      padding: '1.125rem',
      height: 'fit-content',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: `1px solid ${CARD_BORDER}`, paddingBottom: '0.75rem' }}>
      <SlidersHorizontal size={13} color={MUTED} />
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: TEXT }}>Filters</span>
    </div>

    {/* Budget */}
    <div>
      <label style={labelStyle}>Max Budget</label>
      <p style={{ fontSize: '0.8rem', color: TEXT, fontWeight: 600, marginBottom: '0.4rem' }}>
        PKR {maxBudget.toLocaleString()}
      </p>
      <input
        type="range"
        min="20000"
        max="200000"
        step="5000"
        value={maxBudget}
        onChange={(e) => onMaxBudgetChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
      />
    </div>

    {/* Gender */}
    <div>
      <label style={labelStyle}>Gender</label>
      <select className="rm-select" style={selectStyle} value={filterGender} onChange={(e) => onGenderChange(e.target.value)}>
        <option value="all">Any Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
    </div>

    {/* Sleep */}
    <div>
      <label style={labelStyle}>Sleep Schedule</label>
      <select className="rm-select" style={selectStyle} value={filterSleep} onChange={(e) => onSleepChange(e.target.value)}>
        <option value="all">Any Cycle</option>
        <option value="early-bird">Early Bird</option>
        <option value="night-owl">Night Owl</option>
        <option value="flexible">Flexible</option>
      </select>
    </div>

    {/* Cleanliness */}
    <div>
      <label style={labelStyle}>Cleanliness</label>
      <select className="rm-select" style={selectStyle} value={filterCleanliness} onChange={(e) => onCleanlinessChange(e.target.value)}>
        <option value="all">Any Level</option>
        <option value="meticulous">Meticulous</option>
        <option value="moderate">Moderate</option>
        <option value="relaxed">Relaxed</option>
      </select>
    </div>

    {/* Hostel */}
    <div>
      <label style={labelStyle}>Hostel</label>
      <select className="rm-select" style={selectStyle} value={filterHostel} onChange={(e) => onHostelChange(e.target.value)}>
        <option value="all">Any Hostel</option>
        {hostels.map((h) => (
          <option key={h.id} value={h.id}>{h.name}</option>
        ))}
      </select>
    </div>
  </div>
);
