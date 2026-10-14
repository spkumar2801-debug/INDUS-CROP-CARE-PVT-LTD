import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * High-performance IntersectionObserver hook for subtle, agency-grade scroll-reveal transitions.
 * - Triggers once per element as it enters viewport.
 * - Elements remain visible permanently (no replaying or stutter during scroll).
 * - Immediately reveals everything if prefers-reduced-motion is enabled.
 */
export function useScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -20px 0px',
        threshold: 0.05
      }
    );

    // Only observe explicitly marked reveal items - NEVER turn all product cards or general cards invisible!
    const targets = document.querySelectorAll('.reveal-on-scroll:not(.is-revealed)');
    targets.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [location.pathname]);
}
