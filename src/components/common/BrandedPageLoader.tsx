import React, { useEffect, useState, useRef } from 'react';

/**
 * Premium Cinematic Logo Intro — Indus Crop Care Pvt. Ltd.
 * Displays an exact 3.5s luxury opening sequence on the first website visit per session:
 * - 0.0s – 0.7s: Elegant dark forest-green background appears with subtle ambient light aura
 * - 0.7s – 1.8s: Existing Indus Crop Care logo smoothly reveals with refined scale and opacity entrance
 * - 1.8s – 2.7s: Soft golden light sweep across logo + elegant company title and Telugu motto reveal
 * - 2.7s – 3.5s: Smooth cinematic transition (800ms dissolve) into the existing Home page
 * - Plays once per user session (sessionStorage)
 * - Click anywhere or press any key to skip immediately
 * - Respects prefers-reduced-motion
 */
export const BrandedPageLoader: React.FC = () => {
  // Check if session has already displayed initial cinematic logo reveal or prefers reduced motion
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

  // Skip handler on click or keypress
  const handleSkip = () => {
    if (!showIntro) return;
    setIsFadingOut(true);
    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    skipTimerRef.current = setTimeout(() => {
      setShowIntro(false);
      try {
        sessionStorage.setItem('indus_intro_played', 'true');
      } catch {}
    }, 280);
  };

  // Cinematic intro timeline: exact 3.5s sequence
  // 0.0s - 2.7s: Background, Logo Entrance, Light Sweep & Typography
  // 2.7s - 3.5s: Dissolve fade-out into Home page (800ms transition)
  useEffect(() => {
    if (!showIntro) return;

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2700);

    const doneTimer = setTimeout(() => {
      setShowIntro(false);
      setIsFadingOut(false);
      try {
        sessionStorage.setItem('indus_intro_played', 'true');
      } catch {}
    }, 3500);

    const handleKeyDown = () => handleSkip();
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showIntro]);

  if (!showIntro) return null;

  return (
    <div 
      className={`cinematic-intro-overlay ${isFadingOut ? 'is-fading-out' : ''}`}
      onClick={handleSkip}
      title="Click anywhere to skip"
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
