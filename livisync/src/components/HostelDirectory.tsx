import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Hostel, User } from '../types';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { BUILTIN_AMENITIES } from './Amenities';
import { useRevealContainer } from '../hooks/useReveal';

interface HostelDirectoryProps {
  hostels: Hostel[];
  currentUser: User;
  token: string | null;
}

const SHARING_OPTIONS = [
  { value: 'all', label: 'All rooms' },
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'triple', label: 'Triple' },
  { value: 'quad', label: 'Quad' },
  { value: 'penta', label: 'Penta' },
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

  const activeAdvanced =
    maxPrice !== 25000 || selectedAmenities.length > 0 || selectedType !== 'all';

  const clearFilters = () => {
    setMaxPrice(25000);
    setSelectedSharing('all');
    setSelectedAmenities([]);
    setSelectedType('all');
    setSearchQuery('');
  };

  return (
    <div>
      <style>{`
        .hd-card { cursor: pointer; }
        .hd-card img { transition: transform 1.1s var(--ease-organic); }
        .hd-card:hover img { transform: scale(1.05); }
        .hd-search:focus-within { border-color: var(--color-accent); }
        @media (max-width: 640px) {
          .hd-filter-bar { flex-direction: column; align-items: stretch !important; }
          .hd-count { margin-left: 0 !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={eyebrowStyle}>Hostel directory</div>

      {/* ── Filter bar ── */}
      <div className="hd-filter-bar" style={filterBarStyle}>
        <div className="hd-search" style={searchWrapStyle}>
          <Search size={16} strokeWidth={2.75} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search name or area…"
            style={searchInputStyle}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="hd-count" style={countStyle}>
          {filteredHostels.length} {filteredHostels.length === 1 ? 'listing' : 'listings'}
        </div>
      </div>

      {/* ── Main Layout (Sidebar + Grid) ── */}
      <div style={{ display: 'flex', gap: '2rem', marginTop: '24px', alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap' }}>

        {/* ── Sidebar Filters ── */}
        <div style={sidebarPanelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-divider)', paddingBottom: '12px' }}>
            <div style={sidebarTitleStyle}>
              <SlidersHorizontal size={18} strokeWidth={2.5} style={{ marginRight: '8px' }} />
              Filters
            </div>
          </div>

          <div style={sidebarSectionStyle}>
            <label style={sidebarLabelStyle}>MAX PRICE (PKR): {maxPrice.toLocaleString()}</label>
            <input
              type="range"
              min="5000"
              max="35000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#ab6f4b' }}
            />
          </div>

          <div style={sidebarSectionStyle}>
            <label style={sidebarLabelStyle}>HOSTEL CATEGORY</label>
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

          <div style={sidebarSectionStyle}>
            <label style={sidebarLabelStyle}>ROOM SHARING</label>
            <select
              value={selectedSharing}
              onChange={(e) => setSelectedSharing(e.target.value)}
              style={sidebarSelectStyle}
            >
              {SHARING_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div style={sidebarSectionStyle}>
            <label style={sidebarLabelStyle}>MUST HAVE AMENITIES</label>
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

          <button type="button" onClick={clearFilters} style={sidebarClearBtnStyle}>
            Clear Filters
          </button>
        </div>

        {/* ── Listings ── */}
        <div style={{ flex: 1, minWidth: '300px' }}>
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
                      {hostel.isVerified && <span style={verifiedTagStyle}>Verified</span>}
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

const eyebrowStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--color-accent-700)',
  marginBottom: '22px',
  animation: 'ls-fade 0.7s ease both',
};

const pageTitleStyle: React.CSSProperties = {
  fontSize: 'clamp(40px, 6vw, 92px)',
  lineHeight: 0.9,
  margin: '0 0 18px',
  maxWidth: '20ch',
  animation: 'ls-rise 0.9s var(--ease-organic) both',
};

const pageLeadStyle: React.CSSProperties = {
  fontSize: '1.03rem',
  color: 'var(--color-neutral-700)',
  maxWidth: '56ch',
  margin: '0 0 40px',
  animation: 'ls-fade 0.9s ease 0.15s both',
};

const filterBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
  alignItems: 'center',
  padding: '18px',
  background: 'var(--color-surface)',
  borderRadius: 'calc(var(--radius-lg) * 1.1)',
  boxShadow: 'var(--shadow-sm)',
  animation: 'ls-fade 0.9s ease 0.25s both',
};

const searchWrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flex: 1,
  minWidth: '220px',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-divider)',
  borderRadius: 'var(--radius-pill)',
  padding: '0 16px',
  height: '42px',
  transition: 'var(--transition)',
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  border: 'none',
  background: 'none',
  outline: 'none',
  fontFamily: 'var(--font-body)',
  fontSize: '0.875rem',
  color: 'var(--foreground)',
};

const countStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--color-neutral-600)',
  marginLeft: 'auto',
};

const sidebarPanelStyle: React.CSSProperties = {
  width: '320px',
  flexShrink: 0,
  padding: '24px',
  background: 'var(--color-surface)',
  borderRadius: 'calc(var(--radius-lg) * 1.1)',
  border: '1px solid var(--color-divider)',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  animation: 'ls-fade 0.4s ease both',
};

const sidebarTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: '1.15rem',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  color: 'var(--color-text)',
};

const sidebarHideBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  fontSize: '0.9rem',
  color: 'var(--color-neutral-600)',
  cursor: 'pointer',
  fontWeight: 600,
};

const sidebarSectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const sidebarLabelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: 700,
  color: 'var(--color-neutral-600)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const segmentedControlWrapStyle: React.CSSProperties = {
  display: 'flex',
  border: '1px solid var(--color-divider)',
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
  background: active ? '#b96c44' : 'transparent',
  color: active ? '#fff' : 'var(--color-neutral-600)',
  border: 'none',
  cursor: 'pointer',
  transition: 'background 0.2s, color 0.2s',
  whiteSpace: 'nowrap',
});

const sidebarSelectStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-divider)',
  background: 'var(--color-bg)',
  fontSize: '0.9rem',
  fontFamily: 'var(--font-body)',
  color: 'var(--color-text)',
  cursor: 'pointer',
};

const sidebarAmenityChipStyle = (selected: boolean): React.CSSProperties => ({
  fontFamily: 'var(--font-body)',
  fontSize: '0.75rem',
  padding: '6px 12px',
  borderRadius: 'var(--radius-pill)',
  border: `1px solid ${selected ? '#b96c44' : 'var(--color-divider)'}`,
  background: selected ? '#b96c44' : 'transparent',
  color: selected ? '#fff' : 'var(--color-neutral-600)',
  cursor: 'pointer',
  transition: 'var(--transition)',
});

const sidebarClearBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  marginTop: '8px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-divider)',
  background: 'transparent',
  fontFamily: 'var(--font-heading)',
  fontWeight: 600,
  fontSize: '0.95rem',
  cursor: 'pointer',
  color: 'var(--color-text)',
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

const verifiedTagStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontSize: '0.625rem',
  padding: '4px 10px',
  borderRadius: 'var(--radius-pill)',
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
