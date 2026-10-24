import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface BrandedPageLoaderProps {
  initialOnly?: boolean;
}

export const BrandedPageLoader: React.FC<BrandedPageLoaderProps> = () => {
  const location = useLocation();
  const isInitialMount = useRef(true);
  const previousPath = useRef(location.pathname);

  // Check if session has already displayed initial cinematic logo reveal or prefers reduced motion
  const [showInitial, setShowInitial] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        if (sessionStorage.getItem('indus_intro_played')) {
          return false;
        }
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          sessionStorage.setItem('indus_intro_played', 'true');
          return false;
        }
      }
    } catch {}
    return true;
  });

  const [initialFadingOut, setInitialFadingOut] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionFadingOut, setTransitionFadingOut] = useState(false);

  // Skip handler on click or keypress
  const handleSkip = () => {
    if (showInitial) {
      setInitialFadingOut(true);
      setTimeout(() => {
        setShowInitial(false);
        try {
          sessionStorage.setItem('indus_intro_played', 'true');
        } catch {}
      }, 200);
    }
    if (showTransition) {
      setTransitionFadingOut(true);
      setTimeout(() => {
        setShowTransition(false);
      }, 150);
    }
  };

  // 1. Initial entry intro animation (~1.9s total: ~1.55s active + 0.35s fade transition)
  useEffect(() => {
    if (!showInitial) return;

    const fadeTimer = setTimeout(() => {
      setInitialFadingOut(true);
    }, 1550);

    const doneTimer = setTimeout(() => {
      setShowInitial(false);
      setInitialFadingOut(false);
      try { sessionStorage.setItem('indus_intro_played', 'true'); } catch {}
    }, 1950);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [showInitial]);

  // 2. Page-Transition animation on public navigation options (~1.0s brief transition)
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousPath.current = location.pathname;
      return;
    }

    // Skip if pathname has not changed (e.g. query params, hash changes, component rerenders)
    if (location.pathname === previousPath.current) {
      return;
    }

    const prev = previousPath.current;
    const next = location.pathname;
    previousPath.current = next;

    // Do not trigger public page transition inside admin portal routes
    if (prev.startsWith('/admin') && next.startsWith('/admin')) {
      return;
    }

    // Do not trigger if initial intro is currently running
    if (showInitial) {
      return;
    }

    // Respect reduced-motion preferences
    try {
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
    } catch {}

    // Trigger brief 1.0s page transition
    setShowTransition(true);
    setTransitionFadingOut(false);

    const fadeTimer = setTimeout(() => {
      setTransitionFadingOut(true);
    }, 750);

    const doneTimer = setTimeout(() => {
      setShowTransition(false);
      setTransitionFadingOut(false);
    }, 1000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [location.pathname, showInitial]);

  // If initial intro is active
  if (showInitial) {
    return (
      <div 
        className={`branded-loader-overlay ${initialFadingOut ? 'fade-out' : ''}`}
        onClick={handleSkip}
        title="Click anywhere to continue"
        aria-live="polite"
        aria-label="Loading Indus Crop Care Pvt. Ltd."
        role="status"
      >
        <div className="branded-loader-card">
          {/* Official Indus Crop Care Logo Frame */}
          <div className="branded-loader-logo-frame">
            <img 
              src="/images/branding/indus/indus-logo.png" 
              alt="Indus Crop Care Pvt. Ltd. Official Logo" 
              className="branded-loader-logo"
              loading="eager"
              decoding="async"
            />
          </div>

          {/* Company Title Eyebrow */}
          <span className="branded-loader-company-name">
            Indus Crop Care Pvt. Ltd.
          </span>

          {/* Animated Emerald & Gold Shimmer Bar */}
          <div className="branded-loader-progress-track">
            <div className="branded-loader-progress-bar" />
          </div>

          {/* Telugu Brand Motto */}
          <p className="branded-loader-motto">
            రైతన్నకు భరోసా.. ఇండస్ ఉత్పాదనలు
          </p>

          <span className="branded-loader-skip-hint">
            Click anywhere to skip
          </span>
        </div>
      </div>
    );
  }

  // If page transition is active
  if (showTransition) {
    return (
      <div 
        className={`branded-loader-overlay is-page-transition ${transitionFadingOut ? 'fade-out' : ''}`}
        onClick={handleSkip}
        title="Loading page..."
        aria-live="polite"
        aria-label="Loading page"
        role="status"
      >
        <div className="branded-loader-card card-transition">
          {/* Official Indus Crop Care Logo Frame */}
          <div className="branded-loader-logo-frame">
            <img 
              src="/images/branding/indus/indus-logo.png" 
              alt="Indus Crop Care Pvt. Ltd." 
              className="branded-loader-logo"
              loading="eager"
              decoding="async"
            />
          </div>

          {/* Animated Emerald & Gold Shimmer Bar */}
          <div className="branded-loader-progress-track">
            <div className="branded-loader-progress-bar" />
          </div>

          {/* Clean Navigation Indicator Label */}
          <span className="page-transition-label">
            Indus Crop Care
          </span>
        </div>
      </div>
    );
  }

  return null;
};

