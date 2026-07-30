/** RoommateFilters — left sidebar filters for the Roommate Finder. */
import type { Hostel } from '../../types';
import { SlidersHorizontal } from 'lucide-react';

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
  <div className="card" style={{ padding: '1.25rem', height: 'fit-content' }}>
    <h3
      style={{
        fontSize: '0.9rem',
        fontWeight: 700,
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.5rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <SlidersHorizontal size={14} />
      Filters
    </h3>

    <div className="form-group">
      <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
        Max Budget: PKR {maxBudget.toLocaleString()}
      </label>
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

    <div className="form-group">
      <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
        Gender
      </label>
      <select
        className="form-select"
        value={filterGender}
        onChange={(e) => onGenderChange(e.target.value)}
      >
        <option value="all">Any Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
    </div>

    <div className="form-group">
      <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
        Sleep Schedule
      </label>
      <select
        className="form-select"
        value={filterSleep}
        onChange={(e) => onSleepChange(e.target.value)}
      >
        <option value="all">Any Sleep Cycle</option>
        <option value="early-bird">Early Bird</option>
        <option value="night-owl">Night Owl</option>
        <option value="flexible">Flexible</option>
      </select>
    </div>

    <div className="form-group">
      <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
        Cleanliness
      </label>
      <select
        className="form-select"
        value={filterCleanliness}
        onChange={(e) => onCleanlinessChange(e.target.value)}
      >
        <option value="all">Any Cleanliness</option>
        <option value="meticulous">Meticulous</option>
        <option value="moderate">Moderate</option>
        <option value="relaxed">Relaxed</option>
      </select>
    </div>

    <div className="form-group">
      <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
        Current Hostel
      </label>
      <select
        className="form-select"
        value={filterHostel}
        onChange={(e) => onHostelChange(e.target.value)}
      >
        <option value="all">Any Hostel</option>
        {hostels.map((hostel) => (
          <option key={hostel.id} value={hostel.id}>
            {hostel.name}
          </option>
        ))}
      </select>
    </div>
  </div>
);
