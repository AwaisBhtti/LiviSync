import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import studentFemale from '../assets/student-female.jpg';
import studentMale from '../assets/student-male.jpg';
import hostelOrchard from '../assets/hostel-orchard.jpg';
import hostelStudio from '../assets/hostel-studio.jpg';
import hostelHeritage from '../assets/hostel-heritage.jpg';
import logo from '../assets/logo.png';

interface LandingPageProps {
  isAuthenticated: boolean;
}

// ─── Scroll-triggered animation hook (re-triggers every time element enters viewport) ──
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { setInView(entry.isIntersecting); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Animated counter hook ───────────────────────────────────────────────────────
function useCounter(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [active, target, duration]);
  return count;
}

// ─── Floating particle component ─────────────────────────────────────────────────
function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 3,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.4 + 0.1,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            opacity: p.opacity,
            animation: `float-particle ${p.duration}s ${p.delay}s infinite ease-in-out alternate`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Tilt card component ─────────────────────────────────────────────────────────
function TiltCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -8;
    const rotateY = (x - centerX) / centerX * 8;
    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
  }, []);
  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
  }, []);
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, transition: 'transform 0.15s ease', willChange: 'transform', cursor: 'default' }}
    >
      {children}
    </div>
  );
}

// ─── Magnetic button component ────────────────────────────────────────────────────
function MagneticBtn({ children, style, href }: { children: React.ReactNode; style?: React.CSSProperties; href: string }) {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px) scale(1.04)`;
  }, []);
  const handleMouseLeave = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.style.transform = 'translate(0,0) scale(1)';
  }, []);
  return (
    <Link
      ref={btnRef}
      to={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, transition: 'transform 0.2s cubic-bezier(0.19,1,0.22,1)', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
    >
      {children}
    </Link>
  );
}

// ─── Stat chip ─────────────────────────────────────────────────────────────────────
function StatChip({ value, label, active }: { value: number; label: string; active: boolean }) {
  const count = useCounter(value, 1500, active);
  return (
    <div style={statChipStyle}>
      <span style={statValueStyleInline}>{count.toLocaleString()}+</span>
      <span style={statLabelStyleInline}>{label}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────────
export const LandingPage = ({ isAuthenticated }: LandingPageProps) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Intersection observers for each section
  const heroVis = useInView(0.1);
  const statsVis = useInView(0.2);
  const card1Vis = useInView(0.1);
  const card2Vis = useInView(0.1);
  const card3Vis = useInView(0.1);
  const safetyVis = useInView(0.15);
  const footerVis = useInView(0.1);

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes float-particle {
          from { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
          to   { transform: translateY(-28px) rotate(180deg); opacity: 0.45; }
        }
        @keyframes slow-pulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50%       { transform: scale(1.06); opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes ring-draw {
          from { stroke-dashoffset: 251.2; }
          to   { stroke-dashoffset: 40.2; }
        }
        @keyframes float-card {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-14px) rotate(1deg); }
        }
        @keyframes gradient-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes bounce-slow {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0) translateX(-50%); }
          40% { transform: translateY(-8px) translateX(-50%); }
          60% { transform: translateY(-4px) translateX(-50%); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(60px); }
          to   { opacity: 1; transform: translateY(0px); }
        }
        @keyframes slide-left {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0px); }
        }
        @keyframes slide-right {
          from { opacity: 0; transform: translateX(-60px); }
          to   { opacity: 1; transform: translateX(0px); }
        }
        @keyframes zoom-in {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes text-reveal {
          from { opacity: 0; transform: translateY(20px) skewY(4deg); }
          to   { opacity: 1; transform: translateY(0) skewY(0deg); }
        }
        @keyframes border-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(181,92,60,0); }
          50%       { box-shadow: 0 0 0 6px rgba(181,92,60,0.15); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-2deg); }
          50%       { transform: rotate(2deg); }
        }
        .hero-title-word {
          display: inline-block;
          animation: text-reveal 0.7s cubic-bezier(0.19, 1, 0.22, 1) both;
        }
        .hero-title-word:nth-child(1) { animation-delay: 0.1s; }
        .hero-title-word:nth-child(2) { animation-delay: 0.22s; }
        .hero-title-word:nth-child(3) { animation-delay: 0.34s; }
        .hero-title-word:nth-child(4) { animation-delay: 0.46s; }
        .hero-title-word:nth-child(5) { animation-delay: 0.58s; }
        .hero-subtitle { animation: slide-up 0.9s 0.65s cubic-bezier(0.19,1,0.22,1) both; }
        .hero-btns { animation: slide-up 0.9s 0.75s cubic-bezier(0.19,1,0.22,1) both; }
        .hero-stat-chips { animation: slide-up 0.9s 0.9s cubic-bezier(0.19,1,0.22,1) both; }
        .listing-card-1 { animation: slide-up 0.8s 0s cubic-bezier(0.19,1,0.22,1) both; }
        .listing-card-2 { animation: slide-up 0.8s 0.15s cubic-bezier(0.19,1,0.22,1) both; }
        .listing-card-3 { animation: slide-up 0.8s 0.3s cubic-bezier(0.19,1,0.22,1) both; }
        .safety-row-1 { animation: slide-right 0.7s 0s cubic-bezier(0.19,1,0.22,1) both; }
        .safety-row-2 { animation: slide-right 0.7s 0.15s cubic-bezier(0.19,1,0.22,1) both; }
        .safety-row-3 { animation: slide-right 0.7s 0.3s cubic-bezier(0.19,1,0.22,1) both; }
        .hover-lift { transition: transform 0.25s cubic-bezier(0.19,1,0.22,1), box-shadow 0.25s ease; }
        .hover-lift:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(181,92,60,0.14); }
        .landing-link:hover { color: var(--primary) !important; }
        .glow-btn:hover { box-shadow: 0 0 0 4px rgba(181,92,60,0.2), 0 8px 24px rgba(181,92,60,0.3) !important; }
        .nav-enter { animation: slide-up 0.6s cubic-bezier(0.19,1,0.22,1) both; }
        .scroll-bounce { animation: bounce-slow 2.5s infinite; }
        .section-heading-anim { animation: slide-up 0.7s cubic-bezier(0.19,1,0.22,1) both; }
        .section-sub-anim { animation: slide-up 0.7s 0.15s cubic-bezier(0.19,1,0.22,1) both; }
      `}</style>

      {/* ── Parallax orbs (subtle background mood) ── */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute',
          width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(181,92,60,0.08) 0%, transparent 70%)',
          left: `${mousePos.x * 30 - 10}%`,
          top: `${mousePos.y * 30 - 10}%`,
          transition: 'left 1.2s ease, top 1.2s ease',
        }} />
        <div style={{
          position: 'absolute',
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(181,92,60,0.05) 0%, transparent 70%)',
          right: `${(1 - mousePos.x) * 25}%`,
          bottom: `${(1 - mousePos.y) * 25}%`,
          transition: 'right 1.8s ease, bottom 1.8s ease',
        }} />
      </div>

      {/* ── Navbar ── */}
      <nav className="nav-enter" style={navStyle}>
        <div style={navInnerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <img src={logo} alt="LiviSync Logo" style={{ width: '30px', height: '30px', objectFit: 'contain', animation: 'slow-pulse 3s ease-in-out infinite' }} />
            <span style={logoTextStyle}>LiviSync</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <a href="#match" className="landing-link" style={navLinkStyle}>Find a Match</a>
            <a href="#hostels" className="landing-link" style={navLinkStyle}>Hostels</a>
            <a href="#safety" className="landing-link" style={navLinkStyle}>Safety</a>
            <Link to={isAuthenticated ? '/hostels' : '/login'} style={navButtonStyle} className="glow-btn">
              {isAuthenticated ? 'Enter App' : 'Start Matching'}
            </Link>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1 }}>

        {/* ── Hero Section ── */}
        <section id="match" style={heroSectionStyle}>
          {/* Left Content */}
          <div style={{ flex: '1', minWidth: 0 }}>

            <h1 style={heroTitleStyle}>
              <span className="hero-title-word">Find&nbsp;</span>
              <span className="hero-title-word">your&nbsp;</span>
              <span className="hero-title-word" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--primary)', fontWeight: 600 }}>perfect&nbsp;</span>
              <span className="hero-title-word">room&nbsp;</span>
              <span className="hero-title-word">rhythm.</span>
            </h1>

            <p className="hero-subtitle" style={heroSubtitleStyle}>
              The first lifestyle-first housing platform for students. We match your habits
              before your housing, ensuring your home is a sanctuary, not a stressor.
            </p>

            <div className="hero-btns" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <MagneticBtn href={isAuthenticated ? '/roommates' : '/login'} style={primaryHeroButtonStyle}>
                Discover Matches
              </MagneticBtn>
              <MagneticBtn href={isAuthenticated ? '/hostels' : '/login'} style={secondaryHeroButtonStyle}>
                Browse Verified Hostels
              </MagneticBtn>
            </div>

            {/* Stat chips with counter animation */}
            <div ref={statsVis.ref} className="hero-stat-chips" style={{ display: 'flex', gap: '1rem', marginTop: '3rem', flexWrap: 'wrap' }}>
              <StatChip value={500} label="Students" active={statsVis.inView} />
              <StatChip value={120} label="Verified Hostels" active={statsVis.inView} />
              <StatChip value={98} label="Match Rate %" active={statsVis.inView} />
            </div>
          </div>

          {/* Right: Hero Visual — floating match card */}
          <div ref={heroVis.ref} style={{ flex: '1', display: 'flex', justifyContent: 'center', minWidth: '320px', position: 'relative' }}>
            <FloatingParticles />
            <TiltCard style={{
              width: '100%',
              maxWidth: '400px',
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border-solid)',
              borderRadius: '32px',
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              animation: heroVis.inView ? 'float-card 5s ease-in-out infinite, zoom-in 0.8s 0.2s cubic-bezier(0.19,1,0.22,1) both' : 'none',
            }}>
              {/* Shimmer top accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, var(--primary), transparent)', backgroundSize: '200% 100%', animation: 'shimmer 2.5s linear infinite' }} />

              {/* Score Meter */}
              <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="var(--border-solid)" strokeWidth="5" fill="transparent" />
                  <circle
                    cx="50" cy="50" r="40"
                    stroke="var(--primary)" strokeWidth="5"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeLinecap="round"
                    className="animate-ring"
                    style={{ animation: 'ring-draw 1.8s cubic-bezier(0.19,1,0.22,1) 0.5s both' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '3rem', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.05em', lineHeight: 1 }}>84%</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>Match Score</span>
                </div>
              </div>

              {/* Avatar pair */}
              <div style={{ display: 'flex', marginTop: '2rem' }}>
                <img src={studentFemale} alt="Student" style={avatarStyle} />
                <img src={studentMale} alt="Student" style={{ ...avatarStyle, marginLeft: '-1rem' }} />
              </div>

              {/* Tags with stagger */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['Night Owl', 'No Smoking', 'No Pets'].map((tag, i) => (
                  <span key={tag} style={{ ...tagStyle, animationDelay: `${0.8 + i * 0.1}s`, animation: 'zoom-in 0.5s both' }}>{tag}</span>
                ))}
              </div>
            </TiltCard>

            {/* Floating badge 1 — top-right */}
            <div style={{
              position: 'absolute', top: '-1rem', right: '-1rem',
              backgroundColor: 'var(--primary)', color: '#faf8f5',
              borderRadius: '16px', padding: '0.75rem 1.25rem',
              fontSize: '0.75rem', fontWeight: 800,
              boxShadow: '0 8px 24px rgba(181,92,60,0.35)',
              animation: 'float-card 4s 1s ease-in-out infinite',
              zIndex: 2,
            }}>
              3 new matches!
            </div>

            {/* Floating badge 2 — bottom-left */}
            <div style={{
              position: 'absolute', bottom: '-1rem', left: '-1rem',
              backgroundColor: 'var(--card)', border: '1px solid var(--border-solid)',
              borderRadius: '16px', padding: '0.75rem 1.25rem',
              fontSize: '0.75rem', fontWeight: 700, color: 'var(--foreground)',
              boxShadow: 'var(--shadow-lg)',
              animation: 'float-card 4.5s 0.5s ease-in-out infinite',
              zIndex: 2,
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              12 rooms available
            </div>
          </div>
        </section>

        {/* ── Listings Section ── */}
        <section id="hostels" style={listingsSectionStyle}>
          <div style={listingsHeaderStyle}>
            <div style={{ maxWidth: '480px' }}>
              <h2 style={sectionTitleStyle} className="section-heading-anim">Verified Living Spaces</h2>
              <p className="section-sub-anim" style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Every listing on LiviSync is physically inspected and student-approved for safety, hygiene, and amenities.
              </p>
            </div>
          </div>

          <div style={listingsGridStyle}>
            {/* Card 1 */}
            <div ref={card1Vis.ref} className={`hover-lift listing-card-1 ${card1Vis.inView ? '' : ''}`}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: card1Vis.inView ? 1 : 0, animation: card1Vis.inView ? 'slide-up 0.8s cubic-bezier(0.19,1,0.22,1) both' : 'none' }}>
              <div style={{ ...imageWrapperStyle, animation: card1Vis.inView ? 'zoom-in 0.8s cubic-bezier(0.19,1,0.22,1) both' : 'none' }}>
                <img src={hostelOrchard} alt="The Orchard Commons student hostel room" style={{ ...listingImageStyle, transition: 'transform 0.5s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div style={cardBadgesStyle}>
                  <span style={cardBadgeStyle}>Verified</span>
                  <span style={{ ...cardBadgeStyle, backgroundColor: '#059669', color: 'white', border: 'none' }}>Available</span>
                </div>
              </div>
              <div style={listingFooterStyle}>
                <div>
                  <h3 style={listingTitleStyle}>Hostel</h3>
                  <p style={listingDistanceStyle}>Model Town, Lahore</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={listingPriceStyle}>PKR 12,000<span style={priceMonthStyle}>/mo</span></p>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>2 units left</div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div ref={card2Vis.ref}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: card2Vis.inView ? 1 : 0, animation: card2Vis.inView ? 'slide-up 0.8s 0.15s cubic-bezier(0.19,1,0.22,1) both' : 'none' }}>
              <div style={{ ...imageWrapperStyle, animation: card2Vis.inView ? 'zoom-in 0.8s 0.15s cubic-bezier(0.19,1,0.22,1) both' : 'none' }}
                className="hover-lift">
                <img src={hostelStudio} alt="Studio Central student lounge" style={{ ...listingImageStyle, transition: 'transform 0.5s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
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
                  <p style={listingPriceStyle}>PKR 13,000<span style={priceMonthStyle}>/mo</span></p>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>4 units left</div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div ref={card3Vis.ref}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: card3Vis.inView ? 1 : 0, animation: card3Vis.inView ? 'slide-up 0.8s 0.3s cubic-bezier(0.19,1,0.22,1) both' : 'none' }}>
              <div style={{ ...imageWrapperStyle, animation: card3Vis.inView ? 'zoom-in 0.8s 0.3s cubic-bezier(0.19,1,0.22,1) both' : 'none' }}
                className="hover-lift">
                <img src={hostelHeritage} alt="Heritage Loft private dorm room" style={{ ...listingImageStyle, transition: 'transform 0.5s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
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
                  <p style={listingPriceStyle}>PKR 15,000<span style={priceMonthStyle}>/mo</span></p>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textDecoration: 'underline' }}>Waitlist Open</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust & Safety Section ── */}
        <div ref={safetyVis.ref}>
          <section id="safety" style={{
            ...safetySectionStyle,
            opacity: safetyVis.inView ? 1 : 0,
            animation: safetyVis.inView ? 'zoom-in 0.9s cubic-bezier(0.19,1,0.22,1) both' : 'none',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Animated gradient orb inside dark section */}
            <div style={{
              position: 'absolute', width: 400, height: 400, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(181,92,60,0.15) 0%, transparent 70%)',
              right: '-100px', top: '-100px', pointerEvents: 'none',
              animation: 'slow-pulse 4s ease-in-out infinite',
            }} />
            <div style={{ maxWidth: '640px', position: 'relative', zIndex: 1 }}>
              <h2 style={safetyTitleStyle}>
                Security isn't an option. <br />
                <span style={{ color: 'rgba(250, 248, 245, 0.65)' }}>It's the foundation.</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {[
                  { icon: '🛡️', title: 'Identity Verification', desc: 'Every student user is authenticated through their official university SSO or student ID. No anonymous profiles. (This is not currently functional but will be in near future.)' },
                  { icon: '👁️', title: 'On-Site Inspections', desc: 'We at LiviSync physically visit every property to verify Room/Building conditions, hygiene standards, and security hardware.' },
                  { icon: '🔒', title: 'Encrypted Roommate Chat', desc: 'Connect without sharing personal phone numbers. Our in-app messaging keeps your data private until you\'re ready to meet.' },
                ].map((item, i) => (
                  <div key={item.title}
                    className={`safety-row-${i + 1}`}
                    style={{ display: 'flex', gap: '1.5rem', opacity: safetyVis.inView ? 1 : 0, animation: safetyVis.inView ? `slide-right 0.7s ${i * 0.15}s cubic-bezier(0.19,1,0.22,1) both` : 'none' }}
                  >
                    <div style={{ ...safetyIconBoxStyle, animation: safetyVis.inView ? `zoom-in 0.5s ${i * 0.15 + 0.1}s both` : 'none' }}>{item.icon}</div>
                    <div>
                      <h4 style={safetyCardTitleStyle}>{item.title}</h4>
                      <p style={safetyCardDescStyle}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ── Footer ── */}
      <div ref={footerVis.ref} style={{ opacity: footerVis.inView ? 1 : 0, animation: footerVis.inView ? 'slide-up 0.8s cubic-bezier(0.19,1,0.22,1) both' : 'none' }}>
        <footer style={footerStyle}>
          <div style={footerInnerStyle}>
            <div style={footerGridStyle}>
              <div style={footerColStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <img src={logo} alt="LiviSync Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                  <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>LiviSync</span>
                </div>
                <p style={footerTextStyle}>
                  LiviSync is the first ever lifestyle-first housing platform designed specifically for university students. We combine physically verified hostel listings with compatibility matching, helping you find both the perfect room and the ideal roommate.
                </p>
              </div>

              <div style={footerColStyle}>
                <h4 style={footerHeadingStyle}>The Team</h4>
                <p style={footerTextStyle}>
                  LiviSync is built by fellow hostellites who've been through the same housing headaches, on a mission to make university housing safe, easy, transparent, and roommate matchmaking stress-free.
                </p>
                <p style={{ ...footerTextStyle, fontWeight: 600, color: 'var(--foreground)' }}>Built by Gen-Z, for the Gen-Z</p>
              </div>

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


    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: 'var(--background)',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-sans)',
  overflowX: 'hidden',
};

const navStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 50,
  backgroundColor: 'rgba(250, 248, 245, 0.88)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  borderBottom: '1px solid var(--border-solid)',
};

const navInnerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '1.25rem 2rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
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
  transition: 'all 0.2s cubic-bezier(0.19,1,0.22,1)',
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
  boxShadow: '0 4px 14px rgba(181, 92, 60, 0.25)',
  transition: 'all 0.2s cubic-bezier(0.19,1,0.22,1)',
  fontSize: '0.95rem',
};

const secondaryHeroButtonStyle: React.CSSProperties = {
  border: '1px solid var(--border-solid)',
  backgroundColor: 'var(--card)',
  color: 'var(--foreground)',
  padding: '1rem 2rem',
  borderRadius: '12px',
  fontWeight: 700,
  textDecoration: 'none',
  transition: 'all 0.2s cubic-bezier(0.19,1,0.22,1)',
  fontSize: '0.95rem',
};

const avatarStyle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  border: '4px solid var(--card)',
  objectFit: 'cover',
  boxShadow: 'var(--shadow)',
};

const tagStyle: React.CSSProperties = {
  fontSize: '0.68rem',
  fontWeight: 700,
  color: 'var(--foreground)',
  backgroundColor: 'var(--secondary)',
  border: '1px solid var(--border-solid)',
  borderRadius: '9999px',
  padding: '0.25rem 0.75rem',
};

// Stat chip styles
const statChipStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border-solid)',
  borderRadius: '12px',
  padding: '0.75rem 1.25rem',
  gap: '2px',
  minWidth: '80px',
};

const statValueStyleInline: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '1.5rem',
  fontWeight: 800,
  color: 'var(--primary)',
  letterSpacing: '-0.04em',
  lineHeight: 1,
};

const statLabelStyleInline: React.CSSProperties = {
  fontSize: '0.65rem',
  fontWeight: 700,
  color: 'var(--muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const listingsSectionStyle: React.CSSProperties = {
  padding: '6rem 0',
  borderTop: '1px solid var(--border-solid)',
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
  backgroundColor: 'rgba(250, 248, 245, 0.12)',
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
  color: 'rgba(250, 248, 245, 0.7)',
  margin: 0,
  lineHeight: 1.6,
};

const footerStyle: React.CSSProperties = {
  borderTop: '1px solid var(--border-solid)',
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
  borderTop: '1px solid var(--border-solid)',
  paddingTop: '2rem',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '1.5rem',
};
