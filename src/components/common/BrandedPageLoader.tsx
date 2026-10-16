import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface BrandedPageLoaderProps {
  initialOnly?: boolean;
}

export const BrandedPageLoader: React.FC<BrandedPageLoaderProps> = () => {
  const location = useLocation();
  const isInitialMount = useRef(true);
  const previousPath = useRef(location.pathname);

  // Check if session has already displayed initial cinematic logo reveal
  const [showInitial, setShowInitial] = useState(() => {
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem('indus_intro_played')) {
        return false;
      }
    } catch {}
    return true;
  });

  const [showRouteTransition, setShowRouteTransition] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  // Skip handler on click or keypress
  const handleSkip = () => {
    setFadingOut(true);
    setTimeout(() => {
      setShowInitial(false);
      setShowRouteTransition(false);
      try {
        sessionStorage.setItem('indus_intro_played', 'true');
      } catch {}
    }, 280);
  };

  // Initial load intro animation (~1.1s total, non-blocking)
  useEffect(() => {
    if (!showInitial) return;

    // Respect reduced motion immediately
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setShowInitial(false);
      try { sessionStorage.setItem('indus_intro_played', 'true'); } catch {}
      return;
    }

    // Smooth sequence: card emerges -> progress bar shines -> fade-out transition into hero
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 1050);

    const doneTimer = setTimeout(() => {
      setShowInitial(false);
      setFadingOut(false);
      try { sessionStorage.setItem('indus_intro_played', 'true'); } catch {}
    }, 1380);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [showInitial]);

  // Subtle lightweight route transition (About, Products, Gallery, Contact)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousPath.current = location.pathname;
      return;
    }

    if (location.pathname === previousPath.current) {
      return;
    }

    previousPath.current = location.pathname;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    // Ultra-light 280ms transition for page-to-page navigation
    setShowRouteTransition(true);
    setFadingOut(false);

    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 220);

    const doneTimer = setTimeout(() => {
      setShowRouteTransition(false);
      setFadingOut(false);
    }, 360);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [location.pathname]);

  const isVisible = showInitial || showRouteTransition;
  if (!isVisible) return null;

  return (
    <div 
      className={`branded-loader-overlay ${showRouteTransition ? 'route-transition' : ''} ${fadingOut ? 'fade-out' : ''}`}
      onClick={handleSkip}
      title={showInitial ? "Click anywhere to continue" : undefined}
      aria-live="polite"
      aria-label="Loading Indus Crop Care Pvt. Ltd."
      role="status"
    >
      <div className={`branded-loader-card ${showRouteTransition ? 'card-compact' : ''}`}>
        
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
        {!showRouteTransition && (
          <span className="branded-loader-company-name">
            Indus Crop Care Pvt. Ltd.
          </span>
        )}

        {/* Animated Emerald & Gold Shimmer Bar */}
        <div className="branded-loader-progress-track">
          <div className="branded-loader-progress-bar" />
        </div>

        {/* Telugu Brand Motto */}
        {!showRouteTransition && (
          <>
            <p className="branded-loader-motto">
              రైతన్నకు భరోసా.. ఇండస్ ఉత్పాదనలు
            </p>
            <span className="branded-loader-skip-hint">
              Click anywhere to skip
            </span>
          </>
        )}
      </div>
    </div>
  );
};
