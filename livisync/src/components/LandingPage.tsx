import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRevealContainer, useCountUp, useInView } from '../hooks/useReveal';
import studentFemale from '../assets/student-female.jpg';
import studentMale from '../assets/student-male.jpg';
import hostelOrchard from '../assets/hostel-orchard.jpg';
import hostelStudio from '../assets/hostel-studio.jpg';
import hostelHeritage from '../assets/hostel-heritage.jpg';
import logo from '../assets/logo.png';

interface LandingPageProps {
  isAuthenticated: boolean;
}

const FEATURED_HOSTELS = [
  { name: 'Orchard Commons', location: 'Model Town, Lahore', price: 'PKR 12,000', img: hostelOrchard },
  { name: 'Studio Central', location: 'DHA Phase 5, Lahore', price: 'PKR 13,000', img: hostelStudio },
  { name: 'Heritage Loft', location: 'Faisal Town, Lahore', price: 'PKR 15,000', img: hostelHeritage },
  { name: 'Orchard Annex', location: 'Johar Town, Lahore', price: 'PKR 11,000', img: hostelOrchard },
];

const INCLUSIONS = [
  'Physically inspected rooms and buildings',
  'Electricity, gas and water status shown upfront',
  'Sharing type, capacity and seats available',
  'Verified owner contact, revealed on request',
  'Encrypted in-app chat before phone numbers',
  'One-tap safety reporting from any profile',
  'Admin-verified listings only in the directory',
];

const SAFETY = [
  {
    no: '01',
    title: 'Identity verification',
    body: 'Every student user is authenticated through their official university SSO or student ID. No anonymous profiles.',
  },
  {
    no: '02',
    title: 'On-site inspections',
    body: 'We at LiviSync physically visit every property to verify room and building conditions, hygiene standards, and security hardware.',
  },
  {
    no: '03',
    title: 'Encrypted roommate chat',
    body: 'Connect without sharing personal phone numbers. Our in-app messaging keeps your data private until you’re ready to meet.',
  },
];

const MARQUEE_ITEMS = [
  'Habits before housing',
  'Physically inspected rooms',
  'Compatibility scoring',
  'Encrypted roommate chat',
  'Built by Gen-Z, for the Gen-Z',
];

// ─── Intro splash ────────────────────────────────────────────────────────────────
function IntroSplash() {
  return (
    <div style={introStyle}>
      <img src={logo} alt="LiviSync" style={introMarkStyle} />
      <div style={introWordStyle}>LIVISYNC</div>
      <div style={introTaglineStyle}>Syncing your living</div>
    </div>
  );
}

