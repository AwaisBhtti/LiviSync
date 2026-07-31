import { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Hostel, User } from '../types';
import { MapPin, Check } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';
import { API_BASE_URL } from '../config';

interface HostelDetailViewProps {
  hostels: Hostel[];
  currentUser: User;
  token: string | null;
}

export const HostelDetailView = ({ hostels, currentUser, token }: HostelDetailViewProps) => {
  const { id } = useParams<{ id: string }>();
  const selectedHostel = hostels.find((h) => h.id === id);

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [ownerPhone, setOwnerPhone] = useState<string | null>(null);
  const [loadingPhone, setLoadingPhone] = useState<boolean>(false);

  const formatCurfewTime = (timeStr?: string) => {
    if (!timeStr) return 'Yes';
    const [hoursStr, minutesStr] = timeStr.split(':');
    const hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutesStr || '00';
    return `${displayHours}:${displayMinutes} ${ampm}`;
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

  if (!selectedHostel) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Hostel Not Found</h2>
      </div>
    );
  }

  return (
    <div style={detailsPageStyle}>
      <div style={detailGridStyle}>
        {/* Left side: Images & Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={mainImageContainerStyle}>
            <img
              src={selectedHostel.photo}
              alt={selectedHostel.name}
              onClick={() => setLightboxUrl(selectedHostel.photo || null)}
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
            <h3>Hostel Rules &amp; Policies</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem', display: 'block' }}>Curfew Policy</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {selectedHostel.hasCurfew
                      ? `Strict curfew in place. Doors close at ${formatCurfewTime(selectedHostel.curfewTime)}.`
                      : 'No curfew. 24/7 access allowed.'}
                  </span>
                </div>
              </div>
            </div>
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
                <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedHostel.name}
                  <span className="badge badge-neutral" style={{ textTransform: 'capitalize', fontSize: '0.75rem', fontWeight: 600 }}>
                    {selectedHostel.hostelType ? selectedHostel.hostelType.replace('-', ' ') : 'Boys'} Hostel
                  </span>
                </h2>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  <MapPin size={14} />
                  {selectedHostel.location}
                </p>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginTop: '0.375rem' }}>
                  👤 Hosted by: {selectedHostel.ownerName || 'Unknown Owner'}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ margin: 0 }}>Available Rooms</h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                  <div style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.08)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    borderRadius: '8px',
                    padding: '0.875rem',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--success)'
                  }}>
                    📞 Owner's Phone: {ownerPhone}
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

      {lightboxUrl && (
        <ImageLightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </div>
  );
};

// Styles
const detailsPageStyle: React.CSSProperties = {
  animation: 'fadeIn 0.2s ease',
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
