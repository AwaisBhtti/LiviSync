import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Hostel, User } from '../types';
import { MapPin, Check, ArrowLeft, Grid, Info, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';
import { API_BASE_URL } from '../config';

interface HostelDetailViewProps {
  hostels: Hostel[];
  currentUser: User;
  token: string | null;
}

export const HostelDetailView = ({ hostels, currentUser, token }: HostelDetailViewProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const selectedHostel = hostels.find((h) => h.id === id);

  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [ownerPhone, setOwnerPhone] = useState<string | null>(null);
  const [loadingPhone, setLoadingPhone] = useState<boolean>(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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
      <div style={{ padding: '4rem 2rem', textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text)' }}>Hostel Not Found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/hostels')}>Back to Directory</button>
      </div>
    );
  }

  const allPhotos = selectedHostel.photos && selectedHostel.photos.length > 0
    ? selectedHostel.photos
    : (selectedHostel.photo ? selectedHostel.photo.split(',').map(p => p.trim()).filter(Boolean) : []);

  // Calculate price range
  let priceStr = 'N/A';
  if (selectedHostel.rooms && selectedHostel.rooms.length > 0) {
    const prices = selectedHostel.rooms.map(r => r.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    priceStr = min === max ? `PKR ${min.toLocaleString()}` : `PKR ${min.toLocaleString()} - ${max.toLocaleString()}`;
  }

  const [isHovered, setIsHovered] = useState(false);

  const handleContainerClick = () => {
    if (allPhotos.length > 0) {
      setLightboxImages(allPhotos);
      setLightboxOpen(true);
    }
  };

  return (
    <div style={detailsPageStyle}>
      {/* Top Navigation */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate('/hostels')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none',
            color: 'var(--muted)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', padding: '0.5rem 0'
          }}
        >
          <ArrowLeft size={18} /> Back to Directory
        </button>
      </div>

      {/* Hero Header Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.2 }}>
          {selectedHostel.name}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 500 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={16} style={{ color: 'var(--primary)' }} />
            {selectedHostel.location}
          </span>
          <span>•</span>
          <span style={{ textTransform: 'capitalize' }}>
            {selectedHostel.hostelType ? selectedHostel.hostelType.replace('-', ' ') : 'Boys'} Hostel
          </span>
          {selectedHostel.isVerified && (
            <>
              <span>•</span>
              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Check size={16} /> Verified
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={contentGridStyle}>

        {/* Left Column: Image Slider & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Main Photo Slider */}
          <div
            style={mainPhotoContainerStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleContainerClick}
          >
            {allPhotos.length === 0 ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}>
                No photos available
              </div>
            ) : (
              <div
                className="photo-scroll-container"
                style={scrollContainerStyle}
                onScroll={(e) => {
                  const target = e.currentTarget;
                  const index = Math.round(target.scrollLeft / target.clientWidth);
                  setCurrentPhotoIndex(index);
                }}
              >
                {allPhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...photoSlideStyle,
                      backgroundImage: `url(${photo})`
                    }}
                  />
                ))}
              </div>
            )}

            {allPhotos.length > 1 && (
              <>
                {currentPhotoIndex > 0 && (
                  <button
                    style={{ ...sliderArrowLeftStyle, opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const container = e.currentTarget.parentElement?.querySelector('.photo-scroll-container');
                      if (container) {
                        container.scrollBy({ left: -container.clientWidth, behavior: 'smooth' });
                      }
                    }}
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}

                {currentPhotoIndex < allPhotos.length - 1 && (
                  <button
                    style={{ ...sliderArrowRightStyle, opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const container = e.currentTarget.parentElement?.querySelector('.photo-scroll-container');
                      if (container) {
                        container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
                      }
                    }}
                  >
                    <ChevronRight size={24} />
                  </button>
                )}

                {/* Dot Indicators */}
                <div style={dotIndicatorContainerStyle}>
                  {allPhotos.map((_, idx) => (
                    <div
                      key={idx}
                      style={{
                        ...dotStyle,
                        width: currentPhotoIndex === idx ? '16px' : '6px',
                        backgroundColor: currentPhotoIndex === idx ? 'white' : 'rgba(255,255,255,0.5)'
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {allPhotos.length > 0 && (
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxImages(allPhotos);
                  setLightboxOpen(true);
                }}
                style={showAllPhotosBtnStyle}
              >
                <Grid size={16} /> Show all photos
              </button>
            )}
          </div>

          {/* About Section */}
          <section>
            <h2 style={sectionHeadingStyle}>About this hostel</h2>
            <p style={{ color: 'var(--text)', fontSize: '1.05rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {selectedHostel.description || 'No description provided.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--card-hover)', borderRadius: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 600 }}>
                {selectedHostel.ownerName ? selectedHostel.ownerName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Hosted by {selectedHostel.ownerName || 'Unknown Owner'}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>LiviSync Verified Owner</p>
              </div>
            </div>
          </section>

          <hr style={dividerStyle} />

          {/* Amenities Section */}
          <section>
            <h2 style={sectionHeadingStyle}>What this place offers</h2>
            <div style={amenitiesGridStyle}>
              {selectedHostel.amenities.length > 0 ? selectedHostel.amenities.map((amenity, idx) => (
                <div key={idx} style={amenityBadgeStyle}>
                  <Check size={16} style={{ color: 'var(--primary)' }} />
                  {amenity}
                </div>
              )) : (
                <p style={{ color: 'var(--muted)' }}>No amenities listed.</p>
              )}
            </div>
          </section>

          <hr style={dividerStyle} />

          {/* Rules Section */}
          <section>
            <h2 style={sectionHeadingStyle}>Policies & Rules</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={ruleItemStyle}>
                <div style={ruleIconWrapperStyle}>
                  <Info size={20} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '0.25rem' }}>Curfew Policy</strong>
                  <span style={{ fontSize: '0.95rem', color: 'var(--muted)' }}>
                    {selectedHostel.hasCurfew
                      ? `Strict curfew in place. Doors close at ${formatCurfewTime(selectedHostel.curfewTime)}.`
                      : 'No curfew. 24/7 access allowed.'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <hr style={dividerStyle} />

          {/* Rooms Section */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ ...sectionHeadingStyle, marginBottom: 0 }}>Available Rooms</h2>
              <span style={{
                fontSize: '0.85rem', padding: '0.35rem 0.75rem', borderRadius: '20px',
                backgroundColor: selectedHostel.electricityBillIncluded ? 'rgba(34, 197, 94, 0.1)' : 'var(--card-hover)',
                color: selectedHostel.electricityBillIncluded ? 'var(--success)' : 'var(--muted)',
                fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem'
              }}>
                ⚡ Electricity: {selectedHostel.electricityBillIncluded ? 'Included' : 'Not Included'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedHostel.rooms && selectedHostel.rooms.length > 0 ? selectedHostel.rooms.map((room, idx) => (
                <div key={idx} className="room-card" style={roomCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ textTransform: 'capitalize', fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.5rem' }}>
                        {room.sharingType} Sharing
                      </h3>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        <span style={roomBadgeStyle}>
                          🏢 {room.floor} Floor
                        </span>
                        <span style={roomBadgeStyle}>
                          🛋️ {room.furniture === 'nothing' ? 'Unfurnished' : room.furniture === 'mattress' ? 'Mattress Provided' : 'Furnished'}
                        </span>
                        <span style={roomBadgeStyle}>
                          🚿 {room.hasAttachedBathroom ? 'Attached Bath' : 'Shared Bath'}
                        </span>
                      </div>
                      {room.description && (
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--muted)' }}>
                          {room.description}
                        </p>
                      )}

                      {/* Room specific images */}
                      {room.images && room.images.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                          {room.images.filter(img => img.trim().length > 0).map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`Room view ${i + 1}`}
                              onClick={() => {
                                setLightboxImages([img]);
                                setLightboxOpen(true);
                              }}
                              style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', cursor: 'zoom-in', border: '1px solid var(--border)', transition: 'transform 0.2s' }}
                              className="room-img-hover"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                        PKR {room.price.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>per month</div>
                      <div style={{
                        display: 'inline-block',
                        fontSize: '0.85rem', fontWeight: 600,
                        padding: '0.25rem 0.6rem', borderRadius: '6px',
                        backgroundColor: room.seatsAvailable > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: room.seatsAvailable > 0 ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {room.seatsAvailable > 0 ? `${room.seatsAvailable} bed(s) left` : 'Fully Occupied'}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <p style={{ color: 'var(--muted)' }}>No rooms available at the moment.</p>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Right Column: Sticky Pricing & Contact Sidebar */}
        <div>
          <div style={stickySidebarStyle}>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)' }}>
                {priceStr}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--muted)', marginLeft: '0.25rem' }}>/ month</span>
            </div>

            {selectedHostel.rooms && selectedHostel.rooms.length > 0 && (
              <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '1.5rem', backgroundColor: 'var(--bg-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--muted)' }}>Total Rooms</span>
                  <span style={{ fontWeight: 600 }}>{selectedHostel.rooms.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--muted)' }}>Available Slots</span>
                  <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                    {selectedHostel.rooms.reduce((acc, r) => acc + r.seatsAvailable, 0)}
                  </span>
                </div>
              </div>
            )}

            {currentUser.role !== 'admin' && currentUser.role !== 'owner' ? (
              <div style={{ marginTop: '1rem' }}>
                {ownerPhone ? (
                  <div style={phoneDisplayBoxStyle}>
                    <Phone size={18} />
                    <span style={{ fontSize: '1.05rem', letterSpacing: '0.5px' }}>{ownerPhone}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleShowPhone}
                    disabled={loadingPhone}
                    style={primaryButtonStyle}
                    className="btn-pulse"
                  >
                    {loadingPhone ? 'Loading Info...' : 'Show Contact Info'}
                  </button>
                )}
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--muted)', marginTop: '1rem' }}>
                  Contact the owner directly to book a room.
                </p>
              </div>
            ) : (
              <div style={{ marginTop: '1rem', padding: '1rem', textAlign: 'center', backgroundColor: 'var(--card-hover)', borderRadius: '8px', color: 'var(--muted)', fontSize: '0.9rem' }}>
                You are viewing this as a {currentUser.role}.
              </div>
            )}
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          onClose={() => {
            setLightboxOpen(false);
            setLightboxImages([]);
          }}
        />
      )}

      <style>{`
        .room-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .room-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          border-color: var(--primary);
        }
        .room-img-hover:hover {
          transform: scale(1.05);
        }
        .btn-pulse {
          transition: all 0.2s;
        }
        .btn-pulse:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(var(--primary-rgb, 59, 130, 246), 0.3);
        }
        .glass-panel {
          background: var(--card);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        /* Handle dark mode glass if needed */
        @media (prefers-color-scheme: dark) {
          .glass-panel {
             background: rgba(30, 30, 30, 0.7);
             border-color: rgba(255, 255, 255, 0.1);
          }
        }
      `}</style>
    </div>
  );
};

// Styles
const detailsPageStyle: React.CSSProperties = {
  animation: 'fadeIn 0.3s ease-out',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 1rem 4rem 1rem',
};

const mainPhotoContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '450px',
  position: 'relative',
  borderRadius: '16px',
  overflow: 'hidden',
};

const scrollContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
  scrollBehavior: 'smooth',
  WebkitOverflowScrolling: 'touch',
  cursor: 'pointer',
};

