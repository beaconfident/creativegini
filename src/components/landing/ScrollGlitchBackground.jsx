import React, { useEffect, useState, useRef } from 'react';

export default function ScrollGlitchBackground() {
  const [isScrolling, setIsScrolling] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const timeoutRef = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = Math.abs(currentScrollY - lastScrollY.current);
      lastScrollY.current = currentScrollY;

      // Intensity based on scroll delta
      const intensity = Math.min(1, Math.max(0.3, delta / 60));
      setGlitchIntensity(intensity);
      setIsScrolling(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        setGlitchIntensity(0);
      }, 260);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className={`nb-scroll-glitch-container ${isScrolling ? 'glitch-active' : ''}`}
      style={{ '--glitch-int': glitchIntensity }}
      aria-hidden="true"
    >
      {/* Chromatic Digital Slice Strips */}
      <div className="nb-glitch-slice slice-1" />
      <div className="nb-glitch-slice slice-2" />
      <div className="nb-glitch-slice slice-3" />
      <div className="nb-glitch-slice slice-4" />
      <div className="nb-glitch-slice slice-5" />

      {/* Digital Scanlines Sweep */}
      <div className="nb-glitch-scanlines" />

      {/* Floating Neo-Brutal Glitch Artifacts */}
      <div className="nb-glitch-floating-artifact art-1">
        <span>0x7F_BUFFER_STREAM // [SYNC]</span>
      </div>
      <div className="nb-glitch-floating-artifact art-2">
        <span>[ERR: CH_GLITCH_DISPLACE]</span>
      </div>
      <div className="nb-glitch-floating-artifact art-3">
        <span>■■■□□_PIXEL_SCRUB</span>
      </div>
    </div>
  );
}
