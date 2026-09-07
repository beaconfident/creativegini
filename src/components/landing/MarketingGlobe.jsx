import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MARKETING_PLATFORMS } from '../../data/marketingPlatforms';
import {
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
  Search,
  Share2,
  Globe,
  Radio,
  Send,
  MessageCircle,
  Flame,
  Zap,
  Sparkles
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const SURFACE_PARTICLES = 2800;
const ORBIT_PARTICLES = 140;
const ESCAPING_PARTICLES = 80;
const BG_STARS = 320;

const COLORS = {
  electricBlue: [0, 174, 239],
  cyan: [0, 235, 255],
  warmGold: [255, 185, 20],
  warmOrange: [255, 130, 20],
  softWhite: [250, 250, 255]
};

export default function MarketingGlobe({ activePlatform, onSelectPlatform }) {
  const globeRef = useRef(null);
  // Instagram SVG path (simplified placeholder). Replace with exact path if needed.
  const instagramPath = "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.3 2.3.5.5.2.9.5 1.3.9.4.4.7.8.9 1.3.2.4.4 1.1.5 2.3.1 1.3.1 1.7.1 4.9.1s3.6 0 4.9-.1c1.2-.1 1.9-.3 2.3-.5.5-.2.9-.5 1.3-.9.4-.4.7-.8.9-1.3.2-.4.4-1.1.5-2.3.1-1.3.1-1.7.1-4.9s0-3.6-.1-4.9c-.1-1.2-.3-1.9-.5-2.3-.2-.5-.5-.9-.9-1.3-.4-.4-.8-.7-1.3-.9-.4-.2-1.1-.4-2.3-.5-1.3-.1-1.7-.1-4.9-.1z";

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPerc = docHeight ? scrollY / docHeight : 0;

      // Define thresholds: 0.3 start disperse, 0.6 fully form Instagram
      const start = 0.3;
      const end = 0.6;

      if (globeRef.current) {
        if (scrollPerc >= start && scrollPerc < end) {
          // ensure transition initialized once
          if (!globeRef.current._instagramInitialized) {
            globeRef.current.triggerInstagramTransition(instagramPath);
            globeRef.current._instagramInitialized = true;
          }
          const progress = (scrollPerc - start) / (end - start);
          globeRef.current.setInstagramProgress(progress);
        } else if (scrollPerc >= end) {
          globeRef.current.setInstagramProgress(1);
        } else {
          globeRef.current.setInstagramProgress(0);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const nodeElementsRef = useRef([]);
  const hintRef = useRef(null);
  const rotationRef = useRef({ x: 0.18, y: 0, vx: 0, vy: 0.0035 });
  const isHoveredRef = useRef(false);
  const hoveredNodeIdRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: -9999, y: -9999, active: false, radius: 140 });
  const animFrameRef = useRef(null);
  const nodes3DRef = useRef([]);

  // Scroll gathering progression state (0 = scattered stars in deep space, 1 = fully formed 3D globe)
  const gatherProgressRef = useRef(0);
  const targetGatherProgressRef = useRef(0);

  // Compute platform node spherical coordinates
  useEffect(() => {
    const total = MARKETING_PLATFORMS.length;
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    const radius = 220;

    nodes3DRef.current = MARKETING_PLATFORMS.map((platform, i) => {
      const y = 1 - (i / (total - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      return {
        ...platform,
        baseX: x * radius,
        baseY: y * radius,
        baseZ: z * radius
      };
    });
  }, []);

  // Update hovered platform ref
  useEffect(() => {
    hoveredNodeIdRef.current = activePlatform?.id || null;
  }, [activePlatform]);

  // Scroll listener to migrate Screen 1 stars and assemble globe on Screen 2
  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const section = el.closest('.marketing-channels-section') || el;
      const rect = section.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Distance from top of document (Screen 1)
      const scrollY = window.scrollY || window.pageYOffset;
      const sectionTop = section.offsetTop;

      // Start star migration when user begins scrolling down from Screen 1 (scrollY > 15px)
      // Fully assembled Globe when Screen 2 comes into full focus
      const startGather = 15;
      const endGather = sectionTop - windowH * 0.25;

      let progress = 0;
      if (scrollY <= startGather) {
        progress = 0;
      } else if (scrollY >= endGather) {
        progress = 1;
      } else {
        progress = (scrollY - startGather) / (endGather - startGather);
      }

      targetGatherProgressRef.current = progress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Main 3D Star-Particle Globe Animation & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = 640);
    const height = (canvas.height = 640);
    const centerX = width / 2;
    const centerY = height / 2;
    const fov = 480;
    const baseRadius = 210;

    // 1. Generate Surface Particles with Scattered Origins in Screen 1 Space
    const surfaceParticles = [];
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < SURFACE_PARTICLES; i++) {
      const y = 1 - (i / (SURFACE_PARTICLES - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;

      const lat = Math.asin(y);
      const lon = theta % (Math.PI * 2);

      // Multi-frequency spherical harmonics for Earth-like starlight continental clustering
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
        pSize = Math.random() * 2.0 + 1.1;
        baseAlpha = Math.random() * 0.35 + 0.65;
      } else if (isContinentCluster) {
        if (Math.random() < 0.22) {
          rgb = COLORS.warmGold;
          pSize = Math.random() * 1.6 + 0.9;
        } else {
          rgb = Math.random() < 0.5 ? COLORS.cyan : COLORS.electricBlue;
          pSize = Math.random() * 1.6 + 0.8;
        }
        baseAlpha = Math.random() * 0.35 + 0.55;
      } else {
        rgb = Math.random() < 0.7 ? COLORS.electricBlue : COLORS.cyan;
        pSize = Math.random() * 1.3 + 0.6;
        baseAlpha = Math.random() * 0.3 + 0.4;
      }

      if (isWhiteHighlight) {
        rgb = COLORS.softWhite;
        pSize = Math.random() * 2.2 + 1.3;
        baseAlpha = Math.random() * 0.2 + 0.8;
      }

      const rOffset = (Math.random() - 0.5) * 6;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Dispersed origin up in Screen 1 viewport space
      const scatterAngle = Math.random() * Math.PI * 2;
      const scatterDist = 380 + Math.random() * 950;
      const scatterX = (Math.random() - 0.5) * 1400;
      const scatterY = -550 - Math.random() * 750; // Positioned high up in Screen 1!
      const scatterZ = -300 + Math.random() * 1100;
      const swirlPhase = Math.random() * Math.PI * 2;

      surfaceParticles.push({
        baseX: x,
        baseY: y,
        baseZ: z,
        scatterX,
        scatterY,
        scatterZ,
        scatterDist,
        swirlPhase,
        rOffset,
        rgb,
        size: pSize,
        baseAlpha,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.04 + 0.02,
        driftPhase: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.02 + 0.01,
        dispX: 0,
        dispY: 0,
        dispZ: 0,
        vx: 0,
        vy: 0,
        vz: 0
      });
    }

    // 2. Orbiting Particles
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
        size: Math.random() * 1.6 + 0.7,
        rgb,
        alpha: Math.random() * 0.4 + 0.4,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }

    // 3. Escaping & Returning Dust Particles
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
        size: Math.random() * 1.5 + 0.7,
        rgb,
        alpha: Math.random() * 0.5 + 0.3
      });
    }

    // 4. Background Deep Space Stars
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
        size: isBright ? Math.random() * 1.6 + 0.9 : Math.random() * 0.9 + 0.4,
        rgb,
        baseAlpha: isBright ? Math.random() * 0.4 + 0.4 : Math.random() * 0.25 + 0.15,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }

    let time = 0;

    const render = () => {
      time += 0.016;

      // Smoothly interpolate scroll gathering progress (0.0 = deep space stars, 1.0 = assembled globe)
      gatherProgressRef.current += (targetGatherProgressRef.current - gatherProgressRef.current) * 0.08;
      const gProg = Math.max(0, Math.min(1, gatherProgressRef.current));

      // Rotation inertia
      const rotSpeed = isHoveredRef.current ? 0.0015 : 0.0035;
      if (!isDraggingRef.current) {
        rotationRef.current.y += rotSpeed;
        rotationRef.current.x += (0.18 + Math.sin(time * 0.4) * 0.05 - rotationRef.current.x) * 0.02;
      }

      const rotX = rotationRef.current.x;
      const rotY = rotationRef.current.y;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      ctx.clearRect(0, 0, width, height);

      // 1. Subtle Cosmic Atmosphere Glow (ONLY fades in as globe finishes assembling from stars)
      if (gProg > 0.65) {
        const atmosphereAlpha = (gProg - 0.65) / 0.35;
        const globeGlowRad = baseRadius * 1.35 * Math.min(1, gProg * 1.15);
        const atmosphereGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          baseRadius * 0.2,
          centerX,
          centerY,
          globeGlowRad
        );
        atmosphereGrad.addColorStop(0, `rgba(0, 174, 239, ${(0.18 * atmosphereAlpha).toFixed(3)})`);
        atmosphereGrad.addColorStop(0.45, `rgba(0, 217, 255, ${(0.09 * atmosphereAlpha).toFixed(3)})`);
        atmosphereGrad.addColorStop(0.75, `rgba(255, 176, 0, ${(0.03 * atmosphereAlpha).toFixed(3)})`);
        atmosphereGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = atmosphereGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, globeGlowRad, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Background Stars (only fade in as Screen 1 stars migrate down to Screen 2)
      if (gProg > 0.3) {
        const bgFade = (gProg - 0.3) / 0.7;
        for (let i = 0; i < bgStars.length; i++) {
          const star = bgStars[i];
          const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.twinklePhase) * 0.35 + 0.65;
          const currentAlpha = star.baseAlpha * twinkle * bgFade;

          const screenX = centerX + star.x;
          const screenY = centerY + star.y;

          if (screenX >= 0 && screenX <= width && screenY >= 0 && screenY <= height) {
            ctx.fillStyle = `rgba(${star.rgb[0]}, ${star.rgb[1]}, ${star.rgb[2]}, ${currentAlpha})`;
            ctx.beginPath();
            ctx.arc(screenX, screenY, star.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Breathing Sphere Scale
      const breathScale = 1 + Math.sin(time * 1.4) * 0.015;
      const currentRadius = baseRadius * breathScale;

      // 3. Process & Gather Surface Particles into 3D Globe
      const projectedSurface = [];
      const mouse = mouseRef.current;

      for (let i = 0; i < surfaceParticles.length; i++) {
        const p = surfaceParticles[i];

        const drift = Math.sin(time * p.driftSpeed * 60 + p.driftPhase) * 2.2;
        const r = currentRadius + p.rOffset + drift;

        // Target spherical coordinate
        const gx = p.baseX * r;
        const gy = p.baseY * r;
        const gz = p.baseZ * r;

        // Spiral swirling gathering math from deep space starfield into sphere
        const swirlAngle = (1 - gProg) * Math.PI * 3.5 + p.swirlPhase;
        const swirlR = (1 - gProg) * p.scatterDist;

        const curBaseX = gx * gProg + (p.scatterX + Math.cos(swirlAngle) * swirlR) * (1 - gProg);
        const curBaseY = gy * gProg + (p.scatterY + Math.sin(swirlAngle) * swirlR * 0.65) * (1 - gProg);
        const curBaseZ = gz * gProg + p.scatterZ * (1 - gProg);

        // Apply 3D Rotation (only rotates once forming)
        const rotBlend = Math.min(1, gProg * 1.2);
        const curCosY = Math.cos(rotY * rotBlend);
        const curSinY = Math.sin(rotY * rotBlend);
        const curCosX = Math.cos(rotX * rotBlend);
        const curSinX = Math.sin(rotX * rotBlend);

        const x1 = curBaseX * curCosY + curBaseZ * curSinY;
        const z1 = -curBaseX * curSinY + curBaseZ * curCosY;

        const y2 = curBaseY * curCosX - z1 * curSinX;
        const z2 = curBaseY * curSinX + z1 * curCosX;
        const x2 = x1;

        const scale = fov / (fov + z2 + p.dispZ);
        const projX = centerX + (x2 + p.dispX) * scale;
        const projY = centerY + (y2 + p.dispY) * scale;

        // Interactive cursor physics when globe is formed
        if (gProg > 0.5 && mouse.active) {
          const dx = projX - mouse.x;
          const dy = projY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius && dist > 0) {
            const force = (1 - dist / mouse.radius) * 32 * gProg;
            const nx = dx / dist;
            const ny = dy / dist;

            p.vx += nx * force * 0.35;
            p.vy += ny * force * 0.35;
            p.vz += force * 0.2;
          }
        }

        p.vx += -0.12 * p.dispX;
        p.vy += -0.12 * p.dispY;
        p.vz += -0.12 * p.dispZ;

        p.vx *= 0.82;
        p.vy *= 0.82;
        p.vz *= 0.82;

        p.dispX += p.vx;
        p.dispY += p.vy;
        p.dispZ += p.vz;

        const depthNorm = z2 / currentRadius;
        const rimAngle = Math.max(0, 1 - Math.abs(depthNorm));
        const frontFacing = depthNorm > -0.15;

        const twinkle = Math.sin(time * p.twinkleSpeed * 60 + p.twinklePhase) * 0.25 + 0.75;
        let alpha = p.baseAlpha * twinkle;

        if (gProg > 0.5) {
          if (depthNorm < 0) {
            alpha *= Math.max(0.12, 0.45 + depthNorm * 0.4);
          } else {
            alpha *= 0.85 + depthNorm * 0.45 + rimAngle * 0.2;
          }
        }

        alpha = Math.min(1.0, Math.max(0.06, alpha * (0.4 + gProg * 0.6)));
        const renderedSize = Math.max(0.5, p.size * Math.min(scale, 1.4) * (0.8 + (depthNorm + 1) * 0.25));

        projectedSurface.push({
          x: projX,
          y: projY,
          z: z2 + p.dispZ,
          size: renderedSize,
          alpha,
          rgb: p.rgb,
          frontFacing
        });
      }

      projectedSurface.sort((a, b) => a.z - b.z);

      // Draw surface stars
      for (let i = 0; i < projectedSurface.length; i++) {
        const p = projectedSurface[i];
        if (p.x < -30 || p.x > width + 30 || p.y < -30 || p.y > height + 30) continue;

        ctx.fillStyle = `rgba(${p.rgb[0]}, ${p.rgb[1]}, ${p.rgb[2]}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.frontFacing && p.size > 1.6 && p.alpha > 0.6) {
          ctx.fillStyle = `rgba(${p.rgb[0]}, ${p.rgb[1]}, ${p.rgb[2]}, ${(p.alpha * 0.2).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Orbiting Particles (assemble into orbit)
      if (gProg > 0.4) {
        const orbitAlphaMult = (gProg - 0.4) / 0.6;
        for (let i = 0; i < orbitParticles.length; i++) {
          const op = orbitParticles[i];
          op.angle += op.orbitSpeed;

          const ox = Math.cos(op.angle) * op.distance * gProg;
          const oz = Math.sin(op.angle) * op.distance * gProg;
          const oy = (op.ySpread + Math.sin(op.angle) * op.tiltAngle * 40) * gProg;

          const rx1 = ox * cosY + oz * sinY;
          const rz1 = -ox * sinY + oz * cosY;
          const ry2 = oy * cosX - rz1 * sinX;
          const rz2 = oy * sinX + rz1 * cosX;

          const scale = fov / (fov + rz2);
          const sx = centerX + rx1 * scale;
          const sy = centerY + ry2 * scale;

          const depthNorm = rz2 / op.distance;
          const alpha = Math.max(0.08, op.alpha * (0.6 + (depthNorm + 1) * 0.3) * orbitAlphaMult);

          ctx.fillStyle = `rgba(${op.rgb[0]}, ${op.rgb[1]}, ${op.rgb[2]}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, op.size * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Escaping Dust Particles (emerge once globe is formed)
      if (gProg > 0.7) {
        const escapeAlphaMult = (gProg - 0.7) / 0.3;
        for (let i = 0; i < escapingParticles.length; i++) {
          const ep = escapingParticles[i];
          const cycle = (Math.sin(time * ep.speed * 60 + ep.cycleOffset) + 1) / 2;
          const currentDist = baseRadius + cycle * (ep.maxDist - baseRadius);

          const ex = ep.dirX * currentDist;
          const ey = ep.dirY * currentDist;
          const ez = ep.dirZ * currentDist;

          const rx1 = ex * cosY + ez * sinY;
          const rz1 = -ex * sinY + ez * cosY;
          const ry2 = ey * cosX - rz1 * sinX;
          const rz2 = ey * sinX + rz1 * cosX;

          const scale = fov / (fov + rz2);
          const sx = centerX + rx1 * scale;
          const sy = centerY + ry2 * scale;

          const alpha = ep.alpha * (1 - cycle * 0.65) * escapeAlphaMult;

          ctx.fillStyle = `rgba(${ep.rgb[0]}, ${ep.rgb[1]}, ${ep.rgb[2]}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, ep.size * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 6. Platform Node Constellations (ONLY appear AFTER stars have assembled into the 3D globe: gProg >= 0.85)
      const iconProgress = Math.max(0, Math.min(1, (gProg - 0.85) / 0.15));
      const projectedList = [];
      const nodesData = nodes3DRef.current;

      for (let i = 0; i < nodesData.length; i++) {
        const node = nodesData[i];

        const x1 = node.baseX * cosY + node.baseZ * sinY;
        const z1 = -node.baseX * sinY + node.baseZ * cosY;

        const y2 = node.baseY * cosX - z1 * sinX;
        const z2 = node.baseY * sinX + z1 * cosX;
        const x2 = x1;

        const isHovered = node.id === hoveredNodeIdRef.current;
        const hoverZOffset = isHovered ? 40 : 0;
        const finalZ = z2 + hoverZOffset;

        const scale = (fov / (fov + finalZ));
        const x2d = centerX + x2 * scale;
        const y2d = centerY + y2 * scale;

        const depthNorm = (finalZ + baseRadius) / (baseRadius * 2);
        const alpha = isHovered ? 1.0 : Math.max(0.28, Math.min(1.0, 1.0 - (1 - depthNorm) * 0.65));

        projectedList.push({ x2d, y2d, z: finalZ, alpha, isHovered });

        const domEl = nodeElementsRef.current[i];
        if (domEl) {
          if (iconProgress <= 0.001) {
            domEl.style.opacity = '0';
            domEl.style.pointerEvents = 'none';
            domEl.style.transform = `translate3d(${x2d}px, ${y2d}px, 0) translate(-50%, -50%) scale(0)`;
          } else {
            const easePop = Math.sin(iconProgress * Math.PI * 0.5);
            const finalScale = scale * (isHovered ? 1.25 : 1) * easePop;
            const finalAlpha = alpha * iconProgress;

            domEl.style.opacity = `${finalAlpha}`;
            domEl.style.pointerEvents = iconProgress > 0.75 ? 'auto' : 'none';
            domEl.style.zIndex = isHovered ? '999' : `${Math.floor(finalZ + 300)}`;
            domEl.style.transform = `translate3d(${x2d}px, ${y2d}px, 0) translate(-50%, -50%) scale(${finalScale})`;

            if (isHovered) {
              domEl.classList.add('node-selected');
            } else {
              domEl.classList.remove('node-selected');
            }
          }
        }
      }

      // Update interaction hint visibility
      if (hintRef.current) {
        hintRef.current.style.opacity = `${iconProgress > 0.7 ? (iconProgress - 0.7) / 0.3 : 0}`;
      }

      // 7. Subtle constellation dust connections
      if (iconProgress > 0.5) {
        ctx.save();
        for (let i = 0; i < projectedList.length; i++) {
          for (let j = i + 1; j < projectedList.length; j++) {
            const n1 = projectedList[i];
            const n2 = projectedList[j];
            const dx = n1.x2d - n2.x2d;
            const dy = n1.y2d - n2.y2d;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 140 && n1.z > -80 && n2.z > -80) {
              const lineAlpha = (1 - dist / 140) * 0.15 * ((n1.alpha + n2.alpha) / 2) * iconProgress;
              ctx.beginPath();
              ctx.moveTo(n1.x2d, n1.y2d);
              ctx.lineTo(n2.x2d, n2.y2d);
              ctx.strokeStyle = n1.isHovered || n2.isHovered ? 'rgba(0, 217, 255, 0.5)' : `rgba(0, 174, 239, ${lineAlpha})`;
              ctx.lineWidth = n1.isHovered || n2.isHovered ? 1.5 : 0.8;
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Mouse Drag Controller
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

    if (!isDraggingRef.current || gatherProgressRef.current < 0.75) return;
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
    isHoveredRef.current = false;
    mouseRef.current.active = false;
  };

  return (
    <div
      ref={containerRef}
      className="marketing-globe-wrapper"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Star-Particle Globe Canvas */}
      <canvas ref={canvasRef} className="globe-canvas" width={640} height={640} />

      {/* Interactive Platform HTML Nodes (revealed after stars form the globe) */}
      <div className="globe-nodes-layer">
        {MARKETING_PLATFORMS.map((platform, idx) => {
          const isSelected = activePlatform?.id === platform.id;

          return (
            <div
              key={platform.id}
              ref={(el) => (nodeElementsRef.current[idx] = el)}
              className={`globe-platform-node ${isSelected ? 'node-selected' : ''}`}
              style={{
                '--node-accent': platform.accentColor,
                opacity: 0,
                transform: 'scale(0)',
                pointerEvents: 'none',
                transition: 'opacity 0.3s ease, transform 0.3s ease'
              }}
              onMouseEnter={() => {
                isHoveredRef.current = true;
                onSelectPlatform(platform);
              }}
              onClick={() => onSelectPlatform(platform)}
              onTouchStart={() => {
                isHoveredRef.current = true;
                onSelectPlatform(platform);
              }}
            >
              {/* Node Badge */}
              <div
                className="node-icon-circle official-logo-circle"
                style={{
                  background: 'rgba(6, 17, 26, 0.92)',
                  borderColor: isSelected ? platform.accentColor : 'rgba(0, 217, 255, 0.35)',
                  boxShadow: isSelected ? `0 0 20px ${platform.accentColor}` : '0 0 10px rgba(0, 174, 239, 0.2)'
                }}
              >
                <img
                  src={platform.logo}
                  alt={platform.name}
                  className="official-platform-logo-img"
                  loading="eager"
                  draggable={false}
                />
              </div>

              {/* Node Label Tooltip */}
              <div
                className={`node-label-pill ${isSelected ? 'pill-visible' : ''}`}
                style={{
                  background: 'rgba(6, 17, 26, 0.95)',
                  borderColor: isSelected ? platform.accentColor : 'rgba(0, 217, 255, 0.3)',
                  color: '#FFFFFF'
                }}
              >
                <span className="node-platform-name">{platform.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drag & Rotation Guide Hint */}
      <div ref={hintRef} className="globe-interaction-hint" style={{ opacity: 0, transition: 'opacity 0.4s ease' }}>
        <Sparkles size={13} />
        <span>Drag to rotate • Move cursor near particles to interact</span>
      </div>
    </div>
  );
}
