
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Hostel, User } from '../types';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { BUILTIN_AMENITIES } from './Amenities';
import { CustomSelect } from './ui/CustomSelect';

interface HostelDirectoryProps {
  hostels: Hostel[];
  currentUser: User;
  token: string | null;
}

export const HostelDirectory = ({
  hostels,
  currentUser,
}: HostelDirectoryProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const [selectedSharing, setSelectedSharing] = useState<string>('all');
  const [selectedAmenity, setSelectedAmenity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState<boolean>(true);

  // Use all built-in amenities for filters
  const allAmenities = BUILTIN_AMENITIES;

  // Filter hostels
  const filteredHostels = hostels.filter((host) => {
    const matchesSearch =
      host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      host.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPrice = host.rooms && host.rooms.length > 0
      ? host.rooms.some(r => r.price <= maxPrice)
      : true;

    const matchesSharing =
      selectedSharing === 'all' ||
      (host.rooms && host.rooms.some(
        (r) => r.sharingType === selectedSharing && r.seatsAvailable > 0
      ));

    const matchesAmenity =
      selectedAmenity === 'all' ||
      host.amenities.includes(selectedAmenity);

    const matchesType =
      selectedType === 'all' ||
      (host.hostelType || 'boys') === selectedType;

    const isVisible = host.isVerified || currentUser.role === 'admin' || host.ownerId === currentUser.id;

    return matchesSearch && matchesPrice && matchesSharing && matchesAmenity && matchesType && isVisible;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
      <div className="split-layout" style={!showFilters ? { gridTemplateColumns: '1fr' } : undefined}>
        {/* Filters Column */}
        {showFilters && (
          <div className="card" style={{ padding: '1.25rem', height: 'fit-content', overflow: 'visible', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SlidersHorizontal size={14} style={{ color: 'var(--muted)' }} />
                <h3 style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600 }}>Filters</h3>
              </div>
              <button
                onClick={(e) => {
                  e.currentTarget.blur();
                  setShowFilters(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '4px',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--card-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Hide
              </button>
            </div>

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

            {/* Hostel Type Filter (Tabs) */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Hostel Category</label>
              <div style={{ display: 'flex', background: 'var(--card-hover)', borderRadius: 'var(--radius-sm)', padding: '0.2rem', gap: '0.2rem', border: '1px solid var(--border-solid)' }}>
                {([
                  { value: 'all', label: 'All' },
                  { value: 'boys', label: 'Boys' },
                  { value: 'girls', label: 'Girls' },
                  { value: 'co-sharing', label: 'Co-Sharing' }
                ]).map((tab) => {
                  const isActive = selectedType === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setSelectedType(tab.value)}
                      style={{
                        flex: 1,
                        padding: '0.35rem 0.25rem',
                        fontSize: '0.68rem',
                        fontWeight: isActive ? 700 : 500,
                        borderRadius: '4px',
                        border: 'none',
                        background: isActive ? 'var(--primary)' : 'transparent',
                        color: isActive ? 'var(--primary-foreground)' : 'var(--muted)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'center',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sharing Type Filter */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Room Sharing</label>
              <CustomSelect
                value={selectedSharing}
                onChange={setSelectedSharing}
                options={[
                  { value: 'all', label: 'Any Sharing' },
                  { value: 'single', label: '1 Seater Room' },
                  { value: 'double', label: '2 Seater Room' },
                  { value: 'triple', label: '3 Seater Room' },
                  { value: 'quad', label: '4 Seater Room' },
                  { value: 'penta', label: '5 Seater Room' },
                ]}
              />
            </div>

            {/* Amenities Filter */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Must Have Amenity</label>
              <CustomSelect
                value={selectedAmenity}
                onChange={setSelectedAmenity}
                options={[
                  { value: 'all', label: 'Any Amenity' },
                  ...allAmenities.map((amenity) => ({ value: amenity, label: amenity })),
                ]}
              />
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={() => {
                setMaxPrice(25000);
                setSelectedSharing('all');
                setSelectedAmenity('all');
                setSelectedType('all');
                setSearchQuery('');
              }}
              className="btn btn-secondary"
              style={{
                width: '100%',
                marginTop: '0.5rem',
                fontSize: '0.8rem',
                padding: '0.5rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Hostels List Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minWidth: 0 }}>
          {!showFilters && (
            <button
              onClick={() => setShowFilters(true)}
              className="btn btn-secondary"
              style={{
                marginBottom: '0.5rem',
                width: 'fit-content',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.875rem',
                fontSize: '0.8rem',
              }}
            >
              <SlidersHorizontal size={13} />
              Show Filters
            </button>
          )}
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
                  onClick={() => navigate(`/hostels/${hostel.id}`)}
                >
                  <img
                    src={hostel.photo}
                    alt={hostel.name}
                    style={hostelThumbnailStyle}
                  />
                  <div style={hostelInfoStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{hostel.name}</h3>
                          <span className="badge badge-neutral" style={{ textTransform: 'capitalize', fontSize: '0.65rem', fontWeight: 600 }}>
                            {hostel.hostelType ? hostel.hostelType.replace('-', ' ') : 'Boys'}
                          </span>
                        </div>
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
    </div>
  );
};

// Styles
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
