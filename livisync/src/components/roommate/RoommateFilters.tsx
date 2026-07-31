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
  onHideFilters?: () => void;
  onClearFilters: () => void;
}

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
  onHideFilters,
  onClearFilters,
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
      className="card"
      style={{
        padding: '1.25rem',
        height: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        overflow: 'visible',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SlidersHorizontal size={14} style={{ color: 'var(--muted)' }} />
          <h3 style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600 }}>Filters</h3>
        </div>
        {onHideFilters && (
          <button
            onClick={onHideFilters}
            style={{
              background: 'none',
              border: 'none',
              color: MUTED,
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(51, 39, 33, 0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Hide
          </button>
        )}
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

      {/* Clear Filters Button */}
      <button
        onClick={onClearFilters}
        style={{
          width: '100%',
          padding: '0.625rem 1rem',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#b55c3c',
          background: 'transparent',
          border: '1px solid #b55c3c',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '0.5rem',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(181, 92, 60, 0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        Clear Filters
      </button>
    </div>
  );
};
