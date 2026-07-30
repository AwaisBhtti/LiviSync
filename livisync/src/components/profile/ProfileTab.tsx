import React, { useState } from 'react';
import { Save } from 'lucide-react';
import type { Student, Hostel, User } from '../../types';

interface ProfileTabProps {
  currentUser: Student;
  hostels: Hostel[];
  onSave: (updatedFields: Partial<User>) => void;
}

export const ProfileTab = ({ currentUser, hostels, onSave }: ProfileTabProps) => {
  const [name, setName] = useState(currentUser.name);
  const [age, setAge] = useState(currentUser.age);
  const [gender, setGender] = useState(currentUser.gender);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [occupation, setOccupation] = useState<'student' | 'job'>(currentUser.occupation || 'student');
  const [institution, setInstitution] = useState(currentUser.institution || '');
  const [company, setCompany] = useState(currentUser.company || '');
  const [budget, setBudget] = useState(currentUser.budget);
  const [hostelId, setHostelId] = useState(currentUser.hostelId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      age: Number(age),
      gender,
      bio,
      budget: Number(budget),
      location,
      occupation,
      institution: occupation === 'student' ? institution : '',
      company: occupation === 'job' ? company : '',
      hostelId: hostelId || undefined,
    });
  };

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>Basic &amp; Personal Info</h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
        Update your general details, work, education, and budgets here.
      </p>

      <form onSubmit={handleSubmit}>
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
            placeholder="Share a bit about yourself, interests, major..."
          />
        </div>

        <h3 style={sectionTitleStyle}>Work &amp; Education</h3>
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

        <h3 style={sectionTitleStyle}>Living &amp; Rent Preferences</h3>
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

        <div style={footerStyle}>
          <button type="submit" className="btn btn-primary" style={{ marginLeft: 'auto' }}>
            <Save size={16} /> Save Profile Settings
          </button>
        </div>
      </form>
    </div>
  );
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  marginTop: '1.5rem',
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
