import React, { useState } from 'react';
import { Save } from 'lucide-react';
import type { Student, Preferences, User } from '../../types';
import { CustomSelect } from '../ui/CustomSelect';

interface LifestyleTabProps {
  currentUser: Student;
  onSave: (updatedFields: Partial<User>) => void;
}

export const LifestyleTab = ({ currentUser, onSave }: LifestyleTabProps) => {
  const [preferences, setPreferences] = useState<Preferences>({
    sleepSchedule: (currentUser.preferences?.sleepSchedule || '') as any,
    cleanliness: (currentUser.preferences?.cleanliness || '') as any,
    smoking: (currentUser.preferences?.smoking || '') as any,
    pets: (currentUser.preferences?.pets || '') as any,
    guestTolerance: (currentUser.preferences?.guestTolerance || '') as any,
    noiseTolerance: (currentUser.preferences?.noiseTolerance || '') as any,
  });

  const handlePrefChange = (key: keyof Preferences, value: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value as any,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      preferences,
    });
  };

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>Lifestyle and Habits</h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
        These rules and routines determine your compatibility scores with other potential roommates.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={formGridStyle}>
          <div className="form-group">
            <label className="form-label">Sleep Schedule <span style={{ color: '#a33b2a' }}>*</span></label>
            <CustomSelect
              value={preferences.sleepSchedule || ''}
              onChange={(val) => handlePrefChange('sleepSchedule', val)}
              placeholder="Select Sleep Schedule"
              options={[
                { value: 'flexible', label: 'Flexible' },
                { value: 'early-bird', label: 'Early Bird' },
                { value: 'night-owl', label: 'Night Owl' }
              ]}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cleanliness Level <span style={{ color: '#a33b2a' }}>*</span></label>
            <CustomSelect
              value={preferences.cleanliness || ''}
              onChange={(val) => handlePrefChange('cleanliness', val)}
              placeholder="Select Cleanliness Level"
              options={[
                { value: 'moderate', label: 'Moderate' },
                { value: 'meticulous', label: 'Meticulous' },
                { value: 'relaxed', label: 'Relaxed' }
              ]}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Smoking Allowed <span style={{ color: '#a33b2a' }}>*</span></label>
            <CustomSelect
              value={preferences.smoking || ''}
              onChange={(val) => handlePrefChange('smoking', val)}
              placeholder="Select Smoking Rule"
              options={[
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Yes' },
                { value: 'outside-only', label: 'Outside Only' }
              ]}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pet Tolerance <span style={{ color: '#a33b2a' }}>*</span></label>
            <CustomSelect
              value={preferences.pets || ''}
              onChange={(val) => handlePrefChange('pets', val)}
              placeholder="Select Pet Rule"
              options={[
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Yes' },
                { value: 'likes-but-no-own', label: 'Likes pets, but no own pets' }
              ]}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Guest Tolerance <span style={{ color: '#a33b2a' }}>*</span></label>
            <CustomSelect
              value={preferences.guestTolerance || ''}
              onChange={(val) => handlePrefChange('guestTolerance', val)}
              placeholder="Select Guest Tolerance"
              options={[
                { value: 'weekends', label: 'Weekends Only' },
                { value: 'rarely', label: 'Rarely' },
                { value: 'anytime', label: 'Anytime' }
              ]}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Noise Tolerance <span style={{ color: '#a33b2a' }}>*</span></label>
            <CustomSelect
              value={preferences.noiseTolerance || ''}
              onChange={(val) => handlePrefChange('noiseTolerance', val)}
              placeholder="Select Noise Tolerance"
              options={[
                { value: 'moderate', label: 'Moderate' },
                { value: 'silent', label: 'Silent' },
                { value: 'lively', label: 'Lively' }
              ]}
            />
          </div>
        </div>

        <div style={footerStyle}>
          <button type="submit" className="btn btn-primary" style={{ marginLeft: 'auto' }}>
            <Save size={16} /> Save Lifestyle Preferences
          </button>
        </div>
      </form>
    </div>
  );
};

const formGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  columnGap: '1rem',
  rowGap: '0.5rem',
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginTop: '2rem',
  gap: '1rem',
};