// ─── Match score ring ────────────────────────────────────────────────────────────
function MatchRing({ score }: { score: number }) {
  const { ref, inView } = useInView(0.3);
  const value = useCountUp(score, inView);
  const circumference = 251.2;

  return (
    <div ref={ref} style={{ position: 'relative', width: '190px', height: '190px' }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r="40" stroke="var(--color-accent-200)" strokeWidth="5" fill="transparent" />
        <circle
          cx="50" cy="50" r="40"
          stroke="var(--color-accent)" strokeWidth="5" fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={inView ? circumference * (1 - score / 100) : circumference}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.4s var(--ease-organic)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.75rem', lineHeight: 1 }}>{value}%</span>
        <span style={ringLabelStyle}>Match score</span>
      </div>
    </div>
  );
}

// ─── Inspected-rooms floating stat ───────────────────────────────────────────────
function InspectedStat() {
  const { ref, inView } = useInView(0.4);
  const count = useCountUp(128, inView);
  return (
    <div ref={ref} style={floatingStatStyle}>
      <div style={floatingStatLabelStyle}>On-site inspected</div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.875rem', lineHeight: 1.1 }}>{count}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-600)' }}>rooms across Lahore</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────────
export const LandingPage = ({ isAuthenticated }: LandingPageProps) => {
  const navigate = useNavigate();
  const [intro, setIntro] = useState(true);
  const [search, setSearch] = useState('');
  const barRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const pageRef = useRevealContainer<HTMLDivElement>([]);

  const appHref = isAuthenticated ? '/hostels' : '/login';
  const roommatesHref = isAuthenticated ? '/roommates' : '/login';

  useEffect(() => {
    const timer = setTimeout(() => setIntro(false), 1750);
    return () => clearTimeout(timer);
  }, []);

  // Scroll progress bar + hero parallax
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      if (barRef.current) {
        barRef.current.style.width = `${scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0}%`;
      }
      if (heroImgRef.current) {
        heroImgRef.current.style.transform = `translateY(${doc.scrollTop * 0.18}px)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goSearch = () => {
    navigate(isAuthenticated ? '/hostels' : '/login');
  };

  return (
    <div ref={pageRef} style={containerStyle}>
      <style>{`
        .ls-nav-link:hover { background: var(--color-accent-100) !important; }
        .ls-nav-cta:hover { background: var(--color-accent) !important; }
        .ls-rail-card img { transition: transform 1.1s var(--ease-organic); }
        .ls-rail-card:hover img { transform: scale(1.06); }
        .ls-inclusion { transition: padding-left 0.4s var(--ease-organic); }
        .ls-inclusion:hover { padding-left: 12px; }
        .ls-pill-btn:hover { background: var(--color-accent-600) !important; }
        .ls-dark-btn:hover { background: var(--color-accent) !important; }
        .ls-foot-link:hover { color: var(--color-accent) !important; }
        .ls-rail::-webkit-scrollbar { height: 6px; }
        .ls-rail::-webkit-scrollbar-thumb { background: var(--color-neutral-300); border-radius: 999px; }
        @media (max-width: 900px) {
          .ls-two-col { grid-template-columns: 1fr !important; gap: 40px !important; }
          .ls-section { padding-left: 24px !important; padding-right: 24px !important; }
          .ls-rail { padding-left: 24px !important; padding-right: 24px !important; }
          /* Drop the secondary link but always keep a way into the app */
          .ls-nav-link { display: none !important; }
          .ls-nav-cta { padding: 0 16px !important; font-size: 0.625rem !important; letter-spacing: 0.12em !important; }
          .ls-footer-inner { padding-left: 24px !important; padding-right: 24px !important; }
          .ls-footer-grid { margin-top: 48px !important; gap: 28px !important; }
        }
        @media (max-width: 420px) {
          .ls-rail-card { flex: 0 0 260px !important; }
        }
      `}</style>

      {/* ── Scroll progress ── */}
      <div ref={barRef} style={progressBarStyle} />

      {/* ── Intro splash ── */}
      {intro && <IntroSplash />}

      {/* ── Fixed top bar ── */}
      <div style={topBarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 22px' }}>
          <img src={logo} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          <span style={wordmarkStyle}>LIVISYNC</span>
        </div>
        <div className="ls-topbar-links" style={{ display: 'flex', alignItems: 'stretch' }}>
          <Link to={appHref} className="ls-nav-link" style={topBarLinkStyle}>
            Verified hostels
          </Link>
          <Link to={roommatesHref} className="ls-nav-cta" style={topBarCtaStyle}>
            {isAuthenticated ? 'Enter app →' : 'Start matching →'}
          </Link>
        </div>
      </div>

      {/* ══════════════ HERO ══════════════ */}
      <section style={heroSectionStyle}>
        <img
          ref={heroImgRef}
          src={hostelOrchard}
          alt="Student hostel common room"
          style={heroImageStyle}
        />
        <img src={logo} alt="" style={heroMarkStyle} />
        <div style={{ position: 'relative', textAlign: 'center', padding: '0 24px', maxWidth: '1000px' }}>
          <div style={heroEyebrowStyle}>Lifestyle-first student housing · Lahore</div>
          <h1 style={heroTitleStyle}>
            <span style={{ display: 'inline-block', animation: 'ls-rise 1s var(--ease-organic) 0.2s both' }}>Find</span>
            <span style={{ display: 'inline-block', animation: 'ls-rise 1s var(--ease-organic) 0.3s both' }}>your</span>
            <span style={{ display: 'inline-block', color: 'var(--color-accent-300)', animation: 'ls-rise 1s var(--ease-organic) 0.4s both' }}>perfect</span>
            <span style={{ display: 'block', width: '100%', animation: 'ls-rise 1s var(--ease-organic) 0.5s both' }}>room rhythm.</span>
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', animation: 'ls-fade 1s ease 0.75s both' }}>
            <div style={heroSearchStyle}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') goSearch(); }}
                placeholder="Search a hostel, area or university"
                aria-label="Search a hostel, area or university"
                style={heroSearchInputStyle}
              />
              <button onClick={goSearch} aria-label="Search hostels" style={heroSearchBtnStyle} className="ls-pill-btn">↗</button>
            </div>
          </div>
          <div style={scrollHintStyle}>Scroll ↓</div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div style={marqueeWrapStyle}>
        <div style={marqueeTrackStyle}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={`${item}-${i}`} style={{ display: 'inline-flex', gap: '56px' }}>
              <span>{item}</span>
              <span style={{ color: 'var(--color-accent-400)' }}>✳</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════ VERIFIED LIVING SPACES ══════════════ */}
      <section id="hostels" style={verifiedSectionStyle}>
        <div className="ls-section" style={sectionInnerStyle}>
          <div className="reveal" data-reveal style={eyebrowStyle}>Verified living spaces</div>
          <h2 className="reveal display" data-reveal data-delay="0.08" style={verifiedTitleStyle}>
            The first lifestyle-first housing platform for students.
          </h2>
          <p className="reveal" data-reveal data-delay="0.14" style={verifiedBodyStyle}>
            We match your habits before your housing, ensuring your home is a sanctuary, not a stressor.
            Every listing on LiviSync is physically inspected and student-approved for safety, hygiene, and amenities.
          </p>
          <Link
            to={appHref}
            className="reveal ls-pill-btn"
            data-reveal
            data-delay="0.2"
            style={accentPillLinkStyle}
          >
            Browse verified hostels →
          </Link>
        </div>

        <div className="ls-rail" style={railStyle}>
          {FEATURED_HOSTELS.map((h, i) => (
            <div
              key={`${h.name}-${i}`}
              className="reveal ls-rail-card"
              data-reveal
              data-delay={(i * 0.06).toFixed(2)}
              style={railCardStyle}
            >
              <div style={{ aspectRatio: '4/5', overflow: 'hidden' }}>
                <img src={h.img} alt={h.name} className="washed" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={railCardTitleStyle}>{h.name}</div>
              <div style={railCardMetaStyle}>
                <span>{h.location}</span>
                <span style={{ color: 'var(--color-accent-300)' }}>{h.price} / mo</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ INCLUSIONS ══════════════ */}
      <section className="ls-two-col ls-section" style={inclusionsSectionStyle}>
        <div>
          <div className="reveal" data-reveal style={eyebrowStyle}>Inclusions</div>
          <h2 className="reveal display-alt" data-reveal data-delay="0.06" style={inclusionsTitleStyle}>
            Everything checked, before you move in
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {INCLUSIONS.map((inc, i) => (
              <div
                key={inc}
                className="reveal ls-inclusion"
                data-reveal
                data-delay={(i * 0.04).toFixed(2)}
                style={inclusionRowStyle}
              >
                <span style={inclusionDotStyle} />
                {inc}
              </div>
            ))}
          </div>
        </div>
        <div className="reveal" data-reveal data-delay="0.1" style={{ position: 'relative' }}>
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            <img src={hostelStudio} alt="Verified hostel studio" className="washed" style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover' }} />
          </div>
          <InspectedStat />
        </div>
      </section>

      {/* ══════════════ TRUST & SAFETY ══════════════ */}
      <section id="safety" style={safetySectionStyle}>
        <div className="ls-two-col ls-section" style={safetyInnerStyle}>
          <div>
            <div className="reveal" data-reveal style={{ ...eyebrowStyle, color: 'var(--color-accent-300)' }}>Trust &amp; safety</div>
            <h2 className="reveal display" data-reveal data-delay="0.06" style={safetyTitleStyle}>
              Security isn&rsquo;t an option.<br />
              <span style={{ color: 'rgba(245, 234, 216, 0.55)' }}>It&rsquo;s the foundation.</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '34px' }}>
              {SAFETY.map((s, i) => (
                <div key={s.no} className="reveal" data-reveal data-delay={(i * 0.08).toFixed(2)} style={{ display: 'flex', gap: '22px' }}>
                  <div style={safetyNumberStyle}>{s.no}</div>
                  <div>
                    <div style={safetyItemTitleStyle}>{s.title}</div>
                    <div style={safetyItemBodyStyle}>{s.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal" data-reveal data-delay="0.12" style={matchCardStyle}>
            <MatchRing score={84} />
            <div style={{ display: 'flex', marginTop: '26px' }}>
              <img src={studentFemale} alt="Matched student" style={matchAvatarStyle} />
              <img src={studentMale} alt="Matched student" style={{ ...matchAvatarStyle, marginLeft: '-16px' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span className="badge badge-accent">Night Owl</span>
              <span className="badge badge-success">No Smoking</span>
              <span className="badge badge-neutral">No Pets</span>
            </div>
            <Link to={roommatesHref} className="ls-dark-btn" style={darkPillLinkStyle}>Discover matches →</Link>
          </div>
        </div>
      </section>

      {/* ══════════════ TEAM ══════════════ */}
      <section className="ls-two-col ls-section" style={teamSectionStyle}>
        <div className="reveal" data-reveal>
          <div style={eyebrowStyle}>The team</div>
          <h2 className="display-alt" style={teamTitleStyle}>Built by fellow hostellites who&rsquo;ve been through it</h2>
          <p style={teamBodyStyle}>
            LiviSync is on a mission to make university housing safe, easy, transparent, and roommate matchmaking stress-free.
          </p>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.375rem', color: 'var(--color-accent-700)' }}>
            Built by Gen-Z, for the Gen-Z
          </div>
        </div>
        <div className="reveal" data-reveal data-delay="0.1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginTop: '38px' }}>
            <img src={hostelHeritage} alt="Heritage loft dorm" className="washed" style={teamImageStyle} />
          </div>
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <img src={hostelOrchard} alt="Orchard commons room" className="washed" style={teamImageStyle} />
          </div>
        </div>
      </section>

      {/* ══════════════ NEWSLETTER ══════════════ */}
      <section style={newsletterSectionStyle}>
        <div className="reveal ls-two-col ls-section" data-reveal style={newsletterInnerStyle}>
          <h2 className="display-alt" style={newsletterTitleStyle}>
            Stay up-to-date with new verified hostels near you
          </h2>
          <div>
            <div style={newsletterFieldStyle}>
              <span style={newsletterLabelStyle}>Email</span>
              <input
                type="email"
                placeholder="you@university.edu.pk"
                aria-label="Email address"
                style={newsletterInputStyle}
              />
              <button className="ls-dark-btn" style={newsletterBtnStyle}>Subscribe</button>
            </div>
            <div style={newsletterNoteStyle}>
              By subscribing you agree to receive occasional emails from LiviSync. We never share your data.
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer style={footerStyle}>
        <div className="ls-footer-inner" style={{ position: 'relative', maxWidth: '1240px', margin: '0 auto', padding: '0 48px' }}>
          <div className="reveal" data-reveal style={footerWordStyle}>LIVI</div>
          <div style={footerImageWrapStyle}>
            <img src={hostelStudio} alt="LiviSync verified hostel" className="washed" style={{ width: '100%', aspectRatio: '16/7', objectFit: 'cover' }} />
          </div>
          <div className="reveal" data-reveal data-delay="0.08" style={{ ...footerWordStyle, position: 'relative', zIndex: 2 }}>SYNC</div>

          <div className="ls-footer-grid" style={footerGridStyle}>
            <div>
              <div style={footerColLabelStyle}>Address</div>
              <div style={footerColBodyStyle}>Faisal Town,<br />Lahore, Pakistan</div>
            </div>
            <div>
              <div style={footerColLabelStyle}>Contact us</div>
              <div style={footerColBodyStyle}>
                <a href="mailto:support@livisync.me" className="ls-foot-link" style={{ color: 'var(--color-accent-700)' }}>support@livisync.me</a>
                <br />+92 314 4536266
              </div>
            </div>
            <div>
              <div style={footerColLabelStyle}>Platform</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                <Link to={appHref} className="ls-foot-link">Hostels</Link>
                <Link to={roommatesHref} className="ls-foot-link">Roommates</Link>
                <Link to={isAuthenticated ? '/chats' : '/login'} className="ls-foot-link">Inbox</Link>
                <Link to={isAuthenticated ? '/profile' : '/login'} className="ls-foot-link">Profile</Link>
              </div>
            </div>
            <div>
              <div style={footerColLabelStyle}>Legal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--color-neutral-700)' }}>
                <Link to="/privacy" className="ls-foot-link">Privacy Policy</Link>
                <Link to="/terms" className="ls-foot-link">Terms of Service</Link>
              </div>
            </div>
          </div>

          <div style={footerBottomStyle}>
            <span>© {new Date().getFullYear()} LiviSync. All rights reserved.</span>
            <span>Roommate finder &amp; hostel directory</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  position: 'relative',
  minHeight: '100vh',
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
  overflowX: 'hidden',
};

const progressBarStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  height: '3px',
  width: '0%',
  background: 'var(--color-accent)',
  zIndex: 400,
};

// ── Intro splash ──
const introStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 500,
  background: 'var(--color-text)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '22px',
  animation: 'ls-fade 0.3s ease both',
};

const introMarkStyle: React.CSSProperties = {
  width: '96px',
  height: '96px',
  objectFit: 'contain',
  animation: 'ls-mark 1s var(--ease-organic) both',
};

const introWordStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '2.375rem',
  color: 'var(--color-bg)',
  letterSpacing: '0.34em',
  animation: 'ls-spread 1.1s var(--ease-organic) 0.25s both',
};

const introTaglineStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--color-accent-400)',
  animation: 'ls-fade 0.6s ease 0.7s both',
};

// ── Top bar ──
const topBarStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 250,
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'space-between',
  background: 'rgba(245, 234, 216, 0.88)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
};

const wordmarkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.1875rem',
  letterSpacing: '0.2em',
};

const topBarLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontFamily: 'var(--font-body)',
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--color-text)',
  padding: '0 22px',
  cursor: 'pointer',
  borderLeft: '1px solid var(--color-divider)',
};

const topBarCtaStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  background: 'var(--color-text)',
  color: 'var(--color-bg)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  padding: '0 24px',
  cursor: 'pointer',
};

// ── Hero ──
const heroSectionStyle: React.CSSProperties = {
  position: 'relative',
  height: 'min(94vh, 900px)',
  minHeight: '620px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--color-neutral-900)',
};

const heroImageStyle: React.CSSProperties = {
  position: 'absolute',
  inset: '-8% 0',
  width: '100%',
  height: '116%',
  objectFit: 'cover',
  filter: 'saturate(0.55) contrast(0.92) brightness(0.52)',
};

const heroMarkStyle: React.CSSProperties = {
  position: 'absolute',
  right: '-90px',
  bottom: '-70px',
  width: '520px',
  opacity: 0.09,
  animation: 'ls-float 9s ease-in-out infinite',
};

const heroEyebrowStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--color-accent-300)',
  marginBottom: '26px',
  animation: 'ls-fade 0.9s ease 0.15s both',
};

const heroTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 400,
  textTransform: 'uppercase',
  fontSize: 'clamp(44px, 11vw, 150px)',
  lineHeight: 0.9,
  color: 'var(--color-bg)',
  margin: '0 0 30px',
  letterSpacing: '0.03em',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0 0.28em',
  justifyContent: 'center',
};

const heroSearchStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'var(--color-bg)',
  borderRadius: 'var(--radius-pill)',
  padding: '7px 7px 7px 22px',
  width: 'min(520px, 100%)',
  boxShadow: 'var(--shadow-lg)',
};

const heroSearchInputStyle: React.CSSProperties = {
  flex: 1,
  border: 0,
  background: 'transparent',
  fontFamily: 'var(--font-body)',
  fontSize: '0.875rem',
  color: 'var(--color-text)',
  padding: '8px 0',
  outline: 'none',
  minWidth: 0,
};

const heroSearchBtnStyle: React.CSSProperties = {
  width: '46px',
  height: '46px',
  borderRadius: 'var(--radius-pill)',
  border: 0,
  background: 'var(--color-accent)',
  color: 'var(--color-bg)',
  fontSize: '1.0625rem',
  cursor: 'pointer',
  flexShrink: 0,
};

const scrollHintStyle: React.CSSProperties = {
  marginTop: '34px',
  fontSize: '0.8125rem',
  color: 'rgba(245, 234, 216, 0.72)',
  animation: 'ls-fade 1s ease 0.95s both',
};

// ── Marquee ──
const marqueeWrapStyle: React.CSSProperties = {
  background: 'var(--color-text)',
  color: 'var(--color-bg)',
  padding: '14px 0',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
};

const marqueeTrackStyle: React.CSSProperties = {
  display: 'inline-flex',
  gap: '56px',
  animation: 'ls-marquee 26s linear infinite',
  fontSize: '0.75rem',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
};

// ── Verified section ──
const verifiedSectionStyle: React.CSSProperties = {
  background: 'var(--color-accent-100)',
  padding: '110px 0 90px',
};

const sectionInnerStyle: React.CSSProperties = {
  maxWidth: '1240px',
  margin: '0 auto',
  padding: '0 48px',
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--color-accent-700)',
  marginBottom: '26px',
};

const verifiedTitleStyle: React.CSSProperties = {
  fontSize: 'clamp(42px, 5.6vw, 88px)',
  letterSpacing: '0.02em',
  lineHeight: 0.94,
  maxWidth: '20ch',
  margin: '0 0 30px',
};

const verifiedBodyStyle: React.CSSProperties = {
  fontSize: '1.0625rem',
  maxWidth: '56ch',
  color: 'var(--color-neutral-700)',
  margin: '0 0 34px',
};

const accentPillLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  background: 'var(--color-accent)',
  color: 'var(--color-bg)',
  fontFamily: 'var(--font-heading)',
  fontSize: '0.75rem',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  padding: '14px 26px',
  borderRadius: 'var(--radius-pill)',
};

const railStyle: React.CSSProperties = {
  display: 'flex',
  gap: '2px',
  marginTop: '56px',
  overflowX: 'auto',
  padding: '0 48px 8px',
};

const railCardStyle: React.CSSProperties = {
  flex: '0 0 320px',
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden',
  background: 'var(--color-text)',
};

const railCardTitleStyle: React.CSSProperties = {
  padding: '14px 16px',
  color: 'var(--color-bg)',
  fontFamily: 'var(--font-heading)',
  fontSize: '1rem',
};

const railCardMetaStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 16px 14px',
  borderTop: '1px solid rgba(245, 234, 216, 0.16)',
  fontSize: '0.6875rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'rgba(245, 234, 216, 0.7)',
};

// ── Inclusions ──
const inclusionsSectionStyle: React.CSSProperties = {
  maxWidth: '1240px',
  margin: '0 auto',
  padding: '110px 48px',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '72px',
  alignItems: 'start',
};

const inclusionsTitleStyle: React.CSSProperties = {
  fontSize: 'clamp(32px, 3.8vw, 58px)',
  margin: '0 0 34px',
};

const inclusionRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '16px 4px',
  borderBottom: '1px solid var(--color-divider)',
  fontSize: '1rem',
};

const inclusionDotStyle: React.CSSProperties = {
  width: '7px',
  height: '7px',
  borderRadius: 'var(--radius-pill)',
  background: 'var(--color-accent-2-500)',
  flexShrink: 0,
};

const floatingStatStyle: React.CSSProperties = {
  position: 'absolute',
  left: '-32px',
  bottom: '44px',
  background: 'var(--color-bg)',
  borderRadius: 'var(--radius-lg)',
  padding: '20px 26px',
  boxShadow: 'var(--shadow-lg)',
  animation: 'ls-float 7s ease-in-out infinite',
};

const floatingStatLabelStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--color-neutral-600)',
  marginBottom: '6px',
};

// ── Trust & safety ──
const safetySectionStyle: React.CSSProperties = {
  background: 'var(--color-text)',
  color: 'var(--color-bg)',
  padding: '110px 0',
};

const safetyInnerStyle: React.CSSProperties = {
  maxWidth: '1240px',
  margin: '0 auto',
  padding: '0 48px',
  display: 'grid',
  gridTemplateColumns: '1.05fr 0.95fr',
  gap: '80px',
  alignItems: 'center',
};

const safetyTitleStyle: React.CSSProperties = {
  fontSize: 'clamp(42px, 5.4vw, 84px)',
  color: 'var(--color-bg)',
  margin: '0 0 46px',
  lineHeight: 0.92,
  letterSpacing: '0.02em',
};

const safetyNumberStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: '0.8125rem',
  color: 'var(--color-accent-300)',
  paddingTop: '5px',
  flexShrink: 0,
};

const safetyItemTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: '1.25rem',
  marginBottom: '8px',
};

const safetyItemBodyStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  lineHeight: 1.65,
  color: 'rgba(245, 234, 216, 0.68)',
  maxWidth: '52ch',
};

const matchCardStyle: React.CSSProperties = {
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  borderRadius: 'calc(var(--radius-lg) * 1.4)',
  padding: '46px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const ringLabelStyle: React.CSSProperties = {
  fontSize: '0.625rem',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--color-neutral-600)',
};

const matchAvatarStyle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: 'var(--radius-pill)',
  objectFit: 'cover',
  border: '4px solid var(--color-bg)',
};

const darkPillLinkStyle: React.CSSProperties = {
  marginTop: '28px',
  display: 'inline-flex',
  alignItems: 'center',
  background: 'var(--color-text)',
  color: 'var(--color-bg)',
  fontFamily: 'var(--font-heading)',
  fontSize: '0.75rem',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  padding: '14px 24px',
  borderRadius: 'var(--radius-pill)',
};

// ── Team ──
const teamSectionStyle: React.CSSProperties = {
  maxWidth: '1240px',
  margin: '0 auto',
  padding: '110px 48px',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '64px',
  alignItems: 'center',
};

const teamTitleStyle: React.CSSProperties = {
  fontSize: 'clamp(28px, 3.2vw, 46px)',
  margin: '0 0 22px',
  maxWidth: '24ch',
};

const teamBodyStyle: React.CSSProperties = {
  fontSize: '1.03rem',
  color: 'var(--color-neutral-700)',
  maxWidth: '52ch',
  margin: '0 0 26px',
};

const teamImageStyle: React.CSSProperties = {
  width: '100%',
  aspectRatio: '3/4',
  objectFit: 'cover',
};

// ── Newsletter ──
const newsletterSectionStyle: React.CSSProperties = {
  background: 'var(--color-accent-2-300)',
  padding: '74px 0',
};

const newsletterInnerStyle: React.CSSProperties = {
  maxWidth: '1240px',
  margin: '0 auto',
  padding: '0 48px',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '56px',
  alignItems: 'center',
};

const newsletterTitleStyle: React.CSSProperties = {
  fontSize: 'clamp(26px, 2.9vw, 42px)',
  margin: 0,
  maxWidth: '26ch',
  color: 'var(--color-accent-2-900)',
  lineHeight: 1,
};

const newsletterFieldStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  borderBottom: '1px solid var(--color-accent-2-700)',
  paddingBottom: '10px',
  flexWrap: 'wrap',
};

const newsletterLabelStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--color-accent-2-800)',
};

const newsletterInputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: '160px',
  border: 0,
  background: 'transparent',
  outline: 'none',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9375rem',
  color: 'var(--color-accent-2-900)',
};

const newsletterBtnStyle: React.CSSProperties = {
  border: 0,
  cursor: 'pointer',
  background: 'var(--color-text)',
  color: 'var(--color-bg)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  padding: '11px 20px',
  borderRadius: 'var(--radius-pill)',
};

const newsletterNoteStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  color: 'var(--color-accent-2-800)',
  marginTop: '12px',
};

// ── Footer ──
const footerStyle: React.CSSProperties = {
  background: 'var(--color-bg)',
  padding: '90px 0 40px',
  overflow: 'hidden',
};

const footerWordStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(70px, 19vw, 280px)',
  lineHeight: 0.82,
  letterSpacing: '0.14em',
  textIndent: '0.14em',
  textAlign: 'center',
  color: 'var(--color-text)',
};

const footerImageWrapStyle: React.CSSProperties = {
  position: 'relative',
  margin: '-6% auto -4%',
  width: 'min(760px, 100%)',
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-lg)',
};

const footerGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '40px',
  marginTop: '80px',
  paddingTop: '40px',
  borderTop: '1px solid var(--color-divider)',
};

const footerColLabelStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--color-neutral-600)',
  marginBottom: '14px',
};

const footerColBodyStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  lineHeight: 1.7,
};

const footerBottomStyle: React.CSSProperties = {
  marginTop: '44px',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  flexWrap: 'wrap',
  fontSize: '0.72rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-neutral-600)',
};
