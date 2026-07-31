import type { Hostel } from '../../types';
import { SlidersHorizontal } from 'lucide-react';
import { CustomSelect } from '../ui/CustomSelect';

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

const CARD_BG     = '#f0ece6'; // Linen beige from logo theme
const CARD_BORDER = '#e0d6cb';
const TEXT        = '#332721'; // Espresso brown text
const MUTED       = '#8c7b70'; // Warm beige

const labelStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 700,
  color: MUTED,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  marginBottom: '0.35rem',
  display: 'block',
};

const customSelectStyle: React.CSSProperties = {
  background: '#faf8f5', // Warm sand
  border: '1px solid #e0d6cb',
  color: '#332721',
  boxShadow: 'none',
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
}: RoommateFiltersProps) => {
  const genderOptions = [
    { value: 'all', label: 'Any Gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const sleepOptions = [
    { value: 'all', label: 'Any Cycle' },
    { value: 'early-bird', label: 'Early Bird' },
    { value: 'night-owl', label: 'Night Owl' },
    { value: 'flexible', label: 'Flexible' },
  ];

  const cleanlinessOptions = [
    { value: 'all', label: 'Any Level' },
    { value: 'meticulous', label: 'Meticulous' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'relaxed', label: 'Relaxed' },
  ];

  const hostelOptions = [
    { value: 'all', label: 'Any Hostel' },
    ...hostels.map((h) => ({ value: h.id, label: h.name })),
  ];

  return (
    <div
      style={{
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: '16px',
        padding: '1.25rem',
        height: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 2px 12px rgba(51, 39, 33, 0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: `1px solid ${CARD_BORDER}`, paddingBottom: '0.75rem' }}>
        <SlidersHorizontal size={13} color={MUTED} />
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: TEXT }}>Filters</span>
      </div>

      {/* Budget */}
      <div>
        <label style={labelStyle}>Max Budget</label>
        <p style={{ fontSize: '0.85rem', color: TEXT, fontWeight: 600, marginBottom: '0.4rem' }}>
          PKR {maxBudget.toLocaleString()}
        </p>
        <input
          type="range"
          min="20000"
          max="200000"
          step="5000"
          value={maxBudget}
          onChange={(e) => onMaxBudgetChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#b55c3c', cursor: 'pointer' }}
        />
      </div>

      {/* Gender */}
      <div>
        <label style={labelStyle}>Gender</label>
        <CustomSelect
          value={filterGender}
          onChange={onGenderChange}
          options={genderOptions}
          style={customSelectStyle}
        />
      </div>

      {/* Sleep */}
      <div>
        <label style={labelStyle}>Sleep Schedule</label>
        <CustomSelect
          value={filterSleep}
          onChange={onSleepChange}
          options={sleepOptions}
          style={customSelectStyle}
        />
      </div>

      {/* Cleanliness */}
      <div>
        <label style={labelStyle}>Cleanliness</label>
        <CustomSelect
          value={filterCleanliness}
          onChange={onCleanlinessChange}
          options={cleanlinessOptions}
          style={customSelectStyle}
        />
      </div>

      {/* Hostel */}
      <div>
        <label style={labelStyle}>Hostel</label>
        <CustomSelect
          value={filterHostel}
          onChange={onHostelChange}
          options={hostelOptions}
          style={customSelectStyle}
        />
      </div>
    </div>
  );
};
