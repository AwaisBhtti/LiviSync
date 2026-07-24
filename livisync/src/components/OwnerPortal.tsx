import { useState } from 'react';
import type { User, Hostel } from '../types';
import { Plus, Edit2, Trash2, Building, MapPin, DollarSign, ListPlus, X } from 'lucide-react';

interface OwnerPortalProps {
  currentUser: User;
  hostels: Hostel[];
  onAddHostel?: (hostel: Hostel) => void;
  onEditHostel?: (hostel: Hostel) => void;
  onDeleteHostel?: (hostelId: string) => void;
}

export const OwnerPortal = ({
  currentUser,
  hostels,
  onAddHostel,
  onEditHostel,
  onDeleteHostel,
}: OwnerPortalProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState('');
  
  // Room sharing states
  const [singleAvail, setSingleAvail] = useState('0');
  const [doubleAvail, setDoubleAvail] = useState('0');
  const [tripleAvail, setTripleAvail] = useState('0');

  // Filter hostels owned by this user
  // (In mock data, we fall back to showing hostels without owner or matching ownerId)
  const myHostels = hostels.filter(
    (h) => h.ownerId === currentUser.id || !h.ownerId
  );

  const resetForm = () => {
    setName('');
    setLocation('');
    setPrice('');
    setDescription('');
    setAmenities('');
    setSingleAvail('0');
    setDoubleAvail('0');
    setTripleAvail('0');
    setEditingHostel(null);
  };

  const handleEditClick = (hostel: Hostel) => {
    setEditingHostel(hostel);
    setName(hostel.name);
    setLocation(hostel.location);
    setPrice(hostel.price.toString());
    setDescription(hostel.description);
    setAmenities(hostel.amenities.join(', '));
    
    const single = hostel.rooms.find(r => r.sharingType === 'single')?.available || 0;
    const double = hostel.rooms.find(r => r.sharingType === 'double')?.available || 0;
    const triple = hostel.rooms.find(r => r.sharingType === 'triple')?.available || 0;
    
    setSingleAvail(single.toString());
    setDoubleAvail(double.toString());
    setTripleAvail(triple.toString());
    
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmenities = amenities
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const rooms = [
      { sharingType: 'single' as const, available: parseInt(singleAvail) || 0 },
      { sharingType: 'double' as const, available: parseInt(doubleAvail) || 0 },
      { sharingType: 'triple' as const, available: parseInt(tripleAvail) || 0 },
    ];

    const hostelData: Hostel = {
      id: editingHostel ? editingHostel.id : `hostel_${Date.now()}`,
      name,
      location,
      price: parseInt(price) || 0,
      description,
      images: editingHostel?.images || ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'],
      amenities: parsedAmenities,
      rooms,
      currentOccupants: editingHostel?.currentOccupants || [],
      ownerId: currentUser.id,
    };

    if (editingHostel) {
      if (onEditHostel) onEditHostel(hostelData);
      alert('Hostel listing updated successfully!');
    } else {
      if (onAddHostel) onAddHostel(hostelData);
      alert('New hostel listing created successfully!');
    }

    resetForm();
    setShowAddForm(false);
  };

  const handleDeleteClick = (hostelId: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      if (onDeleteHostel) onDeleteHostel(hostelId);
    }
  };

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
            <h3>{editingHostel ? 'Edit Hostel Listing' : 'Create New Hostel Listing'}</h3>
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

            <div className="form-group">
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

            <div className="form-group">
              <label className="form-label">Price (PKR / Month)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 15000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min={0}
              />
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
              <label className="form-label">Amenities (Comma separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="WiFi, AC, Generator, Mess, Laundry, Parking"
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Room Types & Availability
              </h4>
              <div style={roomsAvailGridStyle}>
                <div className="form-group">
                  <label className="form-label">Single Room (Available)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={singleAvail}
                    onChange={(e) => setSingleAvail(e.target.value)}
                    min={0}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">2-Sharing Room (Available)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={doubleAvail}
                    onChange={(e) => setDoubleAvail(e.target.value)}
                    min={0}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">3-Sharing Room (Available)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={tripleAvail}
                    onChange={(e) => setTripleAvail(e.target.value)}
                    min={0}
                  />
                </div>
              </div>
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
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
                {editingHostel ? 'Save Changes' : 'Publish Listing'}
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
                  <img src={hostel.images[0]} alt={hostel.name} style={imageStyle} />
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.125rem' }}>{hostel.name}</h4>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEditClick(hostel)}
                          style={actionButtonStyle}
                          title="Edit Listing"
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
                      <div style={metaItemStyle}>
                        <DollarSign size={14} />
                        <span>{hostel.price.toLocaleString()} / month</span>
                      </div>
                    </div>

                    <p style={descStyle}>{hostel.description}</p>

                    <div style={roomTypesGroupStyle}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>
                        Availability:
                      </span>
                      <div style={roomBadgesStyle}>
                        {hostel.rooms.map((room) => (
                          <div key={room.sharingType} style={roomBadgeStyle}>
                            <span style={{ fontWeight: 500 }}>{room.sharingType}:</span>{' '}
                            <span style={{ color: room.available > 0 ? 'var(--success)' : 'var(--danger)' }}>
                              {room.available} left
                            </span>
                          </div>
                        ))}
                      </div>
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

const roomsAvailGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '1rem',
  marginTop: '0.5rem',
};

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

const roomTypesGroupStyle: React.CSSProperties = {
  borderTop: '1px solid var(--border)',
  paddingTop: '0.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const roomBadgesStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
};

const roomBadgeStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  padding: '0.25rem 0.5rem',
  borderRadius: 'var(--radius)',
  backgroundColor: 'var(--secondary)',
  color: 'var(--secondary-foreground)',
  border: '1px solid var(--border)',
};
