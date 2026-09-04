import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  MARKETING_SERVICES_COSTS,
  MARKETING_STACK_TOOLS
} from '../../data/marketingCosts';
import {
  Compass,
  MapPin,
  Share2,
  Globe,
  MessageSquare,
  Users,
  Search,
  Code,
  FileText,
  Video,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Layers,
  Layout,
  Film
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function MarketingJourney({ onExploreSolution }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const scene4SectionRef = useRef(null);
  const scene6to7ContainerRef = useRef(null);
  const scene6to7TrackRef = useRef(null);
  const [hoveredPipelineStep, setHoveredPipelineStep] = useState(null);

  // 1. Horizontal ScrollTrigger for Scenes 1, 2, 3
  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    let ctx = gsap.context(() => {
      const getScrollAmount = () => -(track.scrollWidth - window.innerWidth);

      gsap.to(track, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          pin: true,
          anticipatePin: 1,
          scrub: 1.2,
          invalidateOnRefresh: true
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);


  // 3. New Pinned Horizontal Transition: Scene 06 ("MONEY IN. PRODUCT OUT.") -> Scene 07 ("ONE PLACE. YOUR COMPLETE MARKETING TEAM.")
  useEffect(() => {
    const container = scene6to7ContainerRef.current;
    const track = scene6to7TrackRef.current;
    if (!container || !track) return;

    let ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${window.innerWidth * 1.0}`,
          pin: true,
          anticipatePin: 1,
          scrub: 1.2,
          invalidateOnRefresh: true
        }
      });
    }, scene6to7ContainerRef);

    return () => ctx.revert();
  }, []);

  // Strategy Pipeline Steps for Scene 03
  const strategySteps = [
    { step: '01', title: 'Product', desc: 'Core Value & UVP', icon: <Zap size={18} />, color: '#7c3aed', animClass: 'pipeline-anim-pulse' },
    { step: '02', title: 'Audience', desc: 'ICP & Persona Mapping', icon: <Users size={18} />, color: '#0284c7', animClass: 'pipeline-anim-ring' },
    { step: '03', title: 'Message', desc: 'Copy & Narrative Hook', icon: <MessageSquare size={18} />, color: '#0d9488', animClass: 'pipeline-anim-shimmer' },
    { step: '04', title: 'Channel', desc: 'High-Converting Platforms', icon: <Share2 size={18} />, color: '#d97706', animClass: 'pipeline-anim-slide' },
    { step: '05', title: 'Content', desc: 'Creative Ads & Videos', icon: <Video size={18} />, color: '#e11d48', animClass: 'pipeline-anim-float' },
    { step: '06', title: 'Campaign', desc: 'Multi-Touch Funnels', icon: <Target size={18} />, color: '#9333ea', animClass: 'pipeline-anim-border' },
    { step: '07', title: 'Customer', desc: 'Acquisition & Retention', icon: <TrendingUp size={18} />, color: '#16a34a', animClass: 'pipeline-anim-glow' }
  ];

  // Foreground & Midground Discovery Nodes for Scene 01
  const foregroundMarketNodes = [
    { title: 'Forums & Discussions', category: 'Tech & AI Discourse', count: '10M+ discussions', icon: <MessageSquare size={17} />, color: '#6366f1' },
    { title: 'Niche Subreddit Groups', category: 'Passionate Communities', count: '850M+ visitors', icon: <Users size={17} />, color: '#f97316' },
    { title: 'Active Search Demand', category: 'High-Intent Purchasing', count: '8.5B+ queries/day', icon: <Search size={17} />, color: '#0ea5e9' },
    { title: 'Developer & Tech Hubs', category: 'Open Source & Builders', count: '100M+ developers', icon: <Code size={17} />, color: '#10b981' },
    { title: 'Enterprise Networks', category: 'B2B Decision Makers', count: '1B+ professionals', icon: <Users size={17} />, color: '#0284c7' },
    { title: 'Industry Publications', category: 'Domain Authority & SEO', count: 'High-authority domains', icon: <Globe size={17} />, color: '#8b5cf6' }
  ];

  // Creative Outputs for Scene 02
  const marketingOutputs = [
    { title: 'Web App & Interactive Pages', format: 'Web App', tag: 'Conversion', color: '#6366f1', animClass: 'output-anim-3d', icon: <Layout size={18} /> },
    { title: '3D Motion & Product Demos', format: '3D Motion', tag: 'Visual Demo', color: '#ec4899', animClass: 'output-anim-motion', icon: <Film size={18} /> },
    { title: 'Creative Graphics & Posters', format: 'Creative Graphic', tag: 'Brand Social', color: '#f59e0b', animClass: 'output-anim-pulse', icon: <Layers size={18} /> },
    { title: 'Mobile Videos, Reels & Shorts', format: 'Mobile Video', tag: 'Viral Growth', color: '#06b6d4', animClass: 'output-anim-float', icon: <Video size={18} /> },
    { title: 'Technical Blogs & Articles', format: 'SEO Inbound', tag: 'Content Engine', color: '#10b981', animClass: 'output-anim-shimmer', icon: <FileText size={18} /> },
    { title: 'Pitch Deck & Sales Slides', format: 'Presentations', tag: 'Executive Sales', color: '#8b5cf6', animClass: 'output-anim-tilt', icon: <Share2 size={18} /> },
    { title: 'Product Launch Campaigns', format: 'Multi-Channel', tag: 'GTM Strategy', color: '#f43f5e', animClass: 'output-anim-glow', icon: <Target size={18} /> },
    { title: 'Promotional Creatives & Ads', format: 'Paid Creative', tag: 'Ad Acquisition', color: '#3b82f6', animClass: 'output-anim-play', icon: <Sparkles size={18} /> }
  ];

  return (
    <div className="marketing-journey-flow-wrapper" id="marketing-journey">
      {/* ==================================================
          1. HORIZONTAL PINNED TRACK (SCENES 1, 2, 3 ONLY)
          ================================================== */}
      <section ref={containerRef} className="marketing-journey-pinned-section">
        <div className="journey-sticky-viewport">
          <div ref={trackRef} className="journey-horizontal-track horizontal-track-scenes-1-3">
            {/* SCENE 01: WHERE IS YOUR MARKET? */}
            <div className="journey-scene scene-01-market">
              <div className="scene-content-wrapper relative-z">
                <div className="scene-text-header">
                  <span className="scene-number-badge">SCENE 01 • MARKET DISCOVERY</span>
                  <h2 className="scene-main-heading">
                    Where Is Your Market?
                  </h2>
                  <p className="scene-lead-paragraph">
                    Your customers don’t live in one isolated place. CreativeGini actively discovers and maps the online discussions, high-intent queries, and specialized communities where your market congregates.
                  </p>
                </div>

                <div className="foreground-discovery-grid">
                  {foregroundMarketNodes.map((node, i) => (
                    <div
                      key={i}
                      className="market-foreground-card"
                      style={{ '--card-color': node.color }}
                    >
                      <div className="market-card-top-row">
                        <div className="market-card-icon" style={{ color: node.color, background: `${node.color}15` }}>
                          {node.icon}
                        </div>
                        <span className="market-card-metric">{node.count}</span>
                      </div>
                      <h3 className="market-card-title">{node.title}</h3>
                      <p className="market-card-cat">{node.category}</p>
                      <div className="market-card-radar-dot">
                        <span className="pulse-ping" style={{ background: node.color }} />
                        <span className="static-dot" style={{ background: node.color }} />
                        <span>Live audience signal</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SCENE 02: WHAT ARE YOU TRYING TO PROMOTE? */}
            <div className="journey-scene scene-02-outputs">
              <div className="scene-content-wrapper relative-z">
                <div className="scene-text-header">
                  <span className="scene-number-badge">SCENE 02 • CREATIVE PRODUCTION</span>
                  <h2 className="scene-main-heading">
                    What Are You Trying to Promote?
                  </h2>
                  <p className="scene-lead-paragraph">
                    Capturing modern audience attention demands an array of polished, high-performing creative outputs—each engineered for specific formats and channels.
                  </p>
                </div>

                <div className="outputs-floating-cloud-grid">
                  {marketingOutputs.map((item, idx) => (
                    <div
                      key={idx}
                      className={`output-creative-card ${item.animClass}`}
                      style={{ '--card-accent': item.color }}
                    >
                      <div className="output-card-top">
                        <span className="output-format-tag" style={{ color: item.color, borderColor: `${item.color}40`, background: `${item.color}12` }}>
                          {item.format}
                        </span>
                        <span className="output-badge">{item.tag}</span>
                      </div>
                      <h4 className="output-title">{item.title}</h4>
                      <div className="output-visual-mock-bar">
                        <span className="mock-bar-fill" style={{ background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SCENE 03: HOW SHOULD YOU MARKET IT? */}
            <div className="journey-scene scene-03-strategy">
              <div className="scene-content-wrapper relative-z">
                <div className="scene-text-header">
                  <span className="scene-number-badge">SCENE 03 • STRATEGY LAYER</span>
                  <h2 className="scene-main-heading">
                    How Should You Market It?
                  </h2>
                  <p className="scene-lead-paragraph">
                    Random content fails without strategic alignment. Effective growth requires a connected pipeline from product value to customer conversion. Hover over any stage to inspect the strategy.
                  </p>
                </div>

                <div className="strategy-pipeline-flow-container">
                  <div className="pipeline-flow-rail">
                    {strategySteps.map((step, idx) => {
                      const isHovered = hoveredPipelineStep === idx;
                      const isAnyHovered = hoveredPipelineStep !== null;
                      const isDimmed = isAnyHovered && !isHovered;

                      return (
                        <React.Fragment key={step.step}>
                          <div
                            className={`pipeline-step-node ${step.animClass} ${isHovered ? 'node-focused' : ''} ${isDimmed ? 'node-dimmed' : ''}`}
                            style={{ '--step-color': step.color }}
                            onMouseEnter={() => setHoveredPipelineStep(idx)}
                            onMouseLeave={() => setHoveredPipelineStep(null)}
                          >
                            <div className="step-badge-number">{step.step}</div>
                            <div className="step-icon-aura" style={{ color: step.color }}>
                              {step.icon}
                            </div>
                            <h4 className="step-title">{step.title}</h4>
                            <p className="step-desc">{step.desc}</p>
                            {isHovered && <div className="step-spotlight-aura" style={{ background: `${step.color}15` }} />}
                          </div>

                          {idx < strategySteps.length - 1 && (
                            <div className="pipeline-connector-arrow">
                              <div className="connector-wire">
                                <div className="wire-moving-light" />
                              </div>
                              <ArrowRight size={18} className="arrow-head" />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. SCENE 04: PINNED FULLSCREEN VIEWPORT STAGE
          (Continuous natural vertical flow, pinned smoothly with GSAP ScrollTrigger)
          ================================================== */}
      <section
        ref={scene4SectionRef}
        className="scene4-pinned-section"
        id="scene-04-costs-section"
      >
        <div className="scene4-stage-container">
          {/* Solid 100% Opaque Stage Atmosphere */}
          <div className="scene4-stage-bg" />

          {/* ==================================================
              LAYER 1: SCENE 04 (STATIONARY UNDERNEATH)
              ================================================== */}
          <div className="scene4-underlayer">
            <div className="scene-text-header">
              <span className="scene-number-badge cost-badge">SCENE 04 • FINANCIAL BURN RATE</span>
              <h2 className="scene-main-heading">
                What Does It Cost to Do All This?
              </h2>
              <p className="scene-lead-paragraph">
                When you try to manage marketing with separate tools, freelancers, and specialized agencies, costs snowball uncontrollably.
              </p>
            </div>

            <div className="costs-accumulation-visual relative-pos">
              <div className="costs-stack-grid">
                {MARKETING_STACK_TOOLS.map((tool) => (
                  <div key={tool.id} className="tool-expense-pill">
                    <DollarSign size={14} className="tool-dollar" />
                    <span className="tool-name">{tool.name}</span>
                    <strong className="tool-cost">{tool.costRange}</strong>
                  </div>
                ))}
              </div>

              <div className="costs-equation-summary-card">
                <div className="equation-row">
                  <span className="eq-item">Software Tools</span>
                  <span className="eq-sign">+</span>
                  <span className="eq-item">Niche Agencies</span>
                  <span className="eq-sign">+</span>
                  <span className="eq-item">Freelancers</span>
                  <span className="eq-sign">+</span>
                  <span className="eq-item">Ad Spend</span>
                  <span className="eq-sign">=</span>
                  <span className="eq-result">$5,000 – $25,000+ / mo</span>
                </div>
                <div className="disclaimer-note">
                  *Illustrative market pricing across typical SaaS and product marketing tool stacks.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. NEW HORIZONTAL TRANSITION: SCENE 06 -> SCENE 07
          ("MONEY IN. PRODUCT OUT." -> "ONE PLACE. YOUR COMPLETE MARKETING TEAM.")
          ================================================== */}
      <section
        ref={scene6to7ContainerRef}
        className="scene6-to-7-horizontal-section"
        id="scene-06-money-product"
      >
        <div className="scene6-to-7-sticky-viewport">
          <div ref={scene6to7TrackRef} className="scene6-to-7-horizontal-track">
            {/* SCENE 06: "MONEY IN. PRODUCT OUT." */}
            <div className="journey-scene scene-06-money-product-scene">
              <div className="scene-content-wrapper">
                <div className="money-product-central-container">
                  <div className="central-vault-header">
                    <div className="vault-tag">
                      <AlertTriangle size={15} /> THE COST OF DISCONNECTION
                    </div>
                    <h2 className="money-in-product-out-title">
                      MONEY IN.<br />PRODUCT OUT.
                    </h2>
                    <p className="vault-subtext">
                      Paying separate vendors for separate tasks creates high overhead and zero synergy.
                    </p>
                  </div>

                  <div className="services-crossout-grid">
                    {MARKETING_SERVICES_COSTS.map((item) => (
                      <div
                        key={item.id}
                        className="cost-service-item-card"
                      >
                        <div className="service-header-line">
                          <span className="service-name">{item.name}</span>
                          <span className="service-estimate">{item.estimatedCost}</span>
                        </div>
                        <div className="service-label-tiny">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SCENE 07: "ONE PLACE. YOUR COMPLETE MARKETING TEAM." */}
            <div className="journey-scene scene-07-solution-reveal-scene" id="scene-07-solution-reveal">
              <div className="scene-content-wrapper solution-center-card">
                <h2 className="solution-main-heading animate-solution-item">
                  One Place.<br />
                  <span className="gradient-highlight-text">Your Complete Marketing Team.</span>
                </h2>

                <p className="solution-lead-desc animate-solution-item">
                  Stop juggling 10 different tools and fragmented agencies. CreativeGini unifies strategic audience discovery, AI content generation, ad execution, and performance analytics into a single intelligent platform.
                </p>

                <div className="solution-benefits-row animate-solution-item">
                  <div className="benefit-pill">
                    <CheckCircle2 size={16} className="check-icon" />
                    <span>Integrated Strategy & Execution</span>
                  </div>
                  <div className="benefit-pill">
                    <CheckCircle2 size={16} className="check-icon" />
                    <span>Specialized POD Squad</span>
                  </div>
                  <div className="benefit-pill">
                    <CheckCircle2 size={16} className="check-icon" />
                    <span>Multi-Channel Automation</span>
                  </div>
                </div>

                <div className="solution-cta-row animate-solution-item">
                  <button
                    className="btn-primary solution-launch-btn"
                    onClick={onExploreSolution}
                  >
                    <Sparkles size={16} /> Explore CreativeGini Platform <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
