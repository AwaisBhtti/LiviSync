import React, { useState } from 'react';
import { Save } from 'lucide-react';
import type { Student, Hostel, User } from '../../types';
import { CustomSelect } from '../ui/CustomSelect';

interface ProfileTabProps {
  currentUser: Student;
  hostels: Hostel[];
  onSave: (updatedFields: Partial<User>) => void;
}

export const ProfileTab = ({ currentUser, hostels, onSave }: ProfileTabProps) => {
  const [name, setName] = useState(currentUser.name);
  const [age, setAge] = useState(currentUser.age || '');
  const [gender, setGender] = useState<any>(currentUser.gender || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [occupation, setOccupation] = useState<'student' | 'job'>(currentUser.occupation || 'student');
  const [institution, setInstitution] = useState(currentUser.institution || '');
  const [company, setCompany] = useState(currentUser.company || '');
  const [budget, setBudget] = useState(currentUser.budget || '');
  const [hostelId, setHostelId] = useState(currentUser.hostelId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      age: age === '' ? undefined : Number(age),
      gender: gender || undefined,
      bio,
      budget: budget === '' ? undefined : Number(budget),
      location: location || undefined,
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
            <label className="form-label">Full Name <span style={{ color: '#a33b2a' }}>*</span></label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Age <span style={{ color: '#a33b2a' }}>*</span></label>
            <input
              type="number"
              className="form-input"
              min={16}
              max={100}
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gender <span style={{ color: '#a33b2a' }}>*</span></label>
            <CustomSelect
              value={gender}
              onChange={(val) => setGender(val as any)}
              placeholder="Select Gender"
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }
              ]}
            />
          </div>

          <div className="form-group">
            <label className="form-label">City Location <span style={{ color: '#a33b2a' }}>*</span></label>
            <CustomSelect
              value={location}
              onChange={setLocation}
              placeholder="Select City"
              options={[
                { value: 'Lahore', label: 'Lahore' }
              ]}
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
            <CustomSelect
              value={occupation}
              onChange={(val) => setOccupation(val as any)}
              options={[
                { value: 'student', label: 'Student' },
                { value: 'job', label: 'Job Holder' }
              ]}
            />
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
            <label className="form-label">Max Budget Limit (PKR / mo) <span style={{ color: '#a33b2a' }}>*</span></label>
            <input
              type="number"
              className="form-input"
              min={10000}
              max={200000}
              value={budget}
              onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
              Note: Just visible to you.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Current Hostel Residence</label>
            <CustomSelect
              value={hostelId}
              onChange={setHostelId}
              placeholder="Not Residing in Hostel / Searching"
              options={[
                { value: '', label: 'Not Residing in Hostel / Searching' },
                ...hostels.map((h) => ({
                  value: h.id,
                  label: `${h.name} (${h.location})`
                }))
              ]}
            />
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
