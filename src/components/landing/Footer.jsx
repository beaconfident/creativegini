import React from 'react';
import { Sparkles, ArrowUpRight, Github, Twitter, Linkedin, Disc as Discord } from 'lucide-react';

export default function Footer({ onOpenAuth }) {
  return (
    <footer className="creativegini-main-footer" id="landing-footer">
      <div className="footer-top-ambient-glow" />

      <div className="footer-container">
        {/* Main Grid */}
        <div className="footer-grid-layout">
          {/* Brand Info Column */}
          <div className="footer-brand-col">
            <div className="footer-logo-row">
              <img
                src="/logo-icon.png"
                alt="CreativeGini"
                className="footer-logo-img"
              />
              <span className="footer-brand-title">CreativeGini</span>
            </div>
            <p className="footer-brand-bio">
              The autonomous AI marketing engine that discovers high-intent demand across 12+ channels, generates multi-format creative assets, and scales brand distribution on autopilot.
            </p>
            <div className="footer-status-pill">
              <span className="status-indicator-dot" />
              <span className="status-label">All Systems Operational • AI Squads Online</span>
            </div>
          </div>

          {/* Navigation Column: Platform */}
          <div className="footer-nav-col">
            <h4 className="footer-col-heading">Platform</h4>
            <ul className="footer-nav-links">
              <li><a href="#marketing-channels" className="footer-link">Marketing Globe</a></li>
              <li><a href="#marketing-journey" className="footer-link">Campaign Journey</a></li>
              <li><a href="#strategic-planner" className="footer-link">Strategic Planner</a></li>
              <li><a href="#creative-squads" className="footer-link">Creative AI Squads</a></li>
              <li><a href="#devrel-engine" className="footer-link">DevRel Engine</a></li>
            </ul>
          </div>

          {/* Navigation Column: Channels */}
          <div className="footer-nav-col">
            <h4 className="footer-col-heading">12+ Channels</h4>
            <ul className="footer-nav-links">
              <li><span className="footer-channel-tag">Instagram & Facebook</span></li>
              <li><span className="footer-channel-tag">LinkedIn & X (Twitter)</span></li>
              <li><span className="footer-channel-tag">YouTube & TikTok</span></li>
              <li><span className="footer-channel-tag">Reddit & Discord</span></li>
              <li><span className="footer-channel-tag">Google Search & Ads</span></li>
            </ul>
          </div>

          {/* Navigation Column: Get Started */}
          <div className="footer-nav-col footer-action-col">
            <h4 className="footer-col-heading">Launch Campaign</h4>
            <p className="footer-cta-sub">
              Ready to automate your multi-channel marketing pipeline?
            </p>
            <button
              className="footer-deploy-btn"
              onClick={onOpenAuth}
            >
              <Sparkles size={16} />
              <span>Deploy AI Campaign</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copy-text">
            © {new Date().getFullYear()} CreativeGini Technologies Inc. All rights reserved.
          </div>
          <div className="footer-social-icons">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer-icon-btn" aria-label="Twitter">
              <Twitter size={16} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="footer-icon-btn" aria-label="LinkedIn">
              <Linkedin size={16} />
            </a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" className="footer-icon-btn" aria-label="Discord">
              <Discord size={16} />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="footer-icon-btn" aria-label="GitHub">
              <Github size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
