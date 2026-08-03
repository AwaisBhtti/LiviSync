/**
 * AdminHostelVerification — Hostel listings verification table + hostel detail modal.
 * Extracted from AdminPanel.tsx.
 */
import { useState } from 'react';
import type { Hostel } from '../../types';
import { Building, CheckCircle } from 'lucide-react';
import { ImageLightbox } from '../ImageLightbox';
import {
  sectionTitleStyle,
  tableContainerStyle,
  tableStyle,
  tableHeaderRowStyle,
  thStyle,
  tableRowStyle,
  tdStyle,
  tableBtnStyle,
  modalOverlayStyle,
  modalContentStyle,
} from '../../styles/commonStyles';

interface AdminHostelVerificationProps {
  hostels: Hostel[];
  onVerifyHostel: (hostelId: string) => void;
  onUpdateNearbyLocations: (hostelId: string, locations: string[]) => void;
}

const getPriceRangeString = (hostel: Hostel) => {
  if (!hostel.rooms || hostel.rooms.length === 0) return 'Rooms not listed';
  const prices = hostel.rooms.map((r) => r.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  if (minPrice === maxPrice) return `PKR ${minPrice.toLocaleString()}`;
  return `PKR ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;
};

export const AdminHostelVerification = ({
  hostels,
  onVerifyHostel,
  onUpdateNearbyLocations,
}: AdminHostelVerificationProps) => {
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [hostelSearch, setHostelSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'verified'>('pending');
  const [newLocationInput, setNewLocationInput] = useState('');

  const pendingHostels = hostels.filter(
    (h) => !h.isVerified && h.name.toLowerCase().includes(hostelSearch.toLowerCase().trim())
  );

  const verifiedHostels = hostels.filter(
    (h) => h.isVerified && h.name.toLowerCase().includes(hostelSearch.toLowerCase().trim())
  );

  const displayList = activeTab === 'pending' ? pendingHostels : verifiedHostels;

  return (
    <>
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={sectionTitleStyle}>
          <Building size={18} /> Hostel Listings Management
        </h3>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            style={{
              padding: '0.5rem 1rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'pending' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'pending' ? 'var(--primary)' : 'var(--muted)',
              cursor: 'pointer',
            }}
          >
            Pending Verification ({hostels.filter(h => !h.isVerified).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('verified')}
            style={{
              padding: '0.5rem 1rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'verified' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'verified' ? 'var(--primary)' : 'var(--muted)',
              cursor: 'pointer',
            }}
          >
            Verified Directory ({hostels.filter(h => h.isVerified).length})
          </button>
        </div>

        <div style={{ marginBottom: '1rem', width: '100%', maxWidth: '320px' }}>
          <input
            type="text"
            placeholder="Search hostel by name..."
            className="form-input"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.825rem', width: '100%' }}
            value={hostelSearch}
            onChange={(e) => setHostelSearch(e.target.value)}
          />
        </div>
        {displayList.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', padding: '1rem 0' }}>
            {activeTab === 'pending'
              ? 'No pending hostels for verification matching search.'
              : 'No verified hostels matching search.'}
          </p>
        ) : (
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={thStyle}>Hostel Name</th>
                  <th style={thStyle}>Location</th>
                  <th style={thStyle}>Rent (PKR)</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayList.map((hostel) => (
                  <tr key={hostel.id} style={tableRowStyle}>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => setSelectedHostel(hostel)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline',
                          textAlign: 'left',
                        }}
                        title="Click to view details"
                      >
                        {hostel.name}
                      </button>
                    </td>
                    <td style={tdStyle}>{hostel.location}</td>
                    <td style={tdStyle}>{getPriceRangeString(hostel)}</td>
                    <td style={tdStyle}>
                      {!hostel.isVerified ? (
                        <button
                          className="btn btn-primary"
                          style={tableBtnStyle}
                          onClick={() => onVerifyHostel(hostel.id)}
                        >
                          <CheckCircle size={12} /> Verify Listing
                        </button>
                      ) : (
                        <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>✓ Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hostel Details Modal */}
      {selectedHostel && (
        <div style={modalOverlayStyle}>
          <div
            style={{ ...modalContentStyle, maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '0.75rem',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Hostel Details</h3>
              <button
                type="button"
                onClick={() => setSelectedHostel(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  fontSize: '1.25rem',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              {selectedHostel.photo && (
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '200px',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                }}>
                  {(() => {
                    const hostelPhotos = selectedHostel.photo
                      ? selectedHostel.photo.split(',').map((p) => p.trim()).filter(Boolean)
                      : [];
                    return (
                      <div style={{
                        display: 'flex',
                        overflowX: 'auto',
                        scrollSnapType: 'x mandatory',
                        width: '100%',
                        height: '100%',
                        scrollBehavior: 'smooth',
                        WebkitOverflowScrolling: 'touch',
                      }}>
                        {hostelPhotos.length === 0 ? (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--secondary)' }}>
                            No image available
                          </div>
                        ) : (
                          hostelPhotos.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt={`${selectedHostel.name} view ${i + 1}`}
                              onClick={() => setLightboxUrl(url)}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                flexShrink: 0,
                                scrollSnapAlign: 'start',
                                cursor: 'zoom-in',
                              }}
                            />
                          ))
                        )}
                        {hostelPhotos.length > 1 && (
                          <div style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            backgroundColor: 'rgba(32, 30, 29, 0.75)',
                            color: '#f5ead8',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            backdropFilter: 'blur(4px)',
                            zIndex: 10,
                            pointerEvents: 'none',
                          }}>
                            📷 {hostelPhotos.length} Photos
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                  {selectedHostel.name}
                </h4>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0 }}>
                  📍 {selectedHostel.location}
                </p>
              </div>

              <div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                  Description
                </h5>
                <p
                  style={{
                    color: 'var(--muted)',
                    fontSize: '0.875rem',
                    margin: 0,
                    lineHeight: '1.5',
                  }}
                >
                  {selectedHostel.description || 'No description provided.'}
                </p>
              </div>

              <div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                  Amenities
                </h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedHostel.amenities.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      No amenities specified.
                    </span>
                  ) : (
                    selectedHostel.amenities.map((a, i) => (
                      <span
                        key={i}
                        className="badge badge-neutral"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        ✓ {a}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                  Available Rooms ({selectedHostel.rooms?.length || 0})
                </h5>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    maxHeight: '250px',
                    overflowY: 'auto',
                    paddingRight: '0.25rem',
                  }}
                >
                  {!selectedHostel.rooms || selectedHostel.rooms.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      No rooms listed yet.
                    </span>
                  ) : (
                    selectedHostel.rooms.map((room, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: 'var(--secondary)',
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textTransform: 'capitalize',
                          }}
                        >
                          <span>
                            {room.sharingType} Sharing ({room.floor})
                          </span>
                          <span style={{ color: 'var(--primary)' }}>
                            PKR {room.price.toLocaleString()} / mo
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                            marginTop: '0.375rem',
                            fontSize: '0.75rem',
                            color: 'var(--muted)',
                          }}
                        >
                          <span>
                            🛋️{' '}
                            {room.furniture === 'nothing'
                              ? 'Unfurnished'
                              : room.furniture === 'mattress'
                              ? 'Mattress Provided'
                              : 'Furnished (Bed)'}
                          </span>
                          <span>• 🚿 {room.hasAttachedBathroom ? 'Attached Bath' : 'Shared Bath'}</span>
                          <span>• 🛏️ {room.seatsAvailable} bed(s) available</span>
                        </div>
                        {room.description && (
                          <p
                            style={{
                              margin: '0.375rem 0 0 0',
                              fontSize: '0.8rem',
                              color: 'var(--muted)',
                              fontStyle: 'italic',
                            }}
                          >
                            "{room.description}"
                          </p>
                        )}
                        {room.images && room.images.length > 0 && (
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.375rem',
                              marginTop: '0.5rem',
                              overflowX: 'auto',
                            }}
                          >
                            {room.images
                              .filter((img) => img.trim().length > 0)
                              .map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt=""
                                  onClick={() => setLightboxUrl(img)}
                                  style={{
                                    width: '60px',
                                    height: '45px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    cursor: 'zoom-in',
                                  }}
                                />
                              ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Nearby Locations management */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                  Nearby Locations (Admin Only)
                </h5>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '0 0 0.5rem 0' }}>
                  Add nearby universities, sub-areas, or landmarks to help students find this hostel in search queries.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {(!selectedHostel.nearbyLocations || selectedHostel.nearbyLocations.length === 0) ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                      No nearby locations added yet.
                    </span>
                  ) : (
                    selectedHostel.nearbyLocations.map((loc, i) => (
                      <span
                        key={i}
                        className="badge badge-neutral"
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          backgroundColor: 'var(--card-hover)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                        }}
                      >
                        {loc}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (selectedHostel.nearbyLocations || []).filter(l => l !== loc);
                            onUpdateNearbyLocations(selectedHostel.id, updated);
                            setSelectedHostel({ ...selectedHostel, nearbyLocations: updated });
                          }}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="e.g. UMT, Johar Town"
                    className="form-input"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', flex: 1 }}
                    value={newLocationInput}
                    onChange={(e) => setNewLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newLocationInput.trim() && selectedHostel) {
                          const currentLocs = selectedHostel.nearbyLocations || [];
                          if (!currentLocs.includes(newLocationInput.trim())) {
                            const updated = [...currentLocs, newLocationInput.trim()];
                            onUpdateNearbyLocations(selectedHostel.id, updated);
                            setSelectedHostel({ ...selectedHostel, nearbyLocations: updated });
                          }
                          setNewLocationInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                    onClick={() => {
                      if (newLocationInput.trim() && selectedHostel) {
                        const currentLocs = selectedHostel.nearbyLocations || [];
                        if (!currentLocs.includes(newLocationInput.trim())) {
                          const updated = [...currentLocs, newLocationInput.trim()];
                          onUpdateNearbyLocations(selectedHostel.id, updated);
                          setSelectedHostel({ ...selectedHostel, nearbyLocations: updated });
                        }
                        setNewLocationInput('');
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  marginTop: '0.5rem',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '1rem',
                }}
              >
                {!selectedHostel.isVerified && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      onVerifyHostel(selectedHostel.id);
                      setSelectedHostel(null);
                    }}
                  >
                    Verify &amp; Approve Listing
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: !selectedHostel.isVerified ? 0.3 : 1 }}
                  onClick={() => setSelectedHostel(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {lightboxUrl && (
        <ImageLightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </>
  );
};
