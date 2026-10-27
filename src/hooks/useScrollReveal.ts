import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * High-performance IntersectionObserver hook for subtle, agency-grade scroll-reveal transitions.
 * - Triggers once per element as it enters viewport.
 * - Elements remain visible permanently (no replaying or stutter during scroll).
 * - Immediately reveals everything if prefers-reduced-motion is enabled.
 * - Supports dynamically rendered components.
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
        rootMargin: '0px 0px 60px 0px',
        threshold: 0.04
      }
    );

    const observeTargets = () => {
      const targets = document.querySelectorAll('.reveal-on-scroll:not(.is-revealed)');
      targets.forEach(el => {
        observer.observe(el);
      });
    };

    // Initial observation pass
    observeTargets();

    // Check again at staggered intervals to catch async rendered items (e.g. products)
    const t1 = setTimeout(observeTargets, 150);
    const t2 = setTimeout(observeTargets, 600);

    // Watch for newly mounted DOM elements with rAF debouncing to prevent thrashing
    let mutationObserver: MutationObserver | null = null;
    let rafId: number | null = null;
    if ('MutationObserver' in window) {
      mutationObserver = new MutationObserver(() => {
        if (rafId !== null) return;
        rafId = window.requestAnimationFrame(() => {
          observeTargets();
          rafId = null;
        });
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (mutationObserver) mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [location.pathname]);
}
