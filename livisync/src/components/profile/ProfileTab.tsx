import React, { useState, useEffect, useRef } from 'react';
import { Save, Camera, Loader2, ChevronDown } from 'lucide-react';
import type { Student, Hostel, User } from '../../types';
import { CustomSelect } from '../ui/CustomSelect';
import { useAppSelector } from '../../store/store';
import { API_BASE_URL } from '../../config';
import { DEFAULT_AVATAR } from '../../styles/commonStyles';

const LAHORE_INSTITUTES = [
  "Other",
  // Public Universities
  "University of the Punjab (PU)",
  "University of Engineering and Technology (UET), Lahore",
  "Government College University (GCU), Lahore",
  "King Edward Medical University (KEMU)",
  "University of Health Sciences (UHS)",
  "Punjab University College of Information Technology (PUCIT)",
  "Lahore College for Women University (LCWU)",
  "University of Veterinary and Animal Sciences (UVAS)",
  "Kinnaird College for Women",
  "National College of Arts (NCA)",
  "Institute of Business Administration (IBA), Punjab University",
  // Private Universities
  "Lahore University of Management Sciences (LUMS)",
  "University of Central Punjab (UCP)",
  "University of Lahore (UOL)",
  "Beaconhouse National University (BNU)",
  "Forman Christian College (FCCU)",
  "University of Management and Technology (UMT)",
  "COMSATS University Islamabad, Lahore Campus",
  "National University of Computer and Emerging Sciences (FAST-NUCES), Lahore",
  "Superior University",
  "Riphah International University, Lahore Campus",
  "Minhaj University Lahore",
  "Hajvery University",
  "Lahore Garrison University",
  "Imperial College of Business Studies",
  "University of South Asia (USA)",
  "Al-Khair University",
  // Medical & Health Sciences
  "Allama Iqbal Medical College",
  "Fatima Jinnah Medical University",
  "Services Institute of Medical Sciences",
  "Shalamar Medical and Dental College",
  "Akhtar Saeed Medical and Dental College",
  "CMH Lahore Medical College",
  "Rashid Latif Medical College",
  "Central Park Medical College",
  "Punjab Dental Hospital & College",
  // Engineering & Technical
  "Government College of Technology, Lahore",
  "Punjab Tianjin University of Technology",
  // Business & Specialized
  "Lahore School of Economics (LSE)",
  "Hailey College of Commerce (Punjab University)",
  "Punjab University Law College",
  // Colleges
  "Government MAO College",
  "Islamia College Railway Road",
  "Government Postgraduate College",
  "Aitchison College",
  "Lahore Grammar School",
  "Punjab College",
  "Superior College",
  // Arts & Design
  "Pakistan Institute of Fashion and Design (PIFD)"
];

const PAKISTANI_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Sargodha",
  "Bahawalpur",
  "Sukkur",
  "Jhelum",
  "Abbottabad"
];

interface ProfileTabProps {
  currentUser: Student;
  hostels: Hostel[];
  onSave: (updatedFields: Partial<User>) => void;
}

