import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import CreativeGiniParticles from './CreativeGiniParticles';
import CreativeGiniMagic from './CreativeGiniMagic';
import CreativeGiniCharacter from './CreativeGiniCharacter';
import CreativeGiniBrand from './CreativeGiniBrand';
import CreativeGiniTear from './CreativeGiniTear';

// Discrete timeline step targets
const STEP_TARGETS = [
  { step: 0, introProgress: 0.00, tearProgress: 0.00 }, // Initial screen
  { step: 1, introProgress: 0.25, tearProgress: 0.00 }, // Particles gathering
  { step: 2, introProgress: 0.50, tearProgress: 0.00 }, // Magical portal forming
  { step: 3, introProgress: 0.75, tearProgress: 0.00 }, // Gini emerges
  { step: 4, introProgress: 1.00, tearProgress: 0.00 }, // Complete Brand composition (holds)
  { step: 5, introProgress: 1.00, tearProgress: 1.00 }  // Torn page transition (reveals Stage 1)
];

export default function CreativeGiniIntroController({ children }) {
  const [currentStep, setCurrentStep] = useState(0);
  const stepRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const cooldownRef = useRef(false);

  // Continuous progress state
  const [introProgress, setIntroProgress] = useState(0);
  const [tearProgress, setTearProgress] = useState(0);

  const introProgRef = useRef(0);
  const tearProgRef = useRef(0);
  const touchStartYRef = useRef(null);
  const animTweenRef = useRef(null);

  useEffect(() => {
    stepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    introProgRef.current = introProgress;
  }, [introProgress]);

  useEffect(() => {
    tearProgRef.current = tearProgress;
  }, [tearProgress]);

  // Lock body scroll strictly whenever Intro is not 100% completed
  const isIntroActive = currentStep < 5 || tearProgress < 1.0;

  useEffect(() => {
    if (isIntroActive) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    }

    return () => {
      if (!isIntroActive) {
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
      }
    };
  }, [isIntroActive]);

  // Reversible Step Transition Timeline
  const goToStep = (targetStepIndex, direction = 'down') => {
    if (isAnimatingRef.current || cooldownRef.current) return;
    if (targetStepIndex < 0 || targetStepIndex > 5) return;

    isAnimatingRef.current = true;
    cooldownRef.current = true;

    const target = STEP_TARGETS[targetStepIndex];
    const isTearTransition = targetStepIndex === 5 || (stepRef.current === 5 && targetStepIndex === 4);

    const proxy = {
      iProg: introProgRef.current,
      tProg: tearProgRef.current
    };

    if (animTweenRef.current) animTweenRef.current.kill();

    animTweenRef.current = gsap.to(proxy, {
      iProg: target.introProgress,
      tProg: target.tearProgress,
      duration: isTearTransition ? 1.15 : 0.85,
      ease: isTearTransition ? 'power2.inOut' : 'power2.out',
      onUpdate: () => {
        setIntroProgress(proxy.iProg);
        setTearProgress(proxy.tProg);
      },
      onComplete: () => {
        setCurrentStep(targetStepIndex);
        setIntroProgress(target.introProgress);
        setTearProgress(target.tearProgress);
        isAnimatingRef.current = false;

        // 300ms cooldown buffer for trackpad inertia absorption
        setTimeout(() => {
          cooldownRef.current = false;
        }, 300);
      }
    });
  };

  // Wheel listener: Strict Sub-Scroll Controller (Forward & Backward)
  useEffect(() => {
    const handleWheel = (e) => {
      const delta = e.deltaY;
      if (Math.abs(delta) < 18) return;

      const current = stepRef.current;
      const curTear = tearProgRef.current;

      // Inside Brand Intro or Tearing phase
      if (current < 5 || (current === 5 && curTear < 1.0)) {
        e.preventDefault();
        e.stopPropagation();

        if (isAnimatingRef.current || cooldownRef.current) return;

        if (delta > 0) {
          // Scroll DOWN: Step 0 -> 1 -> 2 -> 3 -> 4 -> 5
          if (current < 5) {
            goToStep(current + 1, 'down');
          }
        } else if (delta < 0) {
          // Scroll UP: Step 5 -> 4 -> 3 -> 2 -> 1 -> 0
          if (current > 0) {
            goToStep(current - 1, 'up');
          }
        }
      } else {
        // Step 5 completed (Tear is 100% complete, Stage 1 active)
        // If user is at top of Stage 1 (scrollY <= 5) and scrolls UP, reverse the tear smoothly!
        const scrollY = window.scrollY || window.pageYOffset;
        if (scrollY <= 5 && delta < -18) {
          const introViewport = document.getElementById('intro-experience-viewport');
          if (introViewport) {
            const titleCard = introViewport.querySelector('.roll-letters-heading');
            if (titleCard && titleCard.textContent.includes('DO YOU OWN')) {
              e.preventDefault();
              e.stopPropagation();

              if (isAnimatingRef.current || cooldownRef.current) return;
              goToStep(4, 'up'); // Reverse tear from 1.0 back to 0.0
            }
          }
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Touch / Mobile Swipe Controller (Forward & Backward)
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (stepRef.current < 5 || tearProgRef.current < 1.0) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e) => {
      if (touchStartYRef.current === null) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartYRef.current - touchEndY;
      touchStartYRef.current = null;

      if (Math.abs(diffY) < 38) return;
      const current = stepRef.current;

      if (current < 5 || tearProgRef.current < 1.0) {
        if (isAnimatingRef.current || cooldownRef.current) return;

        if (diffY > 0) {
          // Swipe up (scroll down)
          if (current < 5) goToStep(current + 1, 'down');
        } else if (diffY < 0) {
          // Swipe down (scroll up)
          if (current > 0) goToStep(current - 1, 'up');
        }
      } else {
        const scrollY = window.scrollY || window.pageYOffset;
        if (scrollY <= 5 && diffY < -38) {
          if (isAnimatingRef.current || cooldownRef.current) return;
          goToStep(4, 'up');
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // The Brand Intro Layer Surface
  const brandIntroSheet = (
    <div className="brand-intro-fullscreen-layer">
      {/* Dynamic Canvas Particles (derives coordinates continuously from introProgress) */}
      <CreativeGiniParticles introProgress={introProgress} />

      {/* Magical Center Portal and Energy Rings (fades & shrinks in reverse) */}
      <CreativeGiniMagic progress={introProgress} />

      {/* Official CreativeGini Gini Character (recedes into magic in reverse) */}
      <CreativeGiniCharacter progress={introProgress} />

      {/* CREATIVEGINI Wordmark & Description (dissolves & retracts in reverse) */}
      <CreativeGiniBrand progress={introProgress} />

      {/* Initial Scroll Prompt Hint at Step 0 */}
      {currentStep === 0 && (
        <div className="intro-initial-scroll-hint animate-fade-in">
          <span>Scroll to awaken CreativeGini</span>
        </div>
      )}
    </div>
  );

  // Pass isActive flag and onReverseToBrandIntro callback to child (IntroExperience)
  const isStage1Active = currentStep === 5 && tearProgress >= 1.0;
  const clonedChild = React.isValidElement(children)
    ? React.cloneElement(children, {
        isActive: isStage1Active,
        onReverseToBrandIntro: () => goToStep(4, 'up')
      })
    : children;

  return (
    <CreativeGiniTear
      tearProgress={tearProgress}
      underLayer={clonedChild}
    >
      {brandIntroSheet}
    </CreativeGiniTear>
  );
}
