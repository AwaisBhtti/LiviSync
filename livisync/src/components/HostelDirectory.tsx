import { API_BASE_URL } from '../config';
import { useState } from 'react';
import type { Hostel, User } from '../types';
import { Search, MapPin, Check, ArrowLeft } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';

interface HostelDirectoryProps {
  hostels: Hostel[];
  currentUser: User;
  token: string | null;
}

export const HostelDirectory = ({
  hostels,
  currentUser,
  token,
}: HostelDirectoryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const [selectedSharing, setSelectedSharing] = useState<string>('all');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [selectedAmenity, setSelectedAmenity] = useState<string>('all');
  const [ownerPhone, setOwnerPhone] = useState<string | null>(null);
  const [loadingPhone, setLoadingPhone] = useState<boolean>(false);

  const selectHostel = (hostel: Hostel | null) => {
    setSelectedHostel(hostel);
    setOwnerPhone(null);
  };

  const handleShowPhone = async () => {
    if (!token || !selectedHostel) return;
    setLoadingPhone(true);
    try {
      const response = await fetch(`${API_BASE_URL}/hostels/${selectedHostel.id}/view-phone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch phone number');
      }
      setOwnerPhone(data.phone);
    } catch (err: any) {
      alert(err.message || 'Error fetching phone number');
    } finally {
      setLoadingPhone(false);
    }
  };

  // Find all unique amenities for filters
  const allAmenities = Array.from(
    new Set(hostels.flatMap((h) => h.amenities))
  );

  // Filter hostels
  const filteredHostels = hostels.filter((hostel) => {
    const matchesSearch =
      hostel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hostel.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPrice = hostel.rooms && hostel.rooms.length > 0
      ? hostel.rooms.some(r => r.price <= maxPrice)
      : true;

    const matchesSharing =
      selectedSharing === 'all' ||
      (hostel.rooms && hostel.rooms.some(
        (r) => r.sharingType === selectedSharing && r.seatsAvailable > 0
      ));

    const matchesAmenity =
      selectedAmenity === 'all' ||
      hostel.amenities.includes(selectedAmenity);

    const isVisible = hostel.isVerified || currentUser.role === 'admin' || hostel.ownerId === currentUser.id;

    return matchesSearch && matchesPrice && matchesSharing && matchesAmenity && isVisible;
  });



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* If selected hostel is open on mobile, show back button */}
      {selectedHostel ? (
        <div style={detailsPageStyle}>
          <button
            className="btn btn-secondary"
            onClick={() => selectHostel(null)}
            style={{ marginBottom: '1rem', width: 'fit-content' }}
          >
            <ArrowLeft size={16} />
            Back to Directory
          </button>

          <div style={detailGridStyle}>
            {/* Left side: Images & Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={mainImageContainerStyle}>
                <img
                  src={selectedHostel.photo}
                  alt={selectedHostel.name}
                  onClick={() => setLightboxUrl(selectedHostel.photo)}
                  style={{ ...mainImageStyle, cursor: 'zoom-in' }}
                />
              </div>

              <div className="card" style={{ padding: '1.5rem' }}>
                <h3>About {selectedHostel.name}</h3>
                <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {selectedHostel.description}
                </p>
              </div>

              <div className="card" style={{ padding: '1.5rem' }}>
                <h3>Amenities</h3>
                <div style={amenitiesGridStyle}>
                  {selectedHostel.amenities.map((amenity, idx) => (
                    <div key={idx} style={amenityBadgeStyle}>
                      <Check size={12} style={{ color: 'var(--success)' }} />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: Rooms, Booking & Occupants */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem' }}>{selectedHostel.name}</h2>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      <MapPin size={14} />
                      {selectedHostel.location}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                      {(() => {
                        if (!selectedHostel.rooms || selectedHostel.rooms.length === 0) return 'Rooms N/A';
                        const prices = selectedHostel.rooms.map(r => r.price);
                        const min = Math.min(...prices);
                        const max = Math.max(...prices);
                        return min === max ? `PKR ${min.toLocaleString()}` : `PKR ${min.toLocaleString()} - ${max.toLocaleString()}`;
                      })()}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)' }}>/ month</span>
                  </div>
                </div>

                <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '1rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0 }}>Available Rooms</h4>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: selectedHostel.electricityBillIncluded ? 'rgba(34, 197, 94, 0.1)' : 'var(--card-hover)',
                    color: selectedHostel.electricityBillIncluded ? 'var(--success)' : 'var(--muted)',
                    border: '1px solid ' + (selectedHostel.electricityBillIncluded ? 'rgba(34, 197, 94, 0.2)' : 'var(--border)'),
                    fontWeight: 600
                  }}>
                    ⚡ Electricity: {selectedHostel.electricityBillIncluded ? 'Included' : 'Not Included'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedHostel.rooms.map((room, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.9rem' }}>
                          {room.sharingType} Sharing ({room.floor})
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                          PKR {room.price.toLocaleString()}/mo
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.125rem' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem', padding: '0.15rem 0.35rem' }}>
                          🛋️ {room.furniture === 'nothing' ? 'Unfurnished' : room.furniture === 'mattress' ? 'Mattress Provided' : 'Furnished (Bed)'}
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem', padding: '0.15rem 0.35rem' }}>
                          🚿 {room.hasAttachedBathroom ? 'Attached Bath' : 'Shared Bath'}
                        </span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 500, color: room.seatsAvailable > 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {room.seatsAvailable > 0 ? `${room.seatsAvailable} bed(s) left` : 'Full'}
                        </span>
                      </div>
                      {room.description && (
                        <p style={{ margin: '0.25rem 0', fontSize: '0.8rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                          "{room.description}"
                        </p>
                      )}
                      {room.images && room.images.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.5rem', overflowX: 'auto' }}>
                          {room.images.filter(img => img.trim().length > 0).map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt=""
                              onClick={() => setLightboxUrl(img)}
                              style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '4px', cursor: 'zoom-in' }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {currentUser.role !== 'admin' && currentUser.role !== 'owner' && (
                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    {ownerPhone ? (
                      <div style={{ padding: '0.75rem', backgroundColor: 'var(--card-hover)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Owner's Contact Number:</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)', marginTop: '0.25rem' }}>{ownerPhone}</p>
                      </div>
                    ) : (
                      <button
                        onClick={handleShowPhone}
                        disabled={loadingPhone}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.625rem', fontSize: '0.85rem' }}
                      >
                        {loadingPhone ? 'Loading Contact Info...' : 'Show Owner\'s Phone Number'}
                      </button>
                    )}
                  </div>
                )}
              </div>


            </div>
          </div>
        </div>
      ) : (
        /* Main Directory View */
        <>
          {/* Header & Search */}
          <div style={heroHeaderStyle}>
            <h1>Find Hostel Residences</h1>
            <p style={{ color: 'var(--muted)' }}>Search and filter top hostels near your campus by name or location.</p>

            <div style={searchContainerStyle}>
              <Search size={18} style={{ color: 'var(--muted)', marginLeft: '1rem' }} />
              <input
                type="text"
                placeholder="Search by hostel name or city area (e.g. Islamabad, Gulberg)..."
                style={searchInputStyle}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Directory Content Layout */}
          <div className="split-layout">
            {/* Filters Column */}
            <div className="card" style={{ padding: '1.25rem', height: 'fit-content' }}>
              <h3 style={{ fontSize: '0.95rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Filters
              </h3>

              {/* Price Filter */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Max Price (PKR): {maxPrice.toLocaleString()}</label>
                <input
                  type="range"
                  min="5000"
                  max="35000"
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>

              {/* Sharing Type Filter */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Room Sharing</label>
                <select
                  className="form-select"
                  value={selectedSharing}
                  onChange={(e) => setSelectedSharing(e.target.value)}
                >
                  <option value="all">Any Sharing</option>
                  <option value="single">1 Seater Room</option>
                  <option value="double">2 Seater Room</option>
                  <option value="triple">3 Seater Room</option>
                  <option value="quad">4 Seater Room</option>
                  <option value="penta">5 Seater Room</option>
                </select>
              </div>

              {/* Amenities Filter */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Must Have Amenity</label>
                <select
                  className="form-select"
                  value={selectedAmenity}
                  onChange={(e) => setSelectedAmenity(e.target.value)}
                >
                  <option value="all">Any Amenity</option>
                  {allAmenities.map((amenity, idx) => (
                    <option key={idx} value={amenity}>
                      {amenity}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hostels List Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--muted)' }}>
                <span>Showing {filteredHostels.length} hostels</span>
              </div>

              {filteredHostels.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                  No hostels matched your search parameters. Try adjusting your filters.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredHostels.map((hostel) => (
                    <div
                      key={hostel.id}
                      className="card"
                      style={hostelRowCardStyle}
                      onClick={() => selectHostel(hostel)}
                    >
                      <img
                        src={hostel.photo}
                        alt={hostel.name}
                        style={hostelThumbnailStyle}
                      />
                      <div style={hostelInfoStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{hostel.name}</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.125rem' }}>
                              <MapPin size={12} />
                              {hostel.location}
                            </p>
                          </div>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                            {(() => {
                              if (!hostel.rooms || hostel.rooms.length === 0) return 'Rent N/A';
                              const prices = hostel.rooms.map(r => r.price);
                              const min = Math.min(...prices);
                              const max = Math.max(...prices);
                              return min === max ? `PKR ${min.toLocaleString()}/mo` : `PKR ${min.toLocaleString()} - ${max.toLocaleString()}/mo`;
                            })()}
                          </span>
                        </div>

                        <p style={hostelDescSnippetStyle}>
                          {hostel.description}
                        </p>

                        <div style={hostelFooterStyle}>
                          <div style={amenitiesRowStyle}>
                            {hostel.amenities.slice(0, 3).map((amenity, idx) => (
                              <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                                {amenity}
                              </span>
                            ))}
                            {hostel.amenities.length > 3 && (
                              <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                                +{hostel.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <ImageLightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </div>
  );
};

// Styles
const detailsPageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const detailGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.6fr 1fr',
  gap: '1.5rem',
};

const mainImageContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '320px',
  borderRadius: 'var(--radius)',
  overflow: 'hidden',
  border: '1px solid var(--border)',
};

const mainImageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const amenitiesGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
  gap: '0.75rem',
  marginTop: '0.75rem',
};

const amenityBadgeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.8rem',
  padding: '0.375rem 0.5rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
};



const heroHeaderStyle: React.CSSProperties = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const searchContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  backgroundColor: 'var(--background)',
  marginTop: '1rem',
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: 'none',
  background: 'none',
  outline: 'none',
  fontSize: '0.9rem',
  color: 'var(--foreground)',
};

const hostelRowCardStyle: React.CSSProperties = {
  display: 'flex',
  cursor: 'pointer',
  height: '160px',
};

const hostelThumbnailStyle: React.CSSProperties = {
  width: '200px',
  height: '100%',
  objectFit: 'cover',
  borderRight: '1px solid var(--border)',
};

const hostelInfoStyle: React.CSSProperties = {
  flex: 1,
  padding: '1.25rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minWidth: 0,
};

const hostelDescSnippetStyle: React.CSSProperties = {
  color: 'var(--muted)',
  fontSize: '0.85rem',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  lineHeight: '1.4',
  margin: '0.5rem 0',
};

const hostelFooterStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '0.5rem',
};

const amenitiesRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.375rem',
};
