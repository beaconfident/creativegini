import React, { useEffect, useRef } from 'react';

/**
 * STAR-PARTICLE GLOBE (3D COSMIC PLANET ENGINE)
 * 
 * - 3D globe made entirely from thousands of glowing stars and tiny particles
 * - Floating in a deep black cosmic environment
 * - Earth-like spherical volume & continental starlight clustering without solid textures
 * - Dominant electric blue & cyan stars with flowing warm gold, orange clusters and white highlights
 * - Drifting stars, orbiting particle rings, escaping/returning cosmic dust, breathing globe
 * - Interactive cursor repulsion with smooth spring physics & drag rotation
 */

const SURFACE_PARTICLES = 3200;
const ORBIT_PARTICLES = 160;
const ESCAPING_PARTICLES = 90;
const BG_STARS = 380;

const COLORS = {
  electricBlue: [0, 174, 239],
  cyan: [0, 235, 255],
  warmGold: [255, 185, 20],
  warmOrange: [255, 130, 20],
  softWhite: [250, 250, 255]
};

const StarParticleGlobe = React.forwardRef(({
  width = 640,
  height = 640,
  baseRadius = 210,
  className = '',
  interactive = true,
  children
}, ref) => {
  const [phase, setPhase] = React.useState('idle'); // 'idle' | 'dispersing' | 'gathering'
  // Offset to shift Instagram icon leftwards on screen 3
  const instagramOffsetRef = React.useRef({ x: -200, y: 0 });
  const targetPointsRef = useRef([]);
  const targetProgressRef = useRef(0);
  const gatherProgressRef = useRef(1.0);
  const instagramTargetPointsRef = React.useRef([]);
  const instagramProgressRef = React.useRef(0);

  // expose method to parent
  React.useImperativeHandle(ref, () => ({
    triggerTransition: (svgPath) => {
      const points = sampleSvgPath(svgPath, SURFACE_PARTICLES);
      targetPointsRef.current = points;
      setPhase('dispersing');
      setTimeout(() => setPhase('gathering'), 2000);
    },
    triggerInstagramTransition: (svgPath) => {
      const points = sampleSvgPath(svgPath, SURFACE_PARTICLES);
      instagramTargetPointsRef.current = points;
      instagramProgressRef.current = 1; 
    }
  }));

  // helper to sample SVG path
  function sampleSvgPath(d, count) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const pathEl = document.createElementNS(svgNS, 'path');
    pathEl.setAttribute('d', d);
    const length = pathEl.getTotalLength();
    const pts = [];
    for (let i = 0; i < count; i++) {
      const pt = pathEl.getPointAtLength((i / count) * length);
      pts.push({ x: pt.x, y: pt.y });
    }
    return pts;
  }

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const rotationRef = useRef({ x: 0.18, y: 0, vx: 0, vy: 0.0035 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: -9999, y: -9999, active: false, radius: 140 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    const fov = 480;

    // 1. Generate Surface Particles (Spherical Fibonacci with continental harmonic density)
    const surfaceParticles = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < SURFACE_PARTICLES; i++) {
      const y = 1 - (i / (SURFACE_PARTICLES - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;

      const lat = Math.asin(y);
      const lon = theta % (Math.PI * 2);

      const harmonic =
        Math.sin(2 * lon + 0.4) * Math.cos(2.5 * lat) +
        0.55 * Math.sin(4 * lon - 1.2) * Math.sin(3 * lat + 0.3) +
        0.35 * Math.cos(3 * lon + 1.8) * Math.cos(5 * lat) +
        0.25 * Math.sin(6 * lon) * Math.sin(6 * lat);

      const isContinentCluster = harmonic > 0.08;
      const isHighDenseGold = harmonic > 0.55;
      const isWhiteHighlight = Math.random() < 0.08;

      let rgb;
      let pSize;
      let baseAlpha;

      if (isHighDenseGold) {
        rgb = Math.random() < 0.65 ? COLORS.warmGold : COLORS.warmOrange;
        pSize = Math.random() * 2.2 + 1.2;
        baseAlpha = Math.random() * 0.35 + 0.65;
      } else if (isContinentCluster) {
        if (Math.random() < 0.22) {
          rgb = COLORS.warmGold;
          pSize = Math.random() * 1.8 + 1.0;
        } else {
          rgb = Math.random() < 0.5 ? COLORS.cyan : COLORS.electricBlue;
          pSize = Math.random() * 1.8 + 0.9;
        }
        baseAlpha = Math.random() * 0.35 + 0.55;
      } else {
        rgb = Math.random() < 0.7 ? COLORS.electricBlue : COLORS.cyan;
        pSize = Math.random() * 1.4 + 0.6;
        baseAlpha = Math.random() * 0.3 + 0.4;
      }

      if (isWhiteHighlight) {
        rgb = COLORS.softWhite;
        pSize = Math.random() * 2.5 + 1.5;
        baseAlpha = Math.random() * 0.2 + 0.8;
      }

      const rOffset = (Math.random() - 0.5) * 6;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      surfaceParticles.push({
          baseX: x,
          baseY: y,
          baseZ: z,
          rOffset,
          rgb,
          size: pSize,
          baseAlpha,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.04 + 0.02,
          driftPhase: Math.random() * Math.PI * 2,
          driftSpeed: Math.random() * 0.02 + 0.01,
          dispX: 0, dispY: 0, dispZ: 0,
          vx: 0, vy: 0, vz: 0,
          scatterX: (Math.random() - 0.5) * width * 2,
          scatterY: (Math.random() - 0.5) * height * 2,
          scatterZ: (Math.random() - 0.5) * 500
        });
    }

    let time = 0;

    // Main Render Loop
    const render = () => {
      time += 0.016;
      let gProg = gatherProgressRef.current;
      if (phase === 'gathering') gProg = Math.min(1, gProg + 0.01);
      gatherProgressRef.current = gProg;

      if (!isDraggingRef.current) {
        rotationRef.current.y += rotationRef.current.vy;
        rotationRef.current.x += (0.18 + Math.sin(time * 0.4) * 0.06 - rotationRef.current.x) * 0.02;
      }

      const rotX = rotationRef.current.x;
      const rotY = rotationRef.current.y;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      ctx.clearRect(0, 0, width, height);

      const breathScale = 1 + Math.sin(time * 1.4) * 0.015;
      const currentRadius = baseRadius * breathScale;
      const projectedSurface = [];
      const mouse = mouseRef.current;

      for (let i = 0; i < surfaceParticles.length; i++) {
          const p = surfaceParticles[i];
          const drift = Math.sin(time * p.driftSpeed * 60 + p.driftPhase) * 2.2;
          const r = currentRadius + p.rOffset + drift;

          const gx = p.baseX * r;
          const gy = p.baseY * r;
          const gz = p.baseZ * r;

          let curX = gx, curY = gy, curZ = gz;

          if (phase === 'dispersing') {
            curX = p.scatterX; curY = p.scatterY; curZ = p.scatterZ;
          } else if (phase === 'gathering' && targetPointsRef.current.length) {
            const tgt = targetPointsRef.current[i % targetPointsRef.current.length];
            const lerp = Math.min(1, (time - targetProgressRef.current) * 0.4);
            curX = gx * (1 - lerp) + (tgt.x - centerX) * lerp;
            curY = gy * (1 - lerp) + (tgt.y - centerY) * lerp;
            curZ = gz;
          }

          const rotBlend = Math.min(1, gProg * 1.2);
          const curBaseX = gx * gProg + (p.scatterX) * (1 - gProg);
          const curBaseY = gy * gProg + (p.scatterY) * (1 - gProg);
          const curBaseZ = gz * gProg + p.scatterZ * (1 - gProg);

          if (instagramProgressRef.current > 0) {
             const ip = instagramProgressRef.current;
             const instaTgt = instagramTargetPointsRef.current[i % instagramTargetPointsRef.current.length];
             const lerp = ip;
             const offset = instagramOffsetRef.current;
             const instaX = ((instaTgt.x + offset.x) - centerX) * lerp;
             const instaY = ((instaTgt.y + offset.y) - centerY) * lerp;
             const instaZ = 0;
             const blendX = curBaseX * (1 - ip) + instaX;
             const blendY = curBaseY * (1 - ip) + instaY;
             const blendZ = curBaseZ * (1 - ip) + instaZ;
             const x1 = blendX * cosY + blendZ * sinY;
             const z1 = -blendX * sinY + blendZ * cosY;
             const y2 = blendY * cosX - z1 * sinX;
             const z2 = blendY * sinX + z1 * cosX;
             const scale = fov / (fov + z2 + p.dispZ);
             const projX = centerX + (blendX + p.dispX) * scale;
             const projY = centerY + (blendY + p.dispY) * scale;
             projectedSurface.push({ x: projX, y: projY, z: z2 + p.dispZ, size: Math.max(0.5, p.size * Math.min(scale, 1.4) * (0.8 + (z2 + 1) * 0.25)), alpha: p.baseAlpha, rgb: p.rgb, frontFacing: true });
             continue;
          }

          const curCosY = Math.cos(rotY * rotBlend);
          const curSinY = Math.sin(rotY * rotBlend);
          const curCosX = Math.cos(rotX * rotBlend);
          const curSinX = Math.sin(rotX * rotBlend);

          const x1 = curX * curCosY + curZ * curSinY;
          const z1 = -curX * curSinY + curZ * curCosY;
          const y2 = curY * curCosX - z1 * curSinX;
          const z2 = curY * curSinX + z1 * curCosX;
          const x2 = x1;

          const scale = fov / (fov + z2 + p.dispZ);
          const projX = centerX + (x2 + p.dispX) * scale;
          const projY = centerY + (y2 + p.dispY) * scale;

          if (gProg > 0.5 && mouse.active) {
            const dx = projX - mouse.x;
            const dy = projY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius && dist > 0) {
              const force = (1 - dist / mouse.radius) * 32 * gProg;
              p.vx += (dx / dist) * force * 0.35;
              p.vy += (dy / dist) * force * 0.35;
              p.vz += force * 0.2;
            }
          }

          p.vx += -0.12 * p.dispX; p.vy += -0.12 * p.dispY; p.vz += -0.12 * p.dispZ;
          p.vx *= 0.82; p.vy *= 0.82; p.vz *= 0.82;
          p.dispX += p.vx; p.dispY += p.vy; p.dispZ += p.vz;

          const depthNorm = z2 / currentRadius;
          const rimAngle = Math.max(0, 1 - Math.abs(depthNorm));
          const twinkle = Math.sin(time * p.twinkleSpeed * 60 + p.twinklePhase) * 0.25 + 0.75;
          let alpha = p.baseAlpha * twinkle;

          if (gProg > 0.5) {
            alpha *= (depthNorm < 0 ? Math.max(0.12, 0.45 + depthNorm * 0.4) : 0.85 + depthNorm * 0.45 + rimAngle * 0.2);
          }
          alpha = Math.min(1.0, Math.max(0.06, alpha * (0.4 + gProg * 0.6)));

          projectedSurface.push({
            x: projX, y: projY, z: z2 + p.dispZ, size: Math.max(0.5, p.size * Math.min(scale, 1.4) * (0.8 + (depthNorm + 1) * 0.25)),
            alpha, rgb: p.rgb, frontFacing: depthNorm > -0.15
          });
      }

      projectedSurface.sort((a, b) => a.z - b.z);
      for (let p of projectedSurface) {
        ctx.fillStyle = `rgba(${p.rgb[0]}, ${p.rgb[1]}, ${p.rgb[2]}, ${p.alpha})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [width, height, baseRadius, interactive]);

  const handleMouseDown = (e) => {
    if (gatherProgressRef.current < 0.75) return;
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    }

    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;

    rotationRef.current.y += dx * 0.005;
    rotationRef.current.x = Math.max(-0.6, Math.min(0.6, rotationRef.current.x - dy * 0.005));

    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    mouseRef.current.active = false;
  };

  return (
    <div
      ref={containerRef}
      className={`star-particle-globe-container ${className}`}
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        cursor: 'grab'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef}
        className="star-particle-globe-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />
      {children}
    </div>
  );
}
