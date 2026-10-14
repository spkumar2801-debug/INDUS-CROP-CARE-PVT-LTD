import React, { useEffect, useState, useRef } from 'react';

interface CountUpNumberProps {
  end: number;
  suffix?: string;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  end,
  suffix = '',
  duration = 1400,
  className,
  style
}) => {
  const [count, setCount] = useState<number>(() => {
    if (typeof window !== 'undefined' && (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window))) {
      return end;
    }
    return 0;
  });
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const hasAnimated = useRef<boolean>(
    typeof window !== 'undefined' && 
    (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window))
  );

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Immediately return if user prefers reduced motion or unsupported
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.disconnect();

          const startTime = performance.now();
          const startVal = 0;

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic curve for natural slowdown
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(startVal + (end - startVal) * easeOutProgress);
            
            setCount(currentVal);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [end, duration]);

  return (
    <span ref={elementRef} className={className} style={style}>
      {count}{suffix}
    </span>
  );
};
