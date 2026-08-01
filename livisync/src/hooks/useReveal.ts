import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-reveal wiring for the Organic design system.
 *
 * Attach the returned ref to a container and mark any descendant with
 * `data-reveal` (plus an optional `data-delay` in seconds). Elements already
 * inside the viewport reveal immediately; the rest reveal as they scroll in.
 */
export function useRevealContainer<T extends HTMLElement = HTMLDivElement>(deps: unknown[] = []) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const show = (el: HTMLElement) => {
      const delay = el.getAttribute('data-delay');
      if (delay) el.style.transitionDelay = `${delay}s`;
      el.classList.add('is-visible');
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    );

    const vh = window.innerHeight || 800;
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      if (el.classList.contains('is-visible')) return;
      if (el.getBoundingClientRect().top < vh * 0.94) show(el);
      else observer.observe(el);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}

/** Eased count-up, kicked off once `active` turns true. */
export function useCountUp(target: number, active: boolean, duration = 1300) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration]);

  return value;
}

/** True once the observed element has entered the viewport. */
export function useInView<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
