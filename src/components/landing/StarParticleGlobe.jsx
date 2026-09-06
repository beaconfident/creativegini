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
  const targetPointsRef = React.useRef([]);
  const targetProgressRef = React.useRef(0);
  // expose method to parent
  React.useImperativeHandle(ref, () => ({
    triggerTransition: (svgPath) => {
      // sample SVG path into points
      const points = sampleSvgPath(svgPath, SURFACE_PARTICLES);
      targetPointsRef.current = points;
      setPhase('dispersing');
      // after dispersing duration, start gathering
      setTimeout(() => setPhase('gathering'), 2000);
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

  // existing code continues...

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

      // Continental density & color clustering using multi-frequency spherical harmonics
      const lat = Math.asin(y); // -PI/2 to PI/2
      const lon = theta % (Math.PI * 2);

      // Spherical harmonic noise approximation for Earth-like continent starlight clusters
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
        // Warm Gold / Orange starlight cluster
        rgb = Math.random() < 0.65 ? COLORS.warmGold : COLORS.warmOrange;
        pSize = Math.random() * 2.2 + 1.2;
        baseAlpha = Math.random() * 0.35 + 0.65;
      } else if (isContinentCluster) {
        // Cyan / Electric Blue with occasional Gold specks
        if (Math.random() < 0.22) {
          rgb = COLORS.warmGold;
          pSize = Math.random() * 1.8 + 1.0;
        } else {
          rgb = Math.random() < 0.5 ? COLORS.cyan : COLORS.electricBlue;
          pSize = Math.random() * 1.8 + 0.9;
        }
        baseAlpha = Math.random() * 0.35 + 0.55;
      } else {
        // Oceanic cosmic void (dominant electric blue & cyan, spaced out)
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
          // Interactive displacement physics
          dispX: 0,
          dispY: 0,
          dispZ: 0,
          vx: 0,
          vy: 0,
          vz: 0,
          // Custom target for gathering phase (populated later)
          targetX: null,
          targetY: null,
          targetZ: null,
          scatterX: (Math.random() - 0.5) * width * 2,
          scatterY: (Math.random() - 0.5) * height * 2,
          scatterZ: (Math.random() - 0.5) * 500
        });
    }

    // 2. Generate Orbiting Particles (Tilted cosmic rings)
    const orbitParticles = [];
    for (let i = 0; i < ORBIT_PARTICLES; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = baseRadius * (1.12 + Math.random() * 0.38);
      const orbitSpeed = (Math.random() * 0.008 + 0.004) * (Math.random() < 0.5 ? 1 : -1);
      const tiltAngle = (Math.random() - 0.5) * 0.8;
      const rgb = Math.random() < 0.5 ? COLORS.cyan : (Math.random() < 0.7 ? COLORS.warmGold : COLORS.softWhite);

      orbitParticles.push({
        angle,
        distance,
        orbitSpeed,
        tiltAngle,
        ySpread: (Math.random() - 0.5) * 35,
        size: Math.random() * 1.8 + 0.8,
        rgb,
        alpha: Math.random() * 0.4 + 0.4,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }

    // 3. Generate Escaping & Returning Dust Particles
    const escapingParticles = [];
    for (let i = 0; i < ESCAPING_PARTICLES; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phiAngle = Math.acos(Math.random() * 2 - 1);
      const rgb = Math.random() < 0.6 ? COLORS.cyan : COLORS.warmGold;

      escapingParticles.push({
        dirX: Math.sin(phiAngle) * Math.cos(theta),
        dirY: Math.cos(phiAngle),
        dirZ: Math.sin(phiAngle) * Math.sin(theta),
        cycleOffset: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.015 + 0.008,
        maxDist: baseRadius * (1.3 + Math.random() * 0.45),
        size: Math.random() * 1.6 + 0.8,
        rgb,
        alpha: Math.random() * 0.5 + 0.3
      });
    }

    // 4. Generate Background Deep Space Stars
    const bgStars = [];
    for (let i = 0; i < BG_STARS; i++) {
      const sx = (Math.random() - 0.5) * width * 1.4;
      const sy = (Math.random() - 0.5) * height * 1.4;
      const sz = Math.random() * 400 + 100;
      const isBright = Math.random() < 0.12;
      const rgb = isBright
        ? (Math.random() < 0.5 ? COLORS.softWhite : COLORS.cyan)
        : [140, 180, 220];

      bgStars.push({
        x: sx,
        y: sy,
        z: sz,
        size: isBright ? Math.random() * 1.8 + 1.0 : Math.random() * 1.0 + 0.4,
        rgb,
        baseAlpha: isBright ? Math.random() * 0.4 + 0.4 : Math.random() * 0.25 + 0.15,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2
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

      const globeGlowRad = baseRadius * 1.35;
      const atmosphereGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.2,
        centerX,
        centerY,
        globeGlowRad
      );
      atmosphereGrad.addColorStop(0, 'rgba(0, 174, 239, 0.18)');
      atmosphereGrad.addColorStop(0.45, 'rgba(0, 217, 255, 0.09)');
      atmosphereGrad.addColorStop(0.75, 'rgba(255, 176, 0, 0.03)');
      atmosphereGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = atmosphereGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeGlowRad, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < bgStars.length; i++) {
        const star = bgStars[i];
        const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.twinklePhase) * 0.35 + 0.65;
        const currentAlpha = star.baseAlpha * twinkle;
        const screenX = centerX + star.x;
        const screenY = centerY + star.y;
        if (screenX >= 0 && screenX <= width && screenY >= 0 && screenY <= height) {
          ctx.fillStyle = `rgba(${star.rgb[0]}, ${star.rgb[1]}, ${star.rgb[2]}, ${currentAlpha})`;
          ctx.beginPath();
          ctx.arc(screenX, screenY, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

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
