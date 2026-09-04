import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import CreativeGiniParticles from './intro/CreativeGiniParticles';
import CreativeGiniMagic from './intro/CreativeGiniMagic';
import CreativeGiniCharacter from './intro/CreativeGiniCharacter';
import CreativeGiniBrand from './intro/CreativeGiniBrand';
import Footer from './Footer';

// Step Targets:
// 0: Logo (p=0.00, f=0.00)
// 1: Dust starts (p=0.20, f=0.00)
// 2: Dust/elements move (p=0.40, f=0.00)
// 3: Transformation (p=0.60, f=0.00)
// 4: Elements resolve (p=0.80, f=0.00)
// 5: Pure White & Particles at corners (p=1.00, f=0.00) -> STAYS FIXED & LOCKED
// 6: Footer scales into view (p=1.00, f=1.00)
const TIMELINE_STEPS = [
  { step: 0, screenP: 0.00, footerP: 0.00, label: 'CreativeGini Finale' },
  { step: 1, screenP: 0.20, footerP: 0.00, label: 'Magical Dust Begins' },
  { step: 2, screenP: 0.40, footerP: 0.00, label: 'Elements Moving' },
  { step: 3, screenP: 0.60, footerP: 0.00, label: 'Transformation Developing' },
  { step: 4, screenP: 0.80, footerP: 0.00, label: 'Elements Resolving' },
  { step: 5, screenP: 1.00, footerP: 0.00, label: 'White State (Scroll for Footer)' },
  { step: 6, screenP: 1.00, footerP: 1.00, label: 'Footer Active' }
];

export default function CreativeGiniEndExperience({ onOpenAuth }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [screenProgress, setScreenProgress] = useState(0); // 0.00 -> 1.00 (Screen 1)
  const [footerProgress, setFooterProgress] = useState(0); // 0.00 -> 1.00 (Footer Scale)

  const containerRef = useRef(null);
  const stepRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const cooldownRef = useRef(false);
  const animTweenRef = useRef(null);

  const screenProgRef = useRef(0);
  const footerProgRef = useRef(0);
  const touchStartYRef = useRef(null);

  useEffect(() => {
    stepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    screenProgRef.current = screenProgress;
  }, [screenProgress]);

  useEffect(() => {
    footerProgRef.current = footerProgress;
  }, [footerProgress]);

  // Step Transition Engine with absolute scroll locking
  const goToStep = (targetIndex, direction = 'down') => {
    if (isAnimatingRef.current || cooldownRef.current) return;
    if (targetIndex < 0 || targetIndex >= TIMELINE_STEPS.length) return;

    isAnimatingRef.current = true;
    cooldownRef.current = true;

    const target = TIMELINE_STEPS[targetIndex];
    const isFooterTransition = targetIndex === 6 || (stepRef.current === 6 && targetIndex === 5);

    const proxy = {
      sP: screenProgRef.current,
      fP: footerProgRef.current
    };

    if (animTweenRef.current) animTweenRef.current.kill();

    animTweenRef.current = gsap.to(proxy, {
      sP: target.screenP,
      fP: target.footerP,
      duration: isFooterTransition ? 0.95 : 0.85,
      ease: isFooterTransition ? 'power2.out' : 'power2.out',
      onUpdate: () => {
        setScreenProgress(proxy.sP);
        setFooterProgress(proxy.fP);
      },
      onComplete: () => {
        setCurrentStep(targetIndex);
        setScreenProgress(target.screenP);
        setFooterProgress(target.footerP);
        isAnimatingRef.current = false;

        // 320ms trackpad momentum buffer to strictly prevent double-triggering
        setTimeout(() => {
          cooldownRef.current = false;
        }, 320);
      }
    });
  };

  // Wheel listener: Pinned Sub-Scroll Controller inside Screen 1 & Scaling Footer
  useEffect(() => {
    const handleWheel = (e) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const isVisibleInViewport = rect.top <= 10 && rect.bottom >= window.innerHeight - 10;

      if (!isVisibleInViewport) return;

      const delta = e.deltaY;
      if (Math.abs(delta) < 18) return;

      const cur = stepRef.current;

      if (delta > 0) {
        // SCROLL DOWN GESTURE
        if (cur < TIMELINE_STEPS.length - 1) {
          // Advance step: 0 -> 1 -> 2 -> 3 -> 4 -> 5 (Locked White) -> 6 (Footer Scale)
          e.preventDefault();
          e.stopPropagation();

          if (isAnimatingRef.current || cooldownRef.current) return;
          goToStep(cur + 1, 'down');
        }
      } else if (delta < 0) {
        // SCROLL UP GESTURE
        if (cur > 0) {
          // Reverse step: 6 (Footer) -> 5 (Locked White) -> 4 -> 3 -> 2 -> 1 -> 0 (Logo)
          e.preventDefault();
          e.stopPropagation();

          if (isAnimatingRef.current || cooldownRef.current) return;
          goToStep(cur - 1, 'up');
        } else if (cur === 0) {
          // At Step 0 (Logo): Allow natural scroll back up to Marketing Journey
          if (isAnimatingRef.current || cooldownRef.current) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Touch / Mobile Swipe Controller
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const isVisibleInViewport = rect.top <= 10 && rect.bottom >= window.innerHeight - 10;

      if (isVisibleInViewport && (stepRef.current > 0 || isAnimatingRef.current)) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e) => {
      if (touchStartYRef.current === null) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartYRef.current - touchEndY;
      touchStartYRef.current = null;

      if (Math.abs(diffY) < 38) return;

      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const isVisibleInViewport = rect.top <= 10 && rect.bottom >= window.innerHeight - 10;
      if (!isVisibleInViewport) return;

      const cur = stepRef.current;

      if (diffY > 0) {
        // Swipe UP (Scroll DOWN)
        if (cur < TIMELINE_STEPS.length - 1) {
          if (isAnimatingRef.current || cooldownRef.current) return;
          goToStep(cur + 1, 'down');
        }
      } else if (diffY < 0) {
        // Swipe DOWN (Scroll UP)
        if (cur > 0) {
          if (isAnimatingRef.current || cooldownRef.current) return;
          goToStep(cur - 1, 'up');
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      // clean up
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="creativegini-end-experience-section"
      id="creativegini-end-experience"
      style={{ position: 'relative', minHeight: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
    >
      <div className="screen1-visual-stage" style={{ position: 'relative', width: '100%', minHeight: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Dynamic Canvas Particles */}
        <CreativeGiniParticles introProgress={1.0} />

        {/* Magical Center Portal */}
        <CreativeGiniMagic progress={0.5} />

        {/* Official CreativeGini Gini Character */}
        <CreativeGiniCharacter progress={0.8} />

        {/* Brand Typography, Tagline & Description */}
        <CreativeGiniBrand progress={0.8} />
      </div>

      {/* Footer in Natural Flow */}
      <div className="scaling-footer-wrapper" style={{ width: '100%', position: 'relative', opacity: 1, transform: 'none', filter: 'none', pointerEvents: 'auto' }}>
        <Footer onOpenAuth={onOpenAuth} />
      </div>
    </section>
  );
}

