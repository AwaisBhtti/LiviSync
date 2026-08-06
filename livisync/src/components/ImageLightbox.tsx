import { useState, useEffect, useRef } from 'react';

interface ImageLightboxProps {
  images?: string[];
  imageUrl?: string;
  initialIndex?: number;
  onClose: () => void;
}

let lightboxInstanceCount = 0;

export const ImageLightbox = ({ images, imageUrl, initialIndex = 0, onClose }: ImageLightboxProps) => {
  const displayImages = images || (imageUrl ? [imageUrl] : []);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const minSwipeDistance = 50;
  const touchStartX = useRef(0);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, displayImages.length]);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    lightboxInstanceCount++;
    // Push a state to history so back button can be caught
    window.history.pushState({ lightbox: true }, '');

    const handlePopState = () => {
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      lightboxInstanceCount--;
      window.removeEventListener('popstate', handlePopState);
      setTimeout(() => {
        if (lightboxInstanceCount === 0) {
          if (window.history.state && window.history.state.lightbox) {
            window.history.back();
          }
        }
      }, 50);
    };
  }, []);

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  // Wheel scroll navigation
  useEffect(() => {
    let lastScrollTime = 0;
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime < 300) return;

      if (Math.abs(e.deltaY) > 15 || Math.abs(e.deltaX) > 15) {
        if (e.deltaY > 0 || e.deltaX > 0) {
          handleNext();
        } else {
          handlePrev();
        }
        lastScrollTime = now;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [displayImages.length]);

  if (displayImages.length === 0) return null;

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const distance = touchStartX.current - e.changedTouches[0].clientX;
    if (distance > minSwipeDistance) handleNext();
    else if (distance < -minSwipeDistance) handlePrev();
  };

  // Mouse drag swipe — attach to window so movement outside element still registers
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;

    const onUp = (ev: MouseEvent) => {
      window.removeEventListener('mouseup', onUp);
      const distance = startX - ev.clientX;
      if (Math.abs(distance) > minSwipeDistance) {
        if (distance > 0) {
          setCurrentIndex((prev) => (prev + 1) % displayImages.length);
        } else {
          setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
        }
      }
    };

    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(32, 30, 29, 0.95)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        cursor: 'zoom-out',
        padding: '2rem',
      }}
    >
      {/* Main image area */}
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onDragStart={(e) => e.preventDefault()}
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          cursor: 'grab',
        }}
      >
        <img
          src={displayImages[currentIndex]}
          alt="Full size view"
          draggable={false}
          style={{
            maxWidth: '100%',
            maxHeight: '75vh',
            objectFit: 'contain',
            borderRadius: 'var(--radius)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            pointerEvents: 'none',
          }}
        />

        {/* Left arrow */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', left: '-3.5rem', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', borderRadius: '50%', width: '48px', height: '48px',
                fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 1, transition: 'opacity 0.2s',
                backdropFilter: 'blur(4px)',
              }}
            >◀</button>
            <button
              onClick={handleNext}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', right: '-3.5rem', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', borderRadius: '50%', width: '48px', height: '48px',
                fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 1, transition: 'opacity 0.2s',
                backdropFilter: 'blur(4px)',
              }}
            >▶</button>
          </>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute', top: '-2.5rem', right: '-2.5rem',
            backgroundColor: 'rgba(255,255,255,0.15)', color: 'white',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%',
            width: '40px', height: '40px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 'bold', backdropFilter: 'blur(4px)',
          }}
        >✕</button>
      </div>

      {/* Photo counter */}
      {displayImages.length > 1 && (
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: '1rem', fontWeight: 500 }}>
          {currentIndex + 1} / {displayImages.length}
        </div>
      )}

      {/* Filmstrip previews */}
      {displayImages.length > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'flex', gap: '0.6rem', justifyContent: 'center',
            marginTop: '1rem', maxWidth: '90vw',
            overflowX: 'auto', padding: '0.5rem',
          }}
        >
          {displayImages.map((imgUrl, i) => (
            <img
              key={i}
              src={imgUrl}
              alt={`Preview ${i + 1}`}
              draggable={false}
              onClick={() => setCurrentIndex(i)}
              style={{
                width: '80px', height: '60px', objectFit: 'cover',
                borderRadius: '8px', cursor: 'pointer', flexShrink: 0,
                border: i === currentIndex ? '3px solid var(--primary)' : '2px solid rgba(255,255,255,0.2)',
                opacity: i === currentIndex ? 1 : 0.55,
                transition: 'all 0.2s',
                boxShadow: i === currentIndex ? '0 4px 12px rgba(0,0,0,0.5)' : 'none',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
