import { useState } from 'react';
import type { Student, Preferences, Hostel, User } from '../types';
import { User as UserIcon, Settings, Save } from 'lucide-react';

interface StudentProfileProps {
  currentUser: Student;
  onSave: (updatedUser: User) => void;
  hostels: Hostel[];
}

export const StudentProfile = ({ currentUser, onSave, hostels }: StudentProfileProps) => {
  const [name, setName] = useState(currentUser.name);
  const [age, setAge] = useState(currentUser.age);
  const [gender, setGender] = useState(currentUser.gender);
  const [bio, setBio] = useState(currentUser.bio);
  const [budget, setBudget] = useState(currentUser.budget);
  const [location, setLocation] = useState(currentUser.location);
  
  const [occupation, setOccupation] = useState<'student' | 'job'>(currentUser.occupation || 'student');
  const [institution, setInstitution] = useState(currentUser.institution || '');
  const [company, setCompany] = useState(currentUser.company || '');

  const [preferences, setPreferences] = useState<Preferences>({ ...currentUser.preferences });
  const [showSavedMsg, setShowSavedMsg] = useState(false);
  const [hostelId, setHostelId] = useState(currentUser.hostelId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...currentUser,
      name,
      age: Number(age),
      gender,
      bio,
      budget: Number(budget),
      location,
      occupation,
      institution: occupation === 'student' ? institution : '',
      company: occupation === 'job' ? company : '',
      preferences,
      hostelId: hostelId || undefined,
    });
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 3000);
  };

  const handlePrefChange = (key: keyof Preferences, value: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value as any,
    }));
  };

  return (
    <div className="split-layout">
      {/* Settings Navigation/Sidebar */}
      <div style={sidebarStyle} className="mobile-hide">
        <div style={sidebarHeaderStyle}>
          <UserIcon size={18} />
          <h4>Your Account</h4>
        </div>
        <div style={sidebarItemStyle(true)}>
          <Settings size={14} />
          Profile & Preferences
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Profile Settings</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Update your personal details and lifestyle habits to match with the most compatible roommates.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Section: Basic Details */}
          <h3 style={sectionTitleStyle}>Basic Information</h3>
          <div style={formGridStyle}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                className="form-input"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred City / Area</label>
              <input
                type="text"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Occupation Status</label>
              <select
                className="form-select"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value as any)}
              >
                <option value="student">Student</option>
                <option value="job">Working Professional</option>
              </select>
            </div>

            {occupation === 'student' ? (
              <div className="form-group">
                <label className="form-label">School / University (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. FAST NUCES, LUMS"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Company Name (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Systems Ltd, Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            )}

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Monthly Budget Limit (PKR)</label>
              <input
                type="number"
                className="form-input"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Current Hostel Residence</label>
              <select
                className="form-select"
                value={hostelId}
                onChange={(e) => setHostelId(e.target.value)}
              >
                <option value="">None / Not Staying in a Hostel</option>
                {hostels.map((hostel) => (
                  <option key={hostel.id} value={hostel.id}>
                    {hostel.name} ({hostel.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Bio</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself, your habits, or interests..."
              />
            </div>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid var(--border)', margin: '2rem 0' }} />

          {/* Section: Preferences */}
          <h3 style={sectionTitleStyle}>Lifestyle Preferences</h3>
          <div style={formGridStyle}>
            <div className="form-group">
              <label className="form-label">Sleep Schedule</label>
              <select
                className="form-select"
                value={preferences.sleepSchedule}
                onChange={(e) => handlePrefChange('sleepSchedule', e.target.value)}
              >
                <option value="early-bird">Early Bird</option>
                <option value="night-owl">Night Owl</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cleanliness</label>
              <select
                className="form-select"
                value={preferences.cleanliness}
                onChange={(e) => handlePrefChange('cleanliness', e.target.value)}
              >
                <option value="meticulous">Meticulous (Very Clean)</option>
                <option value="moderate">Moderate</option>
                <option value="relaxed">Relaxed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Smoking Policy</label>
              <select
                className="form-select"
                value={preferences.smoking}
                onChange={(e) => handlePrefChange('smoking', e.target.value)}
              >
                <option value="no">Non-smoker</option>
                <option value="yes">Smoker (In-room ok)</option>
                <option value="outside-only">Outside Only</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Pet Friendliness</label>
              <select
                className="form-select"
                value={preferences.pets}
                onChange={(e) => handlePrefChange('pets', e.target.value)}
              >
                <option value="no">No Pets</option>
                <option value="yes">Has/Likes Pets</option>
                <option value="likes-but-no-own">Likes pets, but has no own</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Guest Frequency Tolerance</label>
              <select
                className="form-select"
                value={preferences.guestTolerance}
                onChange={(e) => handlePrefChange('guestTolerance', e.target.value)}
              >
                <option value="rarely">Rarely (Mainly study environment)</option>
                <option value="weekends">Weekends Only</option>
                <option value="anytime">Anytime / Open house</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={footerStyle}>
            {showSavedMsg && (
              <span style={{ color: 'var(--success)', fontSize: '0.875rem', fontWeight: 500 }}>
                Profile and preferences saved successfully!
              </span>
            )}
            <button type="submit" className="btn btn-primary" style={{ marginLeft: 'auto' }}>
              <Save size={16} />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles
const sidebarStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const sidebarHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem',
  borderBottom: '1px solid var(--border)',
  marginBottom: '0.5rem',
};

const sidebarItemStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.625rem 0.875rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  borderRadius: 'var(--radius)',
  backgroundColor: isActive ? 'var(--secondary)' : 'transparent',
  color: isActive ? 'var(--foreground)' : 'var(--muted)',
  cursor: 'pointer',
});

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  marginBottom: '1.25rem',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '0.5rem',
  color: 'var(--foreground)',
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
