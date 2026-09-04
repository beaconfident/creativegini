import React from 'react';

export default function CreativeGiniTear({ tearProgress = 0, children, underLayer }) {
  // tearProgress: 0.0 (fully intact intro page) <---> 1.0 (fully torn away revealing Stage 1)
  // Reversible: moving from 1.0 back to 0.0 moves the torn edge downward, smoothly restoring the intro!
  
  // Calculate tear Y position in percentage: 100% -> -15%
  const tearY = 100 - tearProgress * 115;

  // Organic irregular jagged paper edge points
  const p1 = Math.sin(tearProgress * 10) * 12;
  const p2 = Math.cos(tearProgress * 14) * 16;
  const p3 = Math.sin(tearProgress * 8) * 14;
  const p4 = Math.cos(tearProgress * 12) * 18;

  // Polygon clipping: keeps top region down to the jagged tear line
  const clipPathStyle = tearProgress <= 0.001
    ? 'none'
    : `polygon(
        0% 0%,
        100% 0%,
        100% ${tearY + p1}%,
        85% ${tearY - 4 + p2}%,
        70% ${tearY + 6 + p3}%,
        55% ${tearY - 5 + p4}%,
        40% ${tearY + 5 + p1}%,
        25% ${tearY - 6 + p2}%,
        12% ${tearY + 4 + p3}%,
        0% ${tearY + p4}%
      )`;

  return (
    <div className="creativegini-tear-viewport">
      {/* 1. UNDERLAYER: The untouched Stage 1/2/3 Intro Experience */}
      <div className="tear-underlayer-container">
        {underLayer}
      </div>

      {/* 2. OVERLAYER: The Brand Intro Sheet (ALWAYS MOUNTED FOR SEAMLESS BIDIRECTIONAL TEAR) */}
      <div
        className="tear-sheet-overlay"
        style={{
          clipPath: clipPathStyle,
          WebkitClipPath: clipPathStyle,
          pointerEvents: tearProgress >= 0.99 ? 'none' : 'auto'
        }}
      >
        {children}

        {/* Realistic Torn Paper Edge Highlight & Drop Shadow */}
        {tearProgress > 0.01 && tearProgress < 0.99 && (
          <div
            className="torn-paper-edge-highlight"
            style={{
              top: `${tearY}%`,
              transform: `translateY(-50%)`
            }}
          >
            <svg className="torn-edge-svg" viewBox="0 0 1000 60" preserveAspectRatio="none">
              <defs>
                <filter id="tornShadow" x="0%" y="0%" width="100%" height="200%">
                  <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
              </defs>
              <path
                d="M 0 30 Q 120 45, 250 20 T 500 35 T 750 15 T 1000 32 L 1000 50 L 0 50 Z"
                fill="#ffffff"
                filter="url(#tornShadow)"
              />
              <path
                d="M 0 30 Q 120 45, 250 20 T 500 35 T 750 15 T 1000 32"
                stroke="#E2E8F0"
                strokeWidth="2.5"
                fill="none"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