const photoSlideStyle: React.CSSProperties = {
  flex: '0 0 100%',
  width: '100%',
  height: '100%',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  scrollSnapAlign: 'start',
};

const sliderArrowLeftStyle: React.CSSProperties = {
  position: 'absolute',
  left: '1rem',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  color: 'black',
  border: 'none',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  zIndex: 10,
};

const sliderArrowRightStyle: React.CSSProperties = {
  ...sliderArrowLeftStyle,
  left: 'auto',
  right: '1rem',
};

const dotIndicatorContainerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '1rem',
  left: '0',
  right: '0',
  display: 'flex',
  justifyContent: 'center',
  gap: '0.4rem',
  zIndex: 10,
};

const dotStyle: React.CSSProperties = {
  height: '6px',
  borderRadius: '3px',
  transition: 'all 0.3s ease',
  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
};

const showAllPhotosBtnStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '1.5rem',
  right: '1.5rem',
  backgroundColor: 'white',
  color: 'black',
  border: '1px solid rgba(0,0,0,0.1)',
  borderRadius: '8px',
  padding: '0.5rem 1rem',
  fontSize: '0.9rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  zIndex: 10,
};

const contentGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 380px',
  gap: '4rem',
};

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 700,
  marginBottom: '1.25rem',
  color: 'var(--text)',
};

