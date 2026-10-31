import React, { useEffect, useState, useRef } from 'react';

/**
 * Premium Cinematic Logo Intro — Indus Crop Care Pvt. Ltd.
 * Full cinematic lifecycle:
 * - 0.0s – 0.5s: Sophisticated forest-green background & subtle ambient botanical aura
 * - 0.5s – 1.4s: Authentic Indus logo reveals with smooth scale (0.88 -> 1.0) and opacity
 * - 1.4s – 2.3s: Soft golden light sweep across logo + elegant company title and Telugu motto reveal
 * - 2.3s – 3.6s: Full majestic brand mark and motto display in steady clarity
 * - 3.6s – 4.45s: Complete luxury exit transition (smooth dissolve, gentle stage scale & blur)
 * - Plays once per user session (sessionStorage)
 * - Click anywhere or press any key to gracefully trigger exit transition immediately
 * - Automatically bypassed when prefers-reduced-motion is detected
 */
export const BrandedPageLoader: React.FC = () => {
  const [showIntro, setShowIntro] = useState(() => {
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

  const [isFadingOut, setIsFadingOut] = useState(false);
  const skipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Safely notify the application and hero section that intro has finished
  const notifyComplete = () => {
    try {
      sessionStorage.setItem('indus_intro_played', 'true');
    } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('intro-active');
      document.documentElement.classList.add('intro-completed');
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('indus:intro-complete'));
    }
  };

  // Skip handler gracefully triggers the exit transition
  const handleSkip = () => {
    if (!showIntro || isFadingOut) return;
    setIsFadingOut(true);
    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    skipTimerRef.current = setTimeout(() => {
      setShowIntro(false);
      setIsFadingOut(false);
      notifyComplete();
    }, 450);
  };

  // Complete Animation Lifecycle Synchronization
  useEffect(() => {
    if (!showIntro) {
      notifyComplete();
      return;
    }

    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('intro-active');
    }

    // Begin the exit transition after the logo, text, and brand display have completed (3.6s)
    const exitTriggerTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 3600);

    // Unmount ONLY after the full 850ms exit transition has finished playing (4.45s)
    const unmountTimer = setTimeout(() => {
      setShowIntro(false);
      setIsFadingOut(false);
      notifyComplete();
    }, 4350);

    const handleKeyDown = () => handleSkip();
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(exitTriggerTimer);
      clearTimeout(unmountTimer);
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showIntro]);

  if (!showIntro) return null;

  return (
    <div 
      className={`cinematic-intro-overlay ${isFadingOut ? 'is-fading-out' : ''}`}
      onClick={handleSkip}
      title="Click anywhere to continue"
      role="dialog"
      aria-label="Welcome to Indus Crop Care"
      aria-modal="true"
    >
      {/* Deep Botanical Ambient Lighting */}
      <div className="cinematic-intro-ambient" aria-hidden="true">
        <div className="cinematic-intro-radial-glow" />
        <div className="cinematic-intro-vignette" />
      </div>

      <div className="cinematic-intro-stage">
        {/* Glowing Aura Ring */}
        <div className="cinematic-logo-glow" aria-hidden="true" />

        {/* Central Logo Frame: Crisp architectural white pill with gold rim */}
        <div className="cinematic-logo-frame">
          <img 
            src="/images/branding/indus/indus-logo.png" 
            alt="Indus Crop Care Pvt. Ltd. Official Logo" 
            className="cinematic-logo-image"
            width={240}
            height={108}
            loading="eager"
            decoding="sync"
          />
          {/* Subtle Golden Light Sweep */}
          <div className="cinematic-logo-sheen" aria-hidden="true" />
        </div>

        {/* Typography Reveal */}
        <div className="cinematic-intro-text">
          <h1 className="cinematic-company-title">
            INDUS CROP CARE PVT. LTD.
          </h1>
          <p className="cinematic-company-tagline">
            రైతన్నకు భరోసా.. ఇండస్ ఉత్పాదనలు
          </p>
          <div className="cinematic-intro-accent-line" />
        </div>

        <span className="cinematic-skip-hint">
          Click anywhere to skip
        </span>
      </div>
    </div>
  );
};
