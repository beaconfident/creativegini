import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import MarketingGlobe from './MarketingGlobe';
import { MARKETING_PLATFORMS } from '../../data/marketingPlatforms';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Layers,
  Compass,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export default function MarketingChannelsSection({ onExploreChannel }) {
  const [selectedPlatform, setSelectedPlatform] = useState(MARKETING_PLATFORMS[0]); // Default to Instagram or null
  const [isDefaultView, setIsDefaultView] = useState(false);
  const panelRef = useRef(null);

  // Smooth dynamic GSAP spring & fade transition when changing selected platform
  useEffect(() => {
    if (!panelRef.current) return;
    const elements = panelRef.current.querySelectorAll('.animate-info-item');

    gsap.fromTo(
      elements,
      { y: 18, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, stagger: 0.05, ease: 'back.out(1.2)' }
    );
  }, [selectedPlatform]);

  const handleSelect = (platform) => {
    setIsDefaultView(false);
    setSelectedPlatform(platform);
  };

  const handleResetToDefault = () => {
    setIsDefaultView(true);
    setSelectedPlatform(null);
  };

  return (
    <section className="marketing-channels-section" id="marketing-channels">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header-centered">
          <div className="section-tag">
            <Compass size={14} /> Market Channels Discovery
          </div>
          <h2 className="section-title">
            Where Does Your Market Exist?
          </h2>
          <p className="section-desc">
            Your customers are already somewhere. We help you find where they are and choose the right channels to reach them.
          </p>
        </div>

        {/* Main Two-Column Interactive Layout */}
        <div className="channels-interactive-grid">
          {/* LEFT: Information Panel */}
          <div className="channel-info-column">
            <div ref={panelRef} className="channel-glass-panel">
              {isDefaultView || !selectedPlatform ? (
                /* Default State */
                <div className="info-panel-default-state animate-info-item">
                  <div className="default-icon-aura">
                    <Compass size={36} className="compass-spin" />
                  </div>
                  <h3 className="default-title">Choose a channel</h3>
                  <p className="default-desc">
                    Explore the places where your customers may already be. Hover or tap any platform on the 3D marketing globe to analyze audience reach, advertising approach, and distribution strategy.
                  </p>

                  <div className="default-channel-pills-preview">
                    {MARKETING_PLATFORMS.slice(0, 6).map((p) => (
                      <button
                        key={p.id}
                        className="quick-channel-chip"
                        onClick={() => handleSelect(p)}
                      >
                        <span className="chip-dot" style={{ background: p.accentColor }} />
                        {p.name}
                      </button>
                    ))}
                  </div>

                  <div className="creativegini-ecosystem-callout">
                    <Sparkles size={16} className="callout-sparkle" />
                    <span>CreativeGini maps your product to the highest-converting channels.</span>
                  </div>
                </div>
              ) : (
                /* Active Platform State */
                <div className="info-panel-active-state">
                  {/* Category Pill & ID */}
                  <div className="panel-top-bar animate-info-item">
                    <div
                      className="platform-category-badge"
                      style={{ '--badge-color': selectedPlatform.accentColor }}
                    >
                      <Layers size={13} />
                      <span>{selectedPlatform.category}</span>
                    </div>
                    <span className="platform-type-tag">{selectedPlatform.channelType}</span>
                  </div>

                  {/* Platform Heading with Official Logo */}
                  <div className="platform-header-row animate-info-item">
                    <div
                      className="platform-avatar-halo"
                      style={{
                        background: '#FFFFFF',
                        border: `1.5px solid ${selectedPlatform.accentColor}30`,
                        boxShadow: `0 8px 24px ${selectedPlatform.accentColor}25`
                      }}
                    >
                      <img
                        src={selectedPlatform.logo}
                        alt={selectedPlatform.name}
                        className="platform-info-logo-img"
                      />
                    </div>
                    <div>
                      <h3 className="platform-name-title">{selectedPlatform.name}</h3>
                      <span className="platform-reach-text">
                        <Users size={13} /> {selectedPlatform.audienceReach}
                      </span>
                    </div>
                  </div>

                  {/* Estimated Advertising Cost Block */}
                  <div className="ad-cost-highlight-card animate-info-item">
                    <div className="cost-header">
                      <DollarSign size={14} className="cost-icon" />
                      <span className="cost-label">ESTIMATED ADVERTISING COST</span>
                    </div>
                    <p className="cost-value-text">
                      {selectedPlatform.estimatedAdCost}
                    </p>
                  </div>

                  {/* Platform Overview Description */}
                  <div className="platform-description-block animate-info-item">
                    <p className="desc-text">{selectedPlatform.description}</p>
                  </div>

                  {/* Strategic Strengths & Best For */}
                  <div className="platform-strengths-box animate-info-item">
                    <div className="strengths-label">
                      <Target size={14} /> BEST FOR YOUR PRODUCT:
                    </div>
                    <p className="strengths-content">{selectedPlatform.bestFor}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: 3D Interactive Marketing Globe */}
          <div className="channel-globe-column">
            <MarketingGlobe
              activePlatform={selectedPlatform}
              onSelectPlatform={handleSelect}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