const dividerStyle: React.CSSProperties = {
  border: 0,
  borderTop: '1px solid var(--border)',
  margin: '2.5rem 0',
};

const amenitiesGridStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
};

const amenityBadgeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.95rem',
  padding: '0.75rem 1.25rem',
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '30px',
  fontWeight: 500,
  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
};

const ruleItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1rem',
};

const ruleIconWrapperStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: 'rgba(59, 130, 246, 0.1)', /* assuming primary is blueish */
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const roomCardStyle: React.CSSProperties = {
  padding: '1.5rem',
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
};

const roomBadgeStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  padding: '0.25rem 0.6rem',
  backgroundColor: 'var(--card-hover)',
  borderRadius: '6px',
  color: 'var(--text)',
  fontWeight: 500,
  border: '1px solid var(--border)',
};

const stickySidebarStyle: React.CSSProperties = {
  position: 'sticky',
  top: '2rem',
  padding: '1.75rem',
  borderRadius: '16px',
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  zIndex: 10,
};

const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.875rem',
  fontSize: '1rem',
  fontWeight: 600,
  backgroundColor: 'var(--primary)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
};

const phoneDisplayBoxStyle: React.CSSProperties = {
  backgroundColor: 'rgba(34, 197, 94, 0.1)',
  border: '1px solid rgba(34, 197, 94, 0.3)',
  borderRadius: '8px',
  padding: '1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',
  color: 'var(--success)',
  fontWeight: 700,
};

// Responsive handling and scrollbar hiding
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media (max-width: 900px) {
      .split-layout, .details-content-grid {
         grid-template-columns: 1fr !important;
      }
    }
    .photo-scroll-container::-webkit-scrollbar {
      display: none;
    }
    .photo-scroll-container {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;
  document.head.appendChild(style);
}
