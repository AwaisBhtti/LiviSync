import { useState } from 'react';
import type { Student, Preferences, Hostel, User } from '../types';
import { User as UserIcon, Settings, Save, ShieldAlert } from 'lucide-react';

interface StudentProfileProps {
  currentUser: Student;
  onSave: (updatedUser: User) => void;
  hostels: Hostel[];
  users: User[];
  onUnblockUser: (targetId: string) => void;
}

export const StudentProfile = ({ currentUser, onSave, hostels, users, onUnblockUser }: StudentProfileProps) => {
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
  const [activeSection, setActiveSection] = useState<'profile' | 'blocklist'>(() => {
    return (sessionStorage.getItem('livisync_profile_section') as 'profile' | 'blocklist') || 'profile';
  });

  const handleSectionChange = (section: 'profile' | 'blocklist') => {
    setActiveSection(section);
    sessionStorage.setItem('livisync_profile_section', section);
  };

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
      <div style={sidebarStyle} className="mobile-hide">
        <div style={sidebarHeaderStyle}>
          <UserIcon size={18} />
          <h4>Your Account</h4>
        </div>
        <div style={sidebarItemStyle(activeSection === 'profile')} onClick={() => handleSectionChange('profile')} className="sidebar-tab">
          <Settings size={14} />
          Profile & Preferences
        </div>
        <div style={sidebarItemStyle(activeSection === 'blocklist')} onClick={() => handleSectionChange('blocklist')} className="sidebar-tab">
          <ShieldAlert size={14} />
          Blocked Users
        </div>
      </div>

      {/* Main Settings Form */}
      {activeSection === 'profile' ? (
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
                  min={16}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value as any)} required>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">City Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="e.g. Islamabad, Lahore"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label">Biography / About Me</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a bit about yourself, interests, major, and what kind of roommate you seek..."
              />
            </div>

            {/* Section: Work & Study */}
            <h3 style={sectionTitleStyle}>Work & Education</h3>
            <div style={formGridStyle}>
              <div className="form-group">
                <label className="form-label">Occupation</label>
                <select className="form-select" value={occupation} onChange={(e) => setOccupation(e.target.value as any)}>
                  <option value="student">Student</option>
                  <option value="job">Job Holder</option>
                </select>
              </div>

              {occupation === 'student' ? (
                <div className="form-group">
                  <label className="form-label">Educational Institution</label>
                  <input
                    type="text"
                    className="form-input"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. NUST, FAST"
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Systems Ltd, DevSinc"
                  />
                </div>
              )}
            </div>

            {/* Section: Budget and Hostel */}
            <h3 style={sectionTitleStyle}>Living Preferences</h3>
            <div style={formGridStyle}>
              <div className="form-group">
                <label className="form-label">Max Budget Limit (PKR / mo)</label>
                <input
                  type="number"
                  className="form-input"
                  min={10000}
                  max={200000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Hostel Residence (Optional)</label>
                <select className="form-select" value={hostelId} onChange={(e) => setHostelId(e.target.value)}>
                  <option value="">Not Residing in Hostel / Searching</option>
                  {hostels.map((h) => (
                    <option key={h.id} value={h.id}>{h.name} ({h.location})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section: Preferences & Habits */}
            <h3 style={sectionTitleStyle}>Lifestyle Habits</h3>
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
                <select className="form-select" value={preferences.noiseTolerance || 'moderate'} onChange={(e) => handlePrefChange('noiseTolerance', e.target.value)}>
                  <option value="moderate">Moderate</option>
                  <option value="silent">Silent</option>
                  <option value="lively">Lively</option>
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
      ) : (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Blocked Users</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Users you have blocked cannot send you roommate connection requests.
          </p>

          {currentUser.blockedUsers.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>You have not blocked any users.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {currentUser.blockedUsers.map((blockedId) => {
                const blockedUser = users.find(u => u.id === blockedId);
                return (
                  <div key={blockedId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={blockedUser?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80'} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{blockedUser?.name || 'Unknown User'}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{blockedUser?.email || 'student'}</span>
                      </div>
                    </div>
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => onUnblockUser(blockedId)}>
                      Unblock
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
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
