import React from 'react';
import { Sparkles, Cpu, Target, ArrowDown } from 'lucide-react';

export default function CreativeGiniBrand({ progress = 0 }) {
  // progress from 0.0 to 1.0
  // Starts appearing around p = 0.70, fully formed at p >= 0.95
  if (progress <= 0.68) return null;

  // Normalized brand reveal t: 0.0 at p = 0.70 -> 1.0 at p = 0.95
  const t = Math.max(0, Math.min(1, (progress - 0.70) / 0.25));

  const opacity = Math.min(1, t * 1.3);
  const translateY = (1 - t) * 30;
  const letterSpacing = 0.08 + (1 - t) * 0.12;

  return (
    <div
      className="creativegini-brand-reveal-container"
      style={{
        position: 'absolute',
        top: '58%',
        left: '50%',
        transform: `translate(-50%, 0) translateY(${translateY}px)`,
        opacity: opacity,
        zIndex: 6,
        pointerEvents: 'none',
        textAlign: 'center',
        width: '100%',
        maxWidth: '920px',
        padding: '0 24px',
        transition: 'opacity 0.15s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* CREATIVEGINI Gradient Wordmark */}
      <h1
        className="brand-wordmark-title"
        style={{ letterSpacing: `${letterSpacing}em` }}
      >
        <span className="brand-word-creative">CREATIVE</span>
        <span className="brand-word-gini">GINI</span>
      </h1>

      {/* Radiant Tagline Pill */}
      <div className="brand-tagline-bar">
        <span className="tagline-dot" />
        <span className="tagline-text">AI AGENTS FOR STRATEGY • CONTENT • COMMUNITY GROWTH</span>
        <span className="tagline-dot" />
      </div>

      {/* Brand Description Paragraph */}
      <p className="brand-description-text">
        The autonomous AI-powered growth engine that unifies your entire marketing lifecycle—from multi-channel market discovery and high-velocity asset creation to strategic distribution across 12+ global platforms.
      </p>

      {/* Capability Feature Badges */}
      <div className="brand-highlights-row">
        <div className="brand-highlight-chip">
          <Cpu className="chip-icon text-indigo-500" size={14} />
          <span>Autonomous AI Squads</span>
        </div>
        <div className="brand-highlight-chip">
          <Target className="chip-icon text-pink-500" size={14} />
          <span>12+ Marketing Channels</span>
        </div>
        <div className="brand-highlight-chip">
          <Sparkles className="chip-icon text-amber-500" size={14} />
          <span>Real-Time Growth Engine</span>
        </div>
      </div>

      {/* Next Scroll Prompt Indicator */}
      <div className="brand-next-scroll-prompt">
        <span className="prompt-text">Scroll to begin the journey</span>
        <ArrowDown className="prompt-arrow-icon" size={14} />
      </div>
    </div>
  );
}
