import React, { useState } from 'react';
import { Save } from 'lucide-react';
import type { Student, Preferences, User } from '../../types';

interface LifestyleTabProps {
  currentUser: Student;
  onSave: (updatedFields: Partial<User>) => void;
}

export const LifestyleTab = ({ currentUser, onSave }: LifestyleTabProps) => {
  const [preferences, setPreferences] = useState<Preferences>({
    sleepSchedule: currentUser.preferences?.sleepSchedule || 'flexible',
    cleanliness: currentUser.preferences?.cleanliness || 'moderate',
    smoking: currentUser.preferences?.smoking || 'no',
    pets: currentUser.preferences?.pets || 'no',
    guestTolerance: currentUser.preferences?.guestTolerance || 'weekends',
    noiseTolerance: currentUser.preferences?.noiseTolerance || 'moderate',
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
            <label className="form-label">Sleep Schedule</label>
            <select className="form-select" value={preferences.sleepSchedule} onChange={(e) => handlePrefChange('sleepSchedule', e.target.value)}>
              <option value="flexible">Flexible</option>
              <option value="early-bird">Early Bird</option>
              <option value="night-owl">Night Owl</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Cleanliness Level</label>
            <select className="form-select" value={preferences.cleanliness} onChange={(e) => handlePrefChange('cleanliness', e.target.value)}>
              <option value="moderate">Moderate</option>
              <option value="meticulous">Meticulous</option>
              <option value="relaxed">Relaxed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Smoking Allowed</label>
            <select className="form-select" value={preferences.smoking} onChange={(e) => handlePrefChange('smoking', e.target.value)}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
              <option value="outside-only">Outside Only</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Pet Tolerance</label>
            <select className="form-select" value={preferences.pets} onChange={(e) => handlePrefChange('pets', e.target.value)}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
              <option value="likes-but-no-own">Likes pets, but no own pets</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Guest Tolerance</label>
            <select className="form-select" value={preferences.guestTolerance} onChange={(e) => handlePrefChange('guestTolerance', e.target.value)}>
              <option value="weekends">Weekends Only</option>
              <option value="rarely">Rarely</option>
              <option value="anytime">Anytime</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Noise Tolerance</label>
            <select className="form-select" value={preferences.noiseTolerance} onChange={(e) => handlePrefChange('noiseTolerance', e.target.value)}>
              <option value="moderate">Moderate</option>
              <option value="silent">Silent</option>
              <option value="lively">Lively</option>
            </select>
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