export const ProfileTab = ({ currentUser, hostels, onSave }: ProfileTabProps) => {
  const token = useAppSelector((state) => state.auth.token);
  const [name, setName] = useState(currentUser.name);
  const [age, setAge] = useState(currentUser.age || '');
  const [gender, setGender] = useState<any>(currentUser.gender || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [occupation, setOccupation] = useState<'student' | 'job'>(currentUser.occupation || 'student');
  const [company, setCompany] = useState(currentUser.company || '');
  const [budget, setBudget] = useState(currentUser.budget || '');
  const [hostelId, setHostelId] = useState(currentUser.hostelId || '');
  const [photo, setPhoto] = useState(currentUser.photo || '');
  const [uploading, setUploading] = useState(false);

  const [selectedInstitute, setSelectedInstitute] = useState<string>(() => {
    if (!currentUser.institution) return 'Other';
    if (LAHORE_INSTITUTES.includes(currentUser.institution)) {
      return currentUser.institution;
    }
    return 'Other';
  });
  const [customInstitute, setCustomInstitute] = useState<string>(() => {
    if (!currentUser.institution) return '';
    if (LAHORE_INSTITUTES.includes(currentUser.institution)) {
      return '';
    }
    return currentUser.institution;
  });
  const [isInstDropdownOpen, setIsInstDropdownOpen] = useState(false);
  const [instSearch, setInstSearch] = useState('');
  const instDropdownRef = useRef<HTMLDivElement>(null);

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (instDropdownRef.current && !instDropdownRef.current.contains(event.target as Node)) {
        setIsInstDropdownOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredInstitutes = LAHORE_INSTITUTES.filter(inst =>
    inst.toLowerCase().includes(instSearch.toLowerCase())
  );

  const filteredCities = PAKISTANI_CITIES.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/students/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Upload failed');
      }
      setPhoto(data.url);
    } catch (err: any) {
      alert(err.message || 'Error uploading profile picture');
    } finally {
      setUploading(false);
    }
  };

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
      institution: occupation === 'student'
        ? (selectedInstitute === 'Other' ? customInstitute : selectedInstitute)
        : '',
      company: occupation === 'job' ? company : '',
      hostelId: hostelId || undefined,
      photo: photo || undefined,
    });
  };

  return (
    <div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
      <h2 style={{ marginBottom: '0.5rem' }}>Basic &amp; Personal Info</h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
        Update your general details, work, education, and budgets here.
      </p>

      {/* Profile Picture Upload Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', padding: '1.25rem', backgroundColor: 'var(--card-hover)', borderRadius: '16px' }}>
        <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
          <img
            src={photo || DEFAULT_AVATAR}
            alt="Profile Avatar"
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
          />
          {uploading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%' }}>
              <Loader2 className="animate-spin" size={24} style={{ color: 'white' }} />
            </div>
          )}
        </div>
        <div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)' }} className="btn-pulse">
            <Camera size={16} />
            {uploading ? 'Uploading...' : 'Upload Picture'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem', margin: 0 }}>
            Supported formats: JPG, PNG. Image will be saved once you save your profile settings below.
          </p>
        </div>
      </div>

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

          <div className="form-group" ref={cityDropdownRef} style={{ position: 'relative' }}>
            <label className="form-label">City Location <span style={{ color: '#a33b2a' }}>*</span></label>
            <button
              type="button"
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="form-input"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'left',
                background: 'var(--color-bg)',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <span>{location || 'Select City'}</span>
              <ChevronDown size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
            </button>

            {isCityDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'var(--card)',
                border: '1px solid var(--border-solid)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 200,
                padding: '0.5rem',
                marginTop: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}>
                {/* Search box inside dropdown */}
                <input
                  type="text"
                  placeholder="Search city..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: '0.85rem',
                    border: '1px solid var(--border-solid)',
                    borderRadius: '8px',
                    background: 'var(--color-bg)',
                    color: 'var(--foreground)',
                    outline: 'none',
                    marginBottom: '0.25rem',
                    boxSizing: 'border-box'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />

                {/* Options list */}
                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => {
                      const isSelected = location === city;
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setLocation(city);
                            setIsCityDropdownOpen(false);
                            setCitySearch('');
                          }}
                          style={{
                            padding: '0.5rem',
                            fontSize: '0.825rem',
                            textAlign: 'left',
                            border: 'none',
                            borderRadius: '6px',
                            background: isSelected ? 'var(--color-bg)' : 'transparent',
                            color: isSelected ? 'var(--primary)' : 'var(--foreground)',
                            cursor: 'pointer',
                            width: '100%',
                            fontWeight: isSelected ? 600 : 500,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-bg)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {city}
                        </button>
                      );
                    })
                  ) : (
                    <div style={{ padding: '0.5rem', fontSize: '0.825rem', color: 'var(--muted)', textAlign: 'center' }}>
                      No cities matched.
                    </div>
                  )}
                </div>
              </div>
            )}
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
            <div className="form-group" ref={instDropdownRef} style={{ position: 'relative' }}>
              <label className="form-label">Educational Institution</label>
              <button
                type="button"
                onClick={() => setIsInstDropdownOpen(!isInstDropdownOpen)}
                className="form-input"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'left',
                  background: 'var(--color-bg)',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedInstitute === 'Other' ? (customInstitute ? `Other: ${customInstitute}` : 'Other (Custom...)') : selectedInstitute}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              </button>

              {isInstDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--card)',
                  border: '1px solid var(--border-solid)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 200,
                  padding: '0.5rem',
                  marginTop: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}>
                  {/* Search box inside dropdown */}
                  <input
                    type="text"
                    placeholder="Search institute..."
                    value={instSearch}
                    onChange={(e) => setInstSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      fontSize: '0.85rem',
                      border: '1px solid var(--border-solid)',
                      borderRadius: '8px',
                      background: 'var(--color-bg)',
                      color: 'var(--foreground)',
                      outline: 'none',
                      marginBottom: '0.25rem',
                      boxSizing: 'border-box'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />

                  {/* Options list */}
                  <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {filteredInstitutes.length > 0 ? (
                      filteredInstitutes.map((inst) => {
                        const isSelected = selectedInstitute === inst;
                        return (
                          <button
                            key={inst}
                            type="button"
                            onClick={() => {
                              setSelectedInstitute(inst);
                              setIsInstDropdownOpen(false);
                              setInstSearch('');
                            }}
                            style={{
                              padding: '0.5rem',
                              fontSize: '0.825rem',
                              textAlign: 'left',
                              border: 'none',
                              borderRadius: '6px',
                              background: isSelected ? 'var(--primary)' : 'transparent',
                              color: isSelected ? 'white' : 'var(--foreground)',
                              cursor: 'pointer',
                              width: '100%',
                              fontWeight: isSelected ? 600 : 500,
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-bg)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {inst}
                          </button>
                        );
                      })
                    ) : (
                      <div style={{ padding: '0.5rem', fontSize: '0.825rem', color: 'var(--muted)', textAlign: 'center' }}>
                        No institutions matched. Select "Other" at the top to write your own.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Show custom input if "Other" is selected */}
              {selectedInstitute === 'Other' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your custom institute name..."
                    value={customInstitute}
                    onChange={(e) => setCustomInstitute(e.target.value)}
                    required
                  />
                </div>
              )}
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
