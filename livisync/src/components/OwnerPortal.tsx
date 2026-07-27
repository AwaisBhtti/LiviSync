import { API_BASE_URL } from '../config';
import { useState } from 'react';
import type { User, Hostel } from '../types';
import { Plus, Edit2, Trash2, Building, MapPin, ListPlus, X, Info } from 'lucide-react';
import { RoomListing } from './RoomListing';

interface OwnerPortalProps {
  currentUser: User;
  hostels: Hostel[];
  onAddHostel?: (hostel: Hostel) => void;
  onEditHostel?: (hostel: Hostel) => void;
  onDeleteHostel?: (hostelId: string) => void;
}

const BUILTIN_AMENITIES = [
  'Wifi',
  'AC',
  'Laundry',
  'Mess/Food',
  'Gym',
  'Geyser/Hot Water',
  'Security/CCTV',
  'Power Backup'
];

export const OwnerPortal = ({
  currentUser,
  hostels,
  onAddHostel,
  onEditHostel,
  onDeleteHostel,
}: OwnerPortalProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null);
  
  // Redirection state to manage rooms
  const [selectedHostelForRooms, setSelectedHostelForRooms] = useState<Hostel | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [electricityBillIncluded, setElectricityBillIncluded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('livisync_token') || '';

    try {
      const response = await fetch(`${API_BASE_URL}/owners/upload-image`, {
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
      alert(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  // Filter hostels owned by this user
  const myHostels = hostels.filter(
    (h) => h.ownerId === currentUser.id
  );

  const resetForm = () => {
    setName('');
    setLocation('');
    setDescription('');
    setPhoto('');
    setSelectedAmenities([]);
    setElectricityBillIncluded(false);
    setEditingHostel(null);
  };

  const handleEditClick = (hostel: Hostel) => {
    setEditingHostel(hostel);
    setName(hostel.name);
    setLocation(hostel.location);
    setDescription(hostel.description);
    setPhoto(hostel.photo || '');
    setSelectedAmenities(hostel.amenities);
    setElectricityBillIncluded(hostel.electricityBillIncluded || false);
    setShowAddForm(true);
  };

  const handleAmenityToggle = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hostelData: Hostel = {
      id: editingHostel ? editingHostel.id : `hostel_${Date.now()}`,
      name,
      location,
      description,
      photo,
      electricityBillIncluded,
      amenities: selectedAmenities,
      rooms: editingHostel?.rooms || [],
      currentOccupants: editingHostel?.currentOccupants || [],
      ownerId: currentUser.id,
      isVerified: editingHostel ? editingHostel.isVerified : false,
    };

    const token = localStorage.getItem('livisync_token') || '';

    try {
      if (editingHostel) {
        if (onEditHostel) onEditHostel(hostelData);
        alert('Hostel details updated successfully!');
        resetForm();
        setShowAddForm(false);
      } else {
        // Create new hostel listing
        const response = await fetch(`${API_BASE_URL}/owners/hostels`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: hostelData.name,
            location: hostelData.location,
            description: hostelData.description,
            photo: hostelData.photo,
            electricity_bill_included: hostelData.electricityBillIncluded,
            amenities: hostelData.amenities
          })
        });
        
        const data = await response.json();
        if (!response.ok) {
          const errMsg = Array.isArray(data.detail)
            ? data.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join('\n')
            : data.detail || 'Failed to create hostel';
          throw new Error(errMsg);
        }

        const createdHostel: Hostel = {
          id: data.id,
          name: data.name,
          location: data.location,
          description: data.description,
          photo: data.photo,
          electricityBillIncluded: data.electricity_bill_included,
          amenities: data.amenities ? data.amenities.map((a: any) => typeof a === 'string' ? a : (a.amenity || '')) : [],
          rooms: [],
          isVerified: data.is_verified,
          ownerId: data.owner_id
        };

        if (onAddHostel) onAddHostel(createdHostel);
        resetForm();
        setShowAddForm(false);

        // Redirect to Room management view for this newly listed hostel
        setSelectedHostelForRooms(createdHostel);
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred listing hostel');
    }
  };

  const handleDeleteClick = (hostelId: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      if (onDeleteHostel) onDeleteHostel(hostelId);
    }
  };

  const getPriceRangeString = (hostel: Hostel) => {
    if (!hostel.rooms || hostel.rooms.length === 0) return 'Rooms not listed yet';
    const prices = hostel.rooms.map(r => r.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (minPrice === maxPrice) return `PKR ${minPrice.toLocaleString()} / month`;
    return `PKR ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} / month`;
  };

  const token = localStorage.getItem('livisync_token') || '';

  // Render Room Listing Manager if selectedHostelForRooms is not null
  if (selectedHostelForRooms) {
    return (
      <RoomListing
        hostel={selectedHostelForRooms}
        token={token}
        onBack={() => {
          setSelectedHostelForRooms(null);
          // Simple window reload or dispatcher reload to get latest hostels with rooms
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerSectionStyle}>
        <div>
          <h2>Hostel Management Portal</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
            Manage your properties, edit details, and add new listings.
          </p>
        </div>
        {!showAddForm && (
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
            <Plus size={16} /> Add New Hostel
          </button>
        )}
      </div>

      {showAddForm ? (
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>{editingHostel ? 'Edit Hostel Details' : 'Create New Hostel Listing'}</h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={formGridStyle}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Hostel Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Royal Student Hostel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Location / Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sector H-12, Islamabad"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Hostel Cover Photo</label>
              <p style={{ color: 'var(--muted)', fontSize: '0.75rem', margin: '0 0 0.5rem 0' }}>
                💡 <em>Upload a single clear photo showing the front view or main entrance of the building.</em>
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                required={!photo}
                style={{ width: '100%' }}
              />
              {uploading && <span style={{ color: 'var(--primary)', fontSize: '0.85rem', display: 'block', marginTop: '0.25rem' }}>Uploading to Cloudflare R2...</span>}
              {photo && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img src={photo} alt="Hostel Cover" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                </div>
              )}
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="electricityBillIncluded"
                checked={electricityBillIncluded}
                onChange={(e) => setElectricityBillIncluded(e.target.checked)}
              />
              <label htmlFor="electricityBillIncluded" style={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                Electricity Bill Included in Rent (Applies to all rooms in this hostel)
              </label>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Provide details about rooms, facilities, mess, timing constraints etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" style={{ marginBottom: '0.75rem' }}>Amenities (Select all that apply)</label>
              <div style={amenityTagsGridStyle}>
                {BUILTIN_AMENITIES.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity);
                  return (
                    <div
                      key={amenity}
                      onClick={() => handleAmenityToggle(amenity)}
                      style={amenityTagStyle(isChecked)}
                    >
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'flex-end', marginTop: '1rem' }}>
              {editingHostel && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  onClick={() => {
                    setSelectedHostelForRooms(editingHostel);
                    setShowAddForm(false);
                    resetForm();
                  }}
                >
                  <ListPlus size={14} /> Edit Rooms
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingHostel ? 'Save Changes' : 'Next: Add Rooms'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={listContainerStyle}>
          {myHostels.length === 0 ? (
            <div className="card" style={emptyCardStyle}>
              <Building size={48} color="var(--muted)" style={{ marginBottom: '1rem' }} />
              <h4>No Hostels Registered</h4>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
                Start by creating your first hostel listing on the platform.
              </p>
              <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                <Plus size={16} /> Add First Hostel
              </button>
            </div>
          ) : (
            <div style={gridStyle}>
              {myHostels.map((hostel) => (
                <div key={hostel.id} className="card" style={hostelCardStyle}>
                  <img src={hostel.photo} alt={hostel.name} style={imageStyle} />
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.125rem' }}>{hostel.name}</h4>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEditClick(hostel)}
                          style={actionButtonStyle}
                          title="Edit Details"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(hostel.id)}
                          style={{ ...actionButtonStyle, color: 'var(--danger)' }}
                          title="Delete Listing"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div style={metaGroupStyle}>
                      <div style={metaItemStyle}>
                        <MapPin size={14} />
                        <span>{hostel.location}</span>
                      </div>
                    </div>

                    <p style={descStyle}>{hostel.description}</p>

                    {hostel.rooms && hostel.rooms.length === 0 && (
                      <div style={warningBannerStyle}>
                        <Info size={14} />
                        <span>Needs Rooms to be Verified</span>
                      </div>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Rent:</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{getPriceRangeString(hostel)}</span>
                      </div>
                      
                      <button
                        onClick={() => setSelectedHostelForRooms(hostel)}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        <ListPlus size={14} /> Rooms ({hostel.rooms?.length || 0})
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const headerSectionStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '1rem',
  borderBottom: '1px solid var(--border)',
};

const formGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '1.25rem',
};

const amenityTagsGridStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
};

const amenityTagStyle = (isSelected: boolean): React.CSSProperties => ({
  padding: '0.5rem 1rem',
  borderRadius: 'var(--radius)',
  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
  backgroundColor: isSelected ? 'var(--secondary)' : 'var(--card)',
  color: isSelected ? 'var(--foreground)' : 'var(--muted)',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'var(--transition)',
  userSelect: 'none',
});

const listContainerStyle: React.CSSProperties = {
  marginTop: '0.5rem',
};

const emptyCardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4rem 2rem',
  textAlign: 'center',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
  gap: '1.5rem',
};

const hostelCardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '180px',
  objectFit: 'cover',
};

const actionButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  borderRadius: '6px',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--card)',
  cursor: 'pointer',
  color: 'var(--muted)',
  transition: 'var(--transition)',
};

const metaGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  marginBottom: '0.75rem',
};

const metaItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  fontSize: '0.8125rem',
  color: 'var(--muted)',
};

const descStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--foreground)',
  marginBottom: '1.25rem',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const warningBannerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  padding: '0.5rem',
  borderRadius: 'var(--radius)',
  color: 'var(--destructive)',
  fontSize: '0.75rem',
  fontWeight: 600,
  marginBottom: '1rem',
};
