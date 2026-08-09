import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Hostel, User } from '../types';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { BUILTIN_AMENITIES } from './Amenities';
import { useRevealContainer } from '../hooks/useReveal';
import { CustomSelect } from './ui/CustomSelect';

interface HostelDirectoryProps {
  hostels: Hostel[];
  currentUser: User;
  token: string | null;
}

const SHARING_OPTIONS = [
  { value: 'all', label: 'All rooms' },
  { value: 'single', label: '1 Sharing' },
  { value: 'double', label: '2 Sharing' },
  { value: 'triple', label: '3 Sharing' },
  { value: 'quad', label: '4 Sharing' },
  { value: 'penta', label: '5 Sharing' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'boys', label: 'Boys' },
  { value: 'girls', label: 'Girls' },
  { value: 'co-sharing', label: 'Co-Sharing' },
];

/** Cheapest → dearest rent across a hostel's rooms, formatted for the card overlay. */
const priceLabel = (hostel: Hostel) => {
  if (!hostel.rooms || hostel.rooms.length === 0) return 'Rent N/A';
  const prices = hostel.rooms.map((r) => r.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max
    ? `PKR ${min.toLocaleString()}`
    : `PKR ${min.toLocaleString()}–${max.toLocaleString()}`;
};

/** Seats still open across the hostel, phrased the way the directory cards read. */
const seatsLabel = (hostel: Hostel) => {
  const seats = (hostel.rooms ?? []).reduce((sum, r) => sum + (r.seatsAvailable ?? 0), 0);
  if (seats === 0) return 'Waitlist open';
  return seats === 1 ? '1 seat left' : `${seats} seats left`;
};



export const HostelDirectory = ({ hostels, currentUser }: HostelDirectoryProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const [selectedSharing, setSelectedSharing] = useState<string>('all');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filteredHostels = hostels.filter((host) => {
    const matchesSearch =
      host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      host.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (host.nearbyLocations && host.nearbyLocations.some((loc) =>
        loc.toLowerCase().includes(searchQuery.toLowerCase())
      ));

    const matchesPrice = host.rooms && host.rooms.length > 0
      ? host.rooms.some((r) => r.price <= maxPrice)
      : true;

    const matchesSharing =
      selectedSharing === 'all' ||
      (host.rooms && host.rooms.some(
        (r) => r.sharingType === selectedSharing && r.seatsAvailable > 0
      ));

    const matchesAmenity =
      selectedAmenities.length === 0 ||
      selectedAmenities.every((a) => host.amenities.includes(a));

    const matchesType =
      selectedType === 'all' ||
      (host.hostelType || 'boys') === selectedType;

    const isVisible = host.isVerified || currentUser.role === 'admin' || host.ownerId === currentUser.id;

    return matchesSearch && matchesPrice && matchesSharing && matchesAmenity && matchesType && isVisible;
  });

  const gridRef = useRevealContainer<HTMLDivElement>([filteredHostels.length, selectedSharing, selectedType]);

  const clearFilters = () => {
    setMaxPrice(25000);
    setSelectedSharing('all');
    setSelectedAmenities([]);
    setSelectedType('all');
    setSearchQuery('');
  };

  const renderFilters = () => (
    <>
      {/* Price */}
      <div>
        <label style={sidebarLabelStyle}>Max Price</label>
        <p style={{ fontSize: '0.85rem', color: '#201e1d', fontWeight: 600, marginBottom: '0.4rem' }}>
          PKR {maxPrice.toLocaleString()}
        </p>
        <input
          type="range"
          min="5000"
          max="35000"
          step="1000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#c67139', cursor: 'pointer' }}
        />
      </div>

      {/* Category */}
      <div>
        <label style={sidebarLabelStyle}>Hostel Category</label>
        <div style={segmentedControlWrapStyle}>
          {TYPE_OPTIONS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              style={segmentedControlBtnStyle(selectedType === tab.value)}
              onClick={() => setSelectedType(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sharing */}
      <div>
        <label style={sidebarLabelStyle}>Room Sharing</label>
        <CustomSelect
          value={selectedSharing}
          onChange={setSelectedSharing}
          options={SHARING_OPTIONS}
          style={sidebarSelectStyle}
        />
      </div>

      {/* Amenities */}
      <div>
        <label style={sidebarLabelStyle}>Must Have Amenities</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {BUILTIN_AMENITIES.map((amenity) => {
            const isSelected = selectedAmenities.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() =>
                  setSelectedAmenities((prev) =>
                    isSelected ? prev.filter((a) => a !== amenity) : [...prev, amenity]
                  )
                }
                style={sidebarAmenityChipStyle(isSelected)}
              >
                {amenity}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={clearFilters}
        style={sidebarClearBtnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(198, 113, 57, 0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        Clear Filters
      </button>
    </>
  );

  return (
    <div style={pageWrapStyle}>
      <style>{`
        .hd-card { cursor: pointer; }
        .hd-card img { transition: transform 1.1s var(--ease-organic); }
        .hd-card:hover img { transform: scale(1.05); }
        .hd-search-wrap:focus-within { border-color: var(--color-accent) !important; }
        .hd-layout { display: flex; gap: 2rem; margin-top: 24px; align-items: flex-start; flex-direction: row; }
        .hd-sidebar { width: 300px; flex-shrink: 0; }
        .hd-main { flex: 1; min-width: 0; }
        .hd-mobile-filter-btn { display: none !important; }
        .hd-filter-toggle-desktop { display: inline-flex; }

        @keyframes hd-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes hd-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .hd-filter-overlay-active {
          animation: hd-fade-in 0.25s cubic-bezier(0.19, 1, 0.22, 1) both;
        }
        .hd-filter-drawer-active {
          animation: hd-slide-up 0.35s cubic-bezier(0.19, 1, 0.22, 1) both;
        }

        @media (max-width: 768px) {
          .hd-layout { flex-direction: column; gap: 1.5rem; }
          .hd-sidebar { display: none !important; }
          .hd-filter-toggle-desktop { display: none !important; }
          .hd-mobile-filter-btn { display: flex !important; }
          .hd-main { width: 100%; min-width: 0; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={headerStyle}>
        <div className="hd-header-wrap" style={headerInnerWrapStyle}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '12px' }}>
            <div style={{ ...eyebrowStyle, marginBottom: 0 }}>Hostel directory</div>
            <div className="hd-count" style={countStyle}>
              {filteredHostels.length} {filteredHostels.length === 1 ? 'listing' : 'listings'}
            </div>
          </div>

          <div className="hd-header-inner" style={headerInnerStyle}>
            {/* Search */}
            <div className="hd-search-wrap" style={searchWrapStyle}>
              <Search size={15} strokeWidth={2.75} style={{ flexShrink: 0, color: 'var(--muted)' }} />
              <input
                className="hd-input"
                type="text"
                placeholder="Search name or area…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={searchInputStyle}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout (Sidebar + Grid) ── */}
      <div className="hd-layout" style={bodyStyle}>

        {/* ── Sidebar Filters ── */}
        {showFilters && (
          <div className="card hd-sidebar" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'ls-fade 0.4s ease both', overflow: 'visible' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SlidersHorizontal size={14} style={{ color: 'var(--muted)' }} />
                <h3 style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>Filters</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }
                  setShowFilters(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#82796a',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '4px',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(32, 30, 29, 0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Hide
              </button>
            </div>
            {renderFilters()}
          </div>
        )}

        {/* ── Listings ── */}
        <div className="hd-main">
          {/* Mobile: filter toggle bar always visible */}
          <button
            className="hd-mobile-filter-btn"
            onClick={() => setShowMobileFilters(true)}
            style={{
              display: 'none', // shown via CSS
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.625rem 1rem',
              marginBottom: '0.875rem',
              background: '#ebddc5',
              border: '1px solid #dcd3c4',
              borderRadius: '10px',
              color: '#201e1d',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              justifyContent: 'center',
            }}
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>

          {/* Mobile filter overlay */}
          {showMobileFilters && (
            <div
              className="hd-filter-overlay-active"
              style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'flex-end',
              }}
              onClick={(e) => { if (e.target === e.currentTarget) setShowMobileFilters(false); }}
            >
              <div
                className="hd-filter-drawer-active"
                style={{
                  background: '#ebddc5',
                  borderRadius: '20px 20px 0 0',
                  padding: '1.25rem 1.25rem 2rem',
                  width: '100%',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  borderTop: '1px solid #dcd3c4',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#201e1d' }}>Filters</span>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#82796a' }}
                  >
                    <X size={18} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {renderFilters()}
                </div>
              </div>
            </div>
          )}

          {!showFilters && (
            <button
              onClick={() => setShowFilters(true)}
              className="btn btn-secondary hd-filter-toggle-desktop"
              style={{
                marginBottom: '1rem',
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
          {filteredHostels.length === 0 ? (
            <div style={emptyStateStyle}>
              No hostels matched your search parameters. Try adjusting your filters.
            </div>
          ) : (
            <div ref={gridRef} style={sidebarGridStyle}>
              {filteredHostels.map((hostel, i) => (
                <div
                  key={hostel.id}
                  className="reveal hd-card"
                  data-reveal
                  data-delay={((i % 3) * 0.06).toFixed(2)}
                  onClick={() => navigate(`/hostels/${hostel.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/hostels/${hostel.id}`); }}
                >
                  <div style={cardImageWrapStyle}>
                    <img
                      src={(hostel.photos && hostel.photos.length > 0) ? hostel.photos[0] : hostel.photo}
                      alt={hostel.name}
                      className="washed"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '14px', left: '14px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={typeTagStyle}>
                        {(hostel.hostelType || 'boys').replace('-', ' ')}
                      </span>
                    </div>
                    <div style={cardOverlayStyle}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', color: 'var(--color-accent-300)', whiteSpace: 'nowrap' }}>
                        {priceLabel(hostel)}
                      </span>
                    </div>
                  </div>

                  <div style={cardFooterStyle}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1875rem' }}>{hostel.name}</div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--color-neutral-600)', marginTop: '3px' }}>
                        {hostel.location}
                      </div>
                    </div>
                    <div style={seatsStyle}>{seatsLabel(hostel)}</div>
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageWrapStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 76px)',
  background: 'var(--color-bg)',
  backgroundAttachment: 'fixed',
  /* Full-bleed escape from centered max-width container */
  width: '100vw',
  marginLeft: 'calc(-50vw + 50%)',
  marginTop: '-2.5rem',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  overflowX: 'hidden',
};

const headerStyle: React.CSSProperties = {
  background: 'var(--color-bg)',
  padding: '0',
};

const headerInnerWrapStyle: React.CSSProperties = {
  maxWidth: '1240px',
  margin: '0 auto',
  padding: '2.5rem 2rem 0',
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--color-accent-700)',
  marginBottom: '12px',
  animation: 'ls-fade 0.7s ease both',
};

const headerInnerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '1rem',
  marginBottom: '0.5rem',
  animation: 'ls-fade 0.9s ease 0.25s both',
};

const searchWrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-divider)',
  borderRadius: 'var(--radius-pill)',
  padding: '0.5rem 1.125rem',
};

const searchInputStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  outline: 'none',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.875rem',
  flex: 1,
  minWidth: 0,
};

const countStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--color-neutral-600)',
  marginLeft: 'auto',
};

const bodyStyle: React.CSSProperties = {
  flex: 1,
  maxWidth: '1240px',
  width: '100%',
  margin: '0 auto',
  padding: '1.75rem 2rem 3rem',
};

const sidebarLabelStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 700,
  color: '#82796a',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '0.35rem',
  display: 'block',
};

const segmentedControlWrapStyle: React.CSSProperties = {
  display: 'flex',
  border: '1px solid #dcd3c4',
  borderRadius: 'var(--radius-md)',
  background: 'transparent',
  overflow: 'hidden',
};

const segmentedControlBtnStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '8px 4px',
  textAlign: 'center',
  fontSize: '0.75rem',
  fontWeight: active ? 700 : 400,
  background: active ? '#c67139' : 'transparent',
  color: active ? '#fff' : '#82796a',
  border: 'none',
  cursor: 'pointer',
  transition: 'background 0.2s, color 0.2s',
  whiteSpace: 'nowrap',
});

const sidebarSelectStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--radius-md)',
  background: '#f5ead8',
  border: '1px solid #dcd3c4',
  color: '#201e1d',
  boxShadow: 'none',
  fontSize: '0.9rem',
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
};

const sidebarAmenityChipStyle = (selected: boolean): React.CSSProperties => ({
  fontFamily: 'var(--font-body)',
  fontSize: '0.75rem',
  padding: '6px 12px',
  borderRadius: 'var(--radius-pill)',
  border: `1px solid ${selected ? '#c67139' : '#dcd3c4'}`,
  background: selected ? '#c67139' : 'transparent',
  color: selected ? '#fff' : '#82796a',
  cursor: 'pointer',
  transition: 'var(--transition)',
});

const sidebarClearBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 1rem',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#c67139',
  background: 'transparent',
  border: '1px solid #c67139',
  borderRadius: '8px',
  cursor: 'pointer',
  marginTop: '0.5rem',
  transition: 'all 0.15s ease',
  textAlign: 'center',
};

const sidebarGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
  gap: '28px',
};

const cardImageWrapStyle: React.CSSProperties = {
  position: 'relative',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
  aspectRatio: '16/10',
  background: 'var(--color-neutral-200)',
};

const typeTagStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  background: 'var(--color-accent-2-100)',
  color: 'var(--color-accent-2-800)',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontSize: '0.625rem',
  padding: '4px 10px',
  borderRadius: 'var(--radius-pill)',
};

const cardOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '14px',
  right: '14px',
  background: 'rgba(32, 30, 29, 0.82)',
  color: 'var(--color-bg)',
  borderRadius: 'var(--radius-md)',
  padding: '6px 12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const cardFooterStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '14px',
  marginTop: '16px',
};

const seatsStyle: React.CSSProperties = {
  fontSize: '0.66rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--color-accent-700)',
  textAlign: 'right',
  paddingTop: '4px',
  whiteSpace: 'nowrap',
};

const emptyStateStyle: React.CSSProperties = {
  marginTop: '44px',
  padding: '4rem 2rem',
  textAlign: 'center',
  color: 'var(--muted)',
  background: 'var(--color-surface)',
  borderRadius: 'calc(var(--radius-lg) * 1.15)',
};
