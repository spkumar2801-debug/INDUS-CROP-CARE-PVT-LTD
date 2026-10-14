import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface BrandedPageLoaderProps {
  initialOnly?: boolean;
}

export const BrandedPageLoader: React.FC<BrandedPageLoaderProps> = () => {
  const location = useLocation();
  const isInitialMount = useRef(true);
  const previousPath = useRef(location.pathname);

  // Initial session boot state
  const [showInitial, setShowInitial] = useState(() => {
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem('indus_loaded_session')) {
        return false;
      }
    } catch {}
    return true;
  });

  // Route transition state
  const [showRouteTransition, setShowRouteTransition] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  // Initial load handler
  useEffect(() => {
    if (!showInitial) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      const t = setTimeout(() => {
        setShowInitial(false);
        try { sessionStorage.setItem('indus_loaded_session', 'true'); } catch {}
      }, 0);
      return () => clearTimeout(t);
    }

    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 380);

    const doneTimer = setTimeout(() => {
      setShowInitial(false);
      setFadingOut(false);
      try { sessionStorage.setItem('indus_loaded_session', 'true'); } catch {}
    }, 560);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [showInitial]);

  // Page-to-Page Route Navigation Transition (About Us, Products, Gallery, Contact, Admin)
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

    // Trigger subtle 400ms transition asynchronously
    const startTimer = setTimeout(() => {
      setShowRouteTransition(true);
      setFadingOut(false);
    }, 10);

    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 280);

    const doneTimer = setTimeout(() => {
      setShowRouteTransition(false);
      setFadingOut(false);
    }, 450);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [location.pathname]);

  const isVisible = showInitial || showRouteTransition;
  if (!isVisible) return null;

  return (
    <div 
      className={`branded-loader-overlay ${showRouteTransition ? 'route-transition' : ''} ${fadingOut ? 'fade-out' : ''}`}
      aria-live="polite"
      aria-label="Loading Indus Crop Care Pvt. Ltd."
      role="status"
    >
      <div className={`branded-loader-card ${showRouteTransition ? 'card-compact' : ''}`}>
        {/* Real Official Indus Crop Care Logo */}
        <div className="branded-loader-logo-frame">
          <img 
            src="/images/branding/indus/indus-logo.png" 
            alt="Indus Crop Care Pvt. Ltd." 
            className="branded-loader-logo"
            style={{ maxWidth: '240px', objectFit: 'contain' }}
          />
        </div>

        {/* Muted Gold & Emerald Shimmer Line */}
        <div className="branded-loader-progress-track">
          <div className="branded-loader-progress-bar" />
        </div>

        {!showRouteTransition && (
          <p className="branded-loader-motto" style={{ color: 'var(--color-primary-green-dark, #0E6B38)' }}>
            రైతన్నకు భరోసా.. ఇండస్ ఉత్పాదనలు
          </p>
        )}
      </div>
    </div>
  );
};

