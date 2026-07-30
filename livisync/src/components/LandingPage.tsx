import { Link } from 'react-router-dom';
import studentFemale from '../assets/student-female.jpg';
import studentMale from '../assets/student-male.jpg';
import hostelOrchard from '../assets/hostel-orchard.jpg';
import hostelStudio from '../assets/hostel-studio.jpg';
import hostelHeritage from '../assets/hostel-heritage.jpg';

interface LandingPageProps {
  isAuthenticated: boolean;
}

export const LandingPage = ({ isAuthenticated }: LandingPageProps) => {
  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes ring-draw {
          from { stroke-dashoffset: 251.2; }
          to { stroke-dashoffset: 40.2; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fade-up 0.8s cubic-bezier(0.19, 1, 0.22, 1) both;
        }
        .animate-ring {
          animation: ring-draw 1.2s cubic-bezier(0.19, 1, 0.22, 1) 0.5s both;
        }
        .landing-link:hover {
          color: var(--primary) !important;
        }
      `}</style>

      {/* Nav */}
      <nav style={navStyle}>
        <div style={navInnerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={logoBadgeStyle}>
              <div style={logoInnerStyle}></div>
            </div>
            <span style={logoTextStyle}>LiviSync</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <a href="#match" className="landing-link" style={navLinkStyle}>Find a Match</a>
            <a href="#hostels" className="landing-link" style={navLinkStyle}>Hostels</a>
            <a href="#safety" className="landing-link" style={navLinkStyle}>Safety</a>
            <Link
              to={isAuthenticated ? "/hostels" : "/login"}
              style={navButtonStyle}
            >
              {isAuthenticated ? "Enter App" : "Start Matching"}
            </Link>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Hero Section */}
        <section id="match" style={heroSectionStyle}>
          <div className="animate-fade-up" style={{ flex: '1' }}>
            <h1 style={heroTitleStyle}>
              Find your <span style={heroItalicStyle}>perfect</span> room rhythm.
            </h1>
            <p style={heroSubtitleStyle}>
              The first lifestyle-first housing platform for students. We match your habits
              before your housing, ensuring your home is a sanctuary, not a stressor.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to={isAuthenticated ? "/roommates" : "/login"} style={primaryHeroButtonStyle}>
                Discover Matches
              </Link>
              <Link to={isAuthenticated ? "/hostels" : "/login"} style={secondaryHeroButtonStyle}>
                Browse Verified Hostels
              </Link>
            </div>
          </div>

          {/* Visual Artifact: Compatibility Match */}
          <div className="animate-fade-up" style={heroVisualContainerStyle}>
            <div style={matchCardStyle}>
              <div style={{ absolute: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top right, rgba(181,92,60,0.03), transparent)' } as any}></div>

              {/* Score Meter */}
              <div style={scoreMeterWrapperStyle}>
                <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e5e4df"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="var(--primary)"
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeLinecap="round"
                    className="animate-ring"
                  />
                </svg>
                <div style={scoreNumberContainerStyle}>
                  <span style={scorePercentStyle}>84%</span>
                  <span style={scoreLabelStyle}>Match Score</span>
                </div>
              </div>

              {/* Avatars Overlay */}
              <div style={avatarsWrapperStyle}>
                <img
                  src={studentFemale}
                  alt="Matched student portrait"
                  style={avatarStyle}
                />
                <img
                  src={studentMale}
                  alt="Matched student portrait"
                  style={{ ...avatarStyle, marginLeft: '-1rem' }}
                />
              </div>

              {/* Lifestyle Tags */}
              <div style={tagsContainerStyle}>
                <span style={tagStyle}>Night Owl</span>
                <span style={tagStyle}>No Smoking</span>
                <span style={tagStyle}>No Pets</span>
              </div>
            </div>
          </div>
        </section>

        {/* Listings Section */}
        <section id="hostels" style={listingsSectionStyle}>
          <div style={listingsHeaderStyle}>
            <div style={{ maxWidth: '480px' }} className="animate-fade-up">
              <h2 style={sectionTitleStyle}>Verified Living Spaces</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Every listing on LiviSync is physically inspected and student-approved for
                safety, hygiene, and amenities.
              </p>
            </div>
          </div>

          <div style={listingsGridStyle}>
            {/* Card 1 */}
            <div className="animate-fade-up" style={listingCardStyle}>
              <div style={imageWrapperStyle}>
                <img
                  src={hostelOrchard}
                  alt="The Orchard Commons student hostel room"
                  style={listingImageStyle}
                />
                <div style={cardBadgesStyle}>
                  <span style={cardBadgeStyle}>Verified</span>
                  <span style={{ ...cardBadgeStyle, backgroundColor: '#10b981', color: 'white', border: 'none' }}>Available</span>
                </div>
              </div>
              <div style={listingFooterStyle}>
                <div>
                  <h3 style={listingTitleStyle}>Hostel</h3>
                  <p style={listingDistanceStyle}>Model Town, Lahore</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={listingPriceStyle}>
                    PKR 12,000<span style={priceMonthStyle}>/mo</span>
                  </p>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    2 units left
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="animate-fade-up" style={listingCardStyle}>
              <div style={imageWrapperStyle}>
                <img
                  src={hostelStudio}
                  alt="Studio Central student lounge"
                  style={listingImageStyle}
                />
                <div style={cardBadgesStyle}>
                  <span style={cardBadgeStyle}>Verified</span>
                </div>
              </div>
              <div style={listingFooterStyle}>
                <div>
                  <h3 style={listingTitleStyle}>Hostel</h3>
                  <p style={listingDistanceStyle}>DHA Phase 5, Lahore</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={listingPriceStyle}>
                    PKR 13,000<span style={priceMonthStyle}>/mo</span>
                  </p>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    4 units left
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="animate-fade-up" style={listingCardStyle}>
              <div style={imageWrapperStyle}>
                <img
                  src={hostelHeritage}
                  alt="Heritage Loft private dorm room"
                  style={listingImageStyle}
                />
                <div style={cardBadgesStyle}>
                  <span style={cardBadgeStyle}>Verified</span>
                  <span style={{ ...cardBadgeStyle, backgroundColor: 'var(--primary)', color: 'white', border: 'none' }}>Premium</span>
                </div>
              </div>
              <div style={listingFooterStyle}>
                <div>
                  <h3 style={listingTitleStyle}>Hostel</h3>
                  <p style={listingDistanceStyle}>Faisal Town, Lahore</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={listingPriceStyle}>
                    PKR 15,000<span style={priceMonthStyle}>/mo</span>
                  </p>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textDecoration: 'underline' }}>
                    Waitlist Open
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Safety Section */}
        <section id="safety" style={safetySectionStyle}>
          <div style={{ maxWidth: '640px' }}>
            <h2 style={safetyTitleStyle}>
              Security isn't an option. <br />
              <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>It's the foundation.</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={safetyIconBoxStyle}>🛡️</div>
                <div>
                  <h4 style={safetyCardTitleStyle}>Identity Verification</h4>
                  <p style={safetyCardDescStyle}>
                    Every student user is authenticated through their official university SSO or
                    student ID. No anonymous profiles. (This is not currently functional but will be in near future.)
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={safetyIconBoxStyle}>👁️</div>
                <div>
                  <h4 style={safetyCardTitleStyle}>On-Site Inspections</h4>
                  <p style={safetyCardDescStyle}>
                    We at LiviSync physically visit every property to verify Room/Building conditions,
                    hygiene standards, and security hardware.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={safetyIconBoxStyle}>🔒</div>
                <div>
                  <h4 style={safetyCardTitleStyle}>Encrypted Roommate Chat</h4>
                  <p style={safetyCardDescStyle}>
                    Connect without sharing personal phone numbers. Our in-app messaging keeps
                    your data private until you're ready to meet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={footerStyle}>
        <div style={footerInnerStyle}>
          <div style={footerGridStyle}>
            {/* Column 1: Intro */}
            <div style={footerColStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>LiviSync</span>
              </div>
              <p style={footerTextStyle}>
                LiviSync is the first ever lifestyle-first housing platform designed specifically for university students. We combine physically verified hostel listings with compatibility matching, helping you find both the perfect room and the ideal roommate.
              </p>
            </div>

            {/* Column 2: Team */}
            <div style={footerColStyle}>
              <h4 style={footerHeadingStyle}>The Team</h4>
              <p style={footerTextStyle}>
                LiviSync is built by fellow hostellites who've been through the same housing headaches, on a mission to make university housing safe, easy, transparent, and roommate matchmaking stress-free.
              </p>
              <p style={{ ...footerTextStyle, fontWeight: 600, color: 'var(--foreground)' }}>
                Built by Gen-Z,
                for the Gen-Z
              </p>
            </div>

            {/* Column 3: Contact */}
            <div style={footerColStyle}>
              <h4 style={footerHeadingStyle}>Contact Us</h4>
              <ul style={footerListStyle}>
                <li style={footerListItemStyle}>📧 <a href="mailto:support@livisync.me" style={{ color: 'inherit', textDecoration: 'underline' }}>support@livisync.me</a></li>
                <li style={footerListItemStyle}>📞 +92 314 4536266</li>
                <li style={footerListItemStyle}>📍 Faisal Town, Lahore, Pakistan</li>
              </ul>
            </div>
          </div>

          <div style={footerBottomStyle}>
            <div style={{ display: 'flex', gap: '2rem', fontSize: '0.8rem' }}>
              <a href="#" className="landing-link" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Privacy Policy</a>
              <a href="#" className="landing-link" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Terms of Service</a>
              <a href="#" className="landing-link" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Safety Guide</a>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', opacity: 0.8, margin: 0 }}>
              © {new Date().getFullYear()} LiviSync. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ─── Inline Styles for Landing Screen ──────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: 'var(--background)',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-sans)',
};

const navStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 50,
  backgroundColor: 'rgba(251, 251, 249, 0.85)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid var(--border)',
};

const navInnerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '1.25rem 2rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const logoBadgeStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  backgroundColor: 'var(--primary)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const logoInnerStyle: React.CSSProperties = {
  width: '12px',
  height: '12px',
  backgroundColor: 'var(--background)',
  transform: 'rotate(45deg)',
  borderRadius: '2px',
};

const logoTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 'bold',
  fontSize: '1.25rem',
  letterSpacing: '-0.02em',
  color: 'var(--foreground)',
};

const navLinkStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--muted)',
  textDecoration: 'none',
  transition: 'var(--transition)',
};

const navButtonStyle: React.CSSProperties = {
  backgroundColor: 'var(--foreground)',
  color: 'var(--background)',
  padding: '0.5rem 1.25rem',
  borderRadius: '9999px',
  fontSize: '0.75rem',
  fontWeight: 700,
  textDecoration: 'none',
  transition: 'var(--transition)',
};

const heroSectionStyle: React.CSSProperties = {
  padding: '6rem 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '4rem',
  flexWrap: 'wrap',
};

const heroTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '3.75rem',
  fontWeight: 900,
  lineHeight: 1.05,
  letterSpacing: '-0.04em',
  marginBottom: '2rem',
  color: 'var(--foreground)',
};

const heroItalicStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontStyle: 'italic',
  fontWeight: 600,
  color: 'var(--primary)',
};

const heroSubtitleStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  color: 'var(--muted)',
  maxWidth: '44ch',
  lineHeight: 1.6,
  marginBottom: '2.5rem',
};

const primaryHeroButtonStyle: React.CSSProperties = {
  backgroundColor: 'var(--primary)',
  color: 'var(--primary-foreground)',
  padding: '1rem 2rem',
  borderRadius: '12px',
  fontWeight: 700,
  textDecoration: 'none',
  boxShadow: '0 4px 14px rgba(181, 92, 60, 0.2)',
  transition: 'var(--transition)',
};

const secondaryHeroButtonStyle: React.CSSProperties = {
  border: '1px solid var(--border)',
  backgroundColor: 'var(--card)',
  color: 'var(--foreground)',
  padding: '1rem 2rem',
  borderRadius: '12px',
  fontWeight: 700,
  textDecoration: 'none',
  transition: 'var(--transition)',
};

const heroVisualContainerStyle: React.CSSProperties = {
  flex: '1',
  display: 'flex',
  justifyContent: 'center',
  minWidth: '320px',
};

const matchCardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '400px',
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '32px',
  padding: '2.5rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: 'var(--shadow)',
};

const scoreMeterWrapperStyle: React.CSSProperties = {
  position: 'relative',
  width: '180px',
  height: '180px',
};

const scoreNumberContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

const scorePercentStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '3rem',
  fontWeight: 800,
  color: 'var(--foreground)',
  letterSpacing: '-0.05em',
};

const scoreLabelStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  fontWeight: 700,
  color: 'var(--muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginTop: '2px',
};

const avatarsWrapperStyle: React.CSSProperties = {
  display: 'flex',
  marginTop: '2rem',
};

const avatarStyle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  border: '4px solid var(--card)',
  objectFit: 'cover',
  boxShadow: 'var(--shadow-sm)',
};

const tagsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  marginTop: '1.5rem',
};

const tagStyle: React.CSSProperties = {
  fontSize: '0.68rem',
  fontWeight: 700,
  color: 'var(--foreground)',
  backgroundColor: 'var(--secondary)',
  border: '1px solid var(--border)',
  borderRadius: '9999px',
  padding: '0.25rem 0.75rem',
};

const listingsSectionStyle: React.CSSProperties = {
  padding: '6rem 0',
  borderTop: '1px solid var(--border)',
};

const listingsHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: '3rem',
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '2rem',
  fontWeight: 800,
  color: 'var(--foreground)',
  marginBottom: '1rem',
};

const listingsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '2rem',
};

const listingCardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const imageWrapperStyle: React.CSSProperties = {
  position: 'relative',
  borderRadius: '16px',
  aspectRatio: '4/5',
  overflow: 'hidden',
  backgroundColor: 'var(--secondary)',
};

const listingImageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const cardBadgesStyle: React.CSSProperties = {
  position: 'absolute',
  top: '1rem',
  left: '1rem',
  display: 'flex',
  gap: '0.5rem',
};

const cardBadgeStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  padding: '0.25rem 0.625rem',
  borderRadius: '6px',
  fontSize: '0.625rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const listingFooterStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
};

const listingTitleStyle: React.CSSProperties = {
  fontWeight: 'bold',
  fontSize: '1.1rem',
  margin: 0,
  color: 'var(--foreground)',
};

const listingDistanceStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--muted)',
  margin: '2px 0 0 0',
};

const listingPriceStyle: React.CSSProperties = {
  color: 'var(--primary)',
  fontWeight: 'bold',
  margin: 0,
  fontSize: '1.1rem',
};

const priceMonthStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--muted)',
  fontWeight: 'normal',
};

const safetySectionStyle: React.CSSProperties = {
  padding: '5rem 4rem',
  backgroundColor: 'var(--foreground)',
  color: 'var(--background)',
  borderRadius: '32px',
  marginBottom: '6rem',
};

const safetyTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '2.5rem',
  fontWeight: 800,
  color: 'var(--background)',
  marginBottom: '3rem',
  lineHeight: 1.15,
};

const safetyIconBoxStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.25rem',
  flexShrink: 0,
};

const safetyCardTitleStyle: React.CSSProperties = {
  fontWeight: 'bold',
  fontSize: '1.1rem',
  margin: '0 0 0.5rem 0',
  color: 'var(--background)',
};

const safetyCardDescStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: 'rgba(255, 255, 255, 0.7)',
  margin: 0,
  lineHeight: 1.6,
};

const footerStyle: React.CSSProperties = {
  borderTop: '1px solid var(--border)',
  padding: '5rem 0 3rem 0',
  backgroundColor: 'var(--secondary)',
};

const footerInnerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 2rem',
};

const footerGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '3rem',
  marginBottom: '4rem',
};

const footerColStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const footerHeadingStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 700,
  color: 'var(--foreground)',
  marginBottom: '1rem',
  fontFamily: 'var(--font-display)',
};

const footerTextStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  lineHeight: '1.6',
  color: 'var(--muted)',
  margin: 0,
};

const footerListStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const footerListItemStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--muted)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const footerBottomStyle: React.CSSProperties = {
  borderTop: '1px solid var(--border)',
  paddingTop: '2rem',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '1.5rem',
};

