import React, { useEffect, useRef } from 'react';

/**
 * COSMIC GENIE PARTICLE UNIVERSE ENGINE
 * 
 * Continuous 3D Particle State Machine (4,200+ Particles)
 * Supporting 8 Scroll-Driven Scenes:
 *   Scene 1 (0.00): Cosmic Space & Multi-Layer Starfield
 *   Scene 2 (0.15): The Awakening (Forward Acceleration)
 *   Scene 3 (0.30): The Explosion (Cosmic Chaos & Radial Outward Blast)
 *   Scene 4 (0.45): The Formation (Convergence & Structure)
 *   Scene 5 (0.60): The 3D Genie Lamp (Golden, Orange, Blue, White glowing particles)
 *   Scene 6 (0.70): Lamp Dissolution & Spout Magical Dust Release
 *   Scene 7 (0.85): Magical Particle Waterfall & Energy Vortex
 *   Scene 8 (1.00): The 3D Cosmic Genie Entity (Cyan, Blue, Gold entity with swirling tail)
 * 
 * Interactive Cursor Physics:
 *   Gravitational Bubble & Magnifying Forcefield with attraction/repulsion springs.
 */

const PARTICLE_COUNT = 2400;

// Color Palette Constants
const COLOR_PALETTE = {
  deepBlack: [3, 3, 3],
  darkSpaceBlue: [6, 17, 26],
  electricBlue: [0, 174, 239],
  cyan: [0, 217, 255],
  goldenYellow: [255, 176, 0],
  warmOrange: [255, 138, 0],
  softWhite: [245, 245, 245],
};

export default function CosmicSpaceCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse & Cursor Bubble Physics
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      vx: 0,
      vy: 0,
      active: false,
      radius: 180,
      force: 0
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
      mouse.force = 1.0;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.targetX = width / 2;
      mouse.targetY = height / 2;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Scroll state tracking
    let scrollProgress = 0;
    let targetScrollProgress = 0;

    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetScrollProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // ==========================================
    // 3D PARAMETRIC MORPH TARGET GENERATOR
    // ==========================================

    // Allocate Particle Positions (x, y, z) for 8 distinct scenes
    const numScenes = 8;
    const targets = Array.from({ length: numScenes }, () => new Float32Array(PARTICLE_COUNT * 3));
    const targetColors = Array.from({ length: numScenes }, () => new Float32Array(PARTICLE_COUNT * 3));

    // Seeded random for reproducible beauty
    let seed = 42;
    function rnd() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }

    // --- SCENE 0: COSMIC STARFIELD (Text on LEFT -> Particle Cluster on RIGHT: +320) ---
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const layer = rnd();
      let depthSpan, spreadX, spreadY;
      let col;

      if (layer < 0.5) {
        depthSpan = 500 + rnd() * 1000;
        spreadX = 1400;
        spreadY = 1000;
        col = rnd() < 0.8 ? COLOR_PALETTE.softWhite : COLOR_PALETTE.electricBlue;
      } else if (layer < 0.85) {
        depthSpan = 100 + rnd() * 400;
        spreadX = 1000;
        spreadY = 750;
        col = rnd() < 0.6 ? COLOR_PALETTE.cyan : (rnd() < 0.85 ? COLOR_PALETTE.softWhite : COLOR_PALETTE.goldenYellow);
      } else {
        depthSpan = -200 + rnd() * 300;
        spreadX = 750;
        spreadY = 550;
        col = rnd() < 0.5 ? COLOR_PALETTE.goldenYellow : COLOR_PALETTE.warmOrange;
      }

      // Biased cluster towards the right to complement left-aligned text
      const biasX = rnd() < 0.65 ? 320 + (rnd() - 0.5) * 600 : (rnd() - 0.5) * spreadX * 2;
      targets[0][i3] = biasX;
      targets[0][i3 + 1] = (rnd() - 0.5) * spreadY * 2;
      targets[0][i3 + 2] = depthSpan;

      targetColors[0][i3] = col[0] / 255;
      targetColors[0][i3 + 1] = col[1] / 255;
      targetColors[0][i3 + 2] = col[2] / 255;
    }

    // --- SCENE 1: 3D STAR-PARTICLE GLOBE ON SECOND PAGE (Gathering Stars -> 3D Globe on RIGHT: +320) ---
    const phiAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const ratio = i / PARTICLE_COUNT;

      if (ratio < 0.90) {
        // Spherical surface particles with harmonic continental clustering
        const yNorm = 1 - (i / (PARTICLE_COUNT * 0.90 - 1)) * 2;
        const radiusAtY = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
        const theta = phiAngle * i;
        const lat = Math.asin(Math.max(-1, Math.min(1, yNorm)));
        const lon = theta % (Math.PI * 2);

        const harmonic =
          Math.sin(2 * lon + 0.4) * Math.cos(2.5 * lat) +
          0.55 * Math.sin(4 * lon - 1.2) * Math.sin(3 * lat + 0.3) +
          0.35 * Math.cos(3 * lon + 1.8) * Math.cos(5 * lat);

        const isGoldCluster = harmonic > 0.45;
        const isCyanCluster = harmonic > 0.05;
        const isWhite = rnd() < 0.08;

        const globR = 205 + (rnd() - 0.5) * 6;
        const gx = Math.cos(theta) * radiusAtY * globR;
        const gy = yNorm * globR;
        const gz = Math.sin(theta) * radiusAtY * globR;

        targets[1][i3] = 320 + gx;
        targets[1][i3 + 1] = gy;
        targets[1][i3 + 2] = gz;

        let col;
        if (isWhite) col = COLOR_PALETTE.softWhite;
        else if (isGoldCluster) col = rnd() < 0.65 ? COLOR_PALETTE.goldenYellow : COLOR_PALETTE.warmOrange;
        else if (isCyanCluster) col = rnd() < 0.6 ? COLOR_PALETTE.cyan : COLOR_PALETTE.electricBlue;
        else col = rnd() < 0.7 ? COLOR_PALETTE.electricBlue : COLOR_PALETTE.cyan;

        targetColors[1][i3] = col[0] / 255;
        targetColors[1][i3 + 1] = col[1] / 255;
        targetColors[1][i3 + 2] = col[2] / 255;
      } else {
        // Orbiting celestial starlight rings around the globe
        const orbAngle = rnd() * Math.PI * 2;
        const orbDist = 240 + rnd() * 60;
        targets[1][i3] = 320 + Math.cos(orbAngle) * orbDist;
        targets[1][i3 + 1] = (rnd() - 0.5) * 40 + Math.sin(orbAngle) * 30;
        targets[1][i3 + 2] = Math.sin(orbAngle) * orbDist;

        const col = rnd() < 0.5 ? COLOR_PALETTE.cyan : COLOR_PALETTE.goldenYellow;
        targetColors[1][i3] = col[0] / 255;
        targetColors[1][i3 + 1] = col[1] / 255;
        targetColors[1][i3 + 2] = col[2] / 255;
      }
    }

    // --- SCENE 2: GLOBE DIVIDES & TRANSFORMS INTO 3D LAMP BESIDE SCENE 1 (LEFT: -340) ---
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const ratio = i / PARTICLE_COUNT;
      let x = 0, y = 0, z = 0;
      let col = COLOR_PALETTE.goldenYellow;

      if (ratio < 0.42) {
        // Main Lamp Body (Elongated teardrop / elliptical vessel)
        const u = rnd() * Math.PI * 2;
        const v = rnd() * Math.PI;
        const bodyLen = 135;
        const bodyWidth = 62 * Math.sin(v) * (1 + 0.3 * Math.cos(u));
        x = -340 - 15 + Math.cos(v) * bodyLen * 0.85;
        y = 20 + Math.sin(v) * Math.sin(u) * 46;
        z = Math.sin(v) * Math.cos(u) * bodyWidth * 0.75;
        col = rnd() < 0.65 ? COLOR_PALETTE.goldenYellow : (rnd() < 0.88 ? COLOR_PALETTE.warmOrange : COLOR_PALETTE.softWhite);
      } else if (ratio < 0.56) {
        // Flared Base Pedestal
        const u = rnd() * Math.PI * 2;
        const baseH = rnd();
        const baseR = 42 * (1 - baseH * 0.5) + (rnd() - 0.5) * 4;
        x = -340 - 15 + (rnd() - 0.5) * 12;
        y = 68 + baseH * 24;
        z = Math.sin(u) * baseR * 0.65;
        x += Math.cos(u) * baseR;
        col = rnd() < 0.8 ? COLOR_PALETTE.goldenYellow : COLOR_PALETTE.warmOrange;
      } else if (ratio < 0.76) {
        // Graceful Long Curved Spout (extending right & upwards towards center)
        const t = (ratio - 0.56) / 0.20;
        const spoutAngle = rnd() * Math.PI * 2;
        const spoutRadius = (1 - t * 0.65) * 16 + 3.5;
        const p0 = { x: -340 + 40, y: 15 };
        const p1 = { x: -340 + 115, y: 0 };
        const p2 = { x: -340 + 175, y: -45 };
        const p3 = { x: -340 + 190, y: -75 };
        const cx = Math.pow(1 - t, 3) * p0.x + 3 * Math.pow(1 - t, 2) * t * p1.x + 3 * (1 - t) * Math.pow(t, 2) * p2.x + Math.pow(t, 3) * p3.x;
        const cy = Math.pow(1 - t, 3) * p0.y + 3 * Math.pow(1 - t, 2) * t * p1.y + 3 * (1 - t) * Math.pow(t, 2) * p2.y + Math.pow(t, 3) * p3.y;

        x = cx + Math.cos(spoutAngle) * spoutRadius;
        y = cy + Math.sin(spoutAngle) * spoutRadius;
        z = Math.sin(spoutAngle) * spoutRadius * 0.8;
        col = t > 0.7 ? (rnd() < 0.6 ? COLOR_PALETTE.cyan : COLOR_PALETTE.electricBlue) : COLOR_PALETTE.goldenYellow;
      } else if (ratio < 0.88) {
        // High Arched Handle on the outer left side
        const t = (ratio - 0.76) / 0.12;
        const handleAngle = rnd() * Math.PI * 2;
        const handleR = 5.5;
        const archT = t * Math.PI * 1.35 - 0.2;
        const hx = -340 - 85 - Math.sin(archT) * 42;
        const hy = -10 - Math.cos(archT) * 45;

        x = hx + Math.cos(handleAngle) * handleR;
        y = hy + Math.sin(handleAngle) * handleR;
        z = Math.sin(handleAngle) * handleR;
        col = COLOR_PALETTE.goldenYellow;
      } else if (ratio < 0.94) {
        // Ornate Lid & Glowing Finial Pinnacle
        const t = (ratio - 0.88) / 0.06;
        const u = rnd() * Math.PI * 2;
        const lidR = (1 - t) * 24 + 2;
        x = -340 - 15 + Math.cos(u) * lidR;
        y = -15 - t * 32;
        z = Math.sin(u) * lidR * 0.7;
        col = t > 0.75 ? COLOR_PALETTE.softWhite : COLOR_PALETTE.goldenYellow;
      } else {
        // Surrounding Magical Starlight Mist & Dust Halo
        const u = rnd() * Math.PI * 2;
        const v = rnd() * Math.PI;
        const haloR = 90 + rnd() * 110;
        x = -340 + Math.sin(v) * Math.cos(u) * haloR;
        y = 10 + Math.cos(v) * haloR * 0.85;
        z = Math.sin(v) * Math.sin(u) * haloR * 0.7;
        col = rnd() < 0.5 ? COLOR_PALETTE.cyan : (rnd() < 0.75 ? COLOR_PALETTE.goldenYellow : COLOR_PALETTE.softWhite);
      }

      targets[2][i3] = x;
      targets[2][i3 + 1] = y;
      targets[2][i3 + 2] = z;

      targetColors[2][i3] = col[0] / 255;
      targetColors[2][i3 + 1] = col[1] / 255;
      targetColors[2][i3 + 2] = col[2] / 255;
    }

    // --- SCENE 2: THE EXPLOSION (Text on LEFT -> Explosion on RIGHT: +340) ---
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const phi = Math.acos(2 * rnd() - 1);
      const theta = 2 * Math.PI * rnd();
      const r = 60 + Math.pow(rnd(), 1.2) * 240;

      targets[2][i3] = 340 + r * Math.sin(phi) * Math.cos(theta);
      targets[2][i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      targets[2][i3 + 2] = 50 + r * Math.cos(phi);

      const col = rnd() < 0.4 ? COLOR_PALETTE.goldenYellow : (rnd() < 0.7 ? COLOR_PALETTE.warmOrange : COLOR_PALETTE.electricBlue);
      targetColors[2][i3] = col[0] / 255;
      targetColors[2][i3 + 1] = col[1] / 255;
      targetColors[2][i3 + 2] = col[2] / 255;
    }

    // --- SCENE 3: THE FORMATION (Text on RIGHT -> Swirling Ring on LEFT: -300) ---
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const t = (i / PARTICLE_COUNT) * Math.PI * 16;
      const r = 80 + Math.sin(t * 0.5) * 160 + (rnd() - 0.5) * 40;

      targets[3][i3] = -300 + Math.cos(t) * r;
      targets[3][i3 + 1] = ((i / PARTICLE_COUNT) - 0.5) * 420 + Math.sin(t) * 30;
      targets[3][i3 + 2] = Math.sin(t) * r;

      const col = rnd() < 0.5 ? COLOR_PALETTE.goldenYellow : COLOR_PALETTE.cyan;
      targetColors[3][i3] = col[0] / 255;
      targetColors[3][i3 + 1] = col[1] / 255;
      targetColors[3][i3 + 2] = col[2] / 255;
    }

    // --- SCENE 4: THE 3D GENIE LAMP (Full Parametric Particle Lamp) ---
    // Lamp parts: 45% Main Ellipsoid Body, 15% Base Pedestal, 20% Curved Long Spout, 12% Arched Handle, 8% Lid & Finial Knob
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const ratio = i / PARTICLE_COUNT;
      let x = 0, y = 0, z = 0;
      let col = COLOR_PALETTE.goldenYellow;

      if (ratio < 0.45) {
        // Main Lamp Body (Elongated teardrop / elliptical vessel)
        const u = rnd() * Math.PI * 2;
        const v = rnd() * Math.PI;
        const bodyLen = 140;
        const bodyWidth = 65 * Math.sin(v) * (1 + 0.3 * Math.cos(u));
        x = -15 + Math.cos(v) * bodyLen * 0.85;
        y = 20 + Math.sin(v) * Math.sin(u) * 48;
        z = Math.sin(v) * Math.cos(u) * bodyWidth * 0.75;
        col = rnd() < 0.7 ? COLOR_PALETTE.goldenYellow : (rnd() < 0.9 ? COLOR_PALETTE.warmOrange : COLOR_PALETTE.softWhite);
      } else if (ratio < 0.60) {
        // Flared Base Pedestal
        const u = rnd() * Math.PI * 2;
        const baseH = rnd();
        const baseR = 45 * (1 - baseH * 0.5) + (rnd() - 0.5) * 4;
        x = -15 + (rnd() - 0.5) * 15;
        y = 70 + baseH * 25;
        z = Math.sin(u) * baseR * 0.65;
        x += Math.cos(u) * baseR;
        col = rnd() < 0.8 ? COLOR_PALETTE.goldenYellow : COLOR_PALETTE.warmOrange;
      } else if (ratio < 0.80) {
        // Graceful Long Curved Spout (extending to the right and turning upwards)
        const t = (ratio - 0.60) / 0.20;
        const spoutAngle = rnd() * Math.PI * 2;
        const spoutRadius = (1 - t * 0.65) * 18 + 4;
        const p0 = { x: 40, y: 15 };
        const p1 = { x: 120, y: 0 };
        const p2 = { x: 180, y: -45 };
        const p3 = { x: 195, y: -75 };
        const cx = Math.pow(1 - t, 3) * p0.x + 3 * Math.pow(1 - t, 2) * t * p1.x + 3 * (1 - t) * Math.pow(t, 2) * p2.x + Math.pow(t, 3) * p3.x;
        const cy = Math.pow(1 - t, 3) * p0.y + 3 * Math.pow(1 - t, 2) * t * p1.y + 3 * (1 - t) * Math.pow(t, 2) * p2.y + Math.pow(t, 3) * p3.y;

        x = cx + Math.cos(spoutAngle) * spoutRadius;
        y = cy + Math.sin(spoutAngle) * spoutRadius;
        z = Math.sin(spoutAngle) * spoutRadius * 0.8;
        col = t > 0.75 ? (rnd() < 0.6 ? COLOR_PALETTE.cyan : COLOR_PALETTE.electricBlue) : COLOR_PALETTE.goldenYellow;
      } else if (ratio < 0.92) {
        // High Arched Handle on the left side
        const t = (ratio - 0.80) / 0.12;
        const handleAngle = rnd() * Math.PI * 2;
        const handleR = 6;
        const archT = t * Math.PI * 1.35 - 0.2;
        const hx = -85 - Math.sin(archT) * 45;
        const hy = -10 - Math.cos(archT) * 48;

        x = hx + Math.cos(handleAngle) * handleR;
        y = hy + Math.sin(handleAngle) * handleR;
        z = Math.sin(handleAngle) * handleR;
        col = COLOR_PALETTE.goldenYellow;
      } else {
        // Ornate Lid & Finial Knob with glowing pinnacle
        const t = (ratio - 0.92) / 0.08;
        const u = rnd() * Math.PI * 2;
        const lidR = (1 - t) * 26 + 2;
        x = -15 + Math.cos(u) * lidR;
        y = -15 - t * 35;
        z = Math.sin(u) * lidR * 0.7;
        col = t > 0.8 ? COLOR_PALETTE.softWhite : COLOR_PALETTE.goldenYellow;
      }

      // Shift 3D Lamp to the RIGHT to complement left-aligned text
      targets[4][i3] = 340 + x;
      targets[4][i3 + 1] = y;
      targets[4][i3 + 2] = z;

      targetColors[4][i3] = col[0] / 255;
      targetColors[4][i3 + 1] = col[1] / 255;
      targetColors[4][i3 + 2] = col[2] / 255;
    }

    // --- SCENE 5: LAMP DISSOLUTION (Text on RIGHT -> Sand Stream on LEFT: -320) ---
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const ratio = i / PARTICLE_COUNT;
      if (ratio < 0.5) {
        const t = ratio / 0.5;
        const spiralAngle = t * Math.PI * 8;
        const spiralR = 25 + t * 90;
        targets[5][i3] = -320 + 160 + Math.cos(spiralAngle) * spiralR - t * 120;
        targets[5][i3 + 1] = -75 - t * 220 + (rnd() - 0.5) * 30;
        targets[5][i3 + 2] = Math.sin(spiralAngle) * spiralR;
        const col = rnd() < 0.6 ? COLOR_PALETTE.cyan : COLOR_PALETTE.electricBlue;
        targetColors[5][i3] = col[0] / 255;
        targetColors[5][i3 + 1] = col[1] / 255;
        targetColors[5][i3 + 2] = col[2] / 255;
      } else {
        const t = (ratio - 0.5) / 0.5;
        const drift = (rnd() - 0.5) * 120;
        targets[5][i3] = -320 + (targets[4][i3] - 340) + drift * 0.8;
        targets[5][i3 + 1] = targets[4][i3 + 1] + t * 240 + rnd() * 40;
        targets[5][i3 + 2] = targets[4][i3 + 2] + (rnd() - 0.5) * 60;
        const col = rnd() < 0.6 ? COLOR_PALETTE.goldenYellow : COLOR_PALETTE.warmOrange;
        targetColors[5][i3] = col[0] / 255;
        targetColors[5][i3 + 1] = col[1] / 255;
        targetColors[5][i3 + 2] = col[2] / 255;
      }
    }

    // --- SCENE 6: MAGICAL PARTICLE WATERFALL (Text on LEFT -> Waterfall on RIGHT: +340) ---
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const t = i / PARTICLE_COUNT;
      const spiralTheta = t * Math.PI * 18 + rnd() * 0.4;
      const vortexR = (1 - Math.pow(t - 0.5, 2) * 2) * 180 + 30 + (rnd() - 0.5) * 25;

      targets[6][i3] = 340 + Math.cos(spiralTheta) * vortexR;
      targets[6][i3 + 1] = (t - 0.5) * 560;
      targets[6][i3 + 2] = Math.sin(spiralTheta) * vortexR;

      const col = rnd() < 0.4 ? COLOR_PALETTE.cyan : (rnd() < 0.7 ? COLOR_PALETTE.electricBlue : (rnd() < 0.9 ? COLOR_PALETTE.goldenYellow : COLOR_PALETTE.softWhite));
      targetColors[6][i3] = col[0] / 255;
      targetColors[6][i3 + 1] = col[1] / 255;
      targetColors[6][i3 + 2] = col[2] / 255;
    }

    // --- SCENE 7: THE 3D COSMIC GENIE ENTITY (Text on LEFT -> Genie on RIGHT: +350) ---
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const ratio = i / PARTICLE_COUNT;
      let x = 0, y = 0, z = 0;
      let col = COLOR_PALETTE.cyan;

      if (ratio < 0.15) {
        const u = rnd() * Math.PI * 2;
        const v = rnd() * Math.PI;
        const headR = 30 * (1 + 0.15 * Math.sin(u * 2));
        x = Math.sin(v) * Math.cos(u) * headR * 0.85;
        y = -190 + Math.cos(v) * headR;
        z = Math.sin(v) * Math.sin(u) * headR * 0.85;
        col = (ratio < 0.03 || y < -210) ? COLOR_PALETTE.goldenYellow : COLOR_PALETTE.softWhite;
      } else if (ratio < 0.40) {
        const armSide = rnd() < 0.5 ? -1 : 1;
        const t = rnd();
        const armX = armSide * (55 + t * 95);
        const armY = -140 + Math.sin(t * Math.PI) * 35 - t * 45;
        const armThickness = (1 - t * 0.6) * 18;
        const armAngle = rnd() * Math.PI * 2;
        x = armX + Math.cos(armAngle) * armThickness;
        y = armY + Math.sin(armAngle) * armThickness;
        z = Math.sin(armAngle) * armThickness * 0.9;
        col = rnd() < 0.6 ? COLOR_PALETTE.cyan : COLOR_PALETTE.electricBlue;
      } else if (ratio < 0.65) {
        const t = (ratio - 0.40) / 0.25;
        const u = rnd() * Math.PI * 2;
        const torsoWidth = (1 - t * 0.45) * 55;
        x = Math.cos(u) * torsoWidth;
        y = -120 + t * 90;
        z = Math.sin(u) * torsoWidth * 0.7;
        const distFromCenter = Math.sqrt(x * x + z * z);
        if (t > 0.2 && t < 0.6 && distFromCenter < 25) {
          col = rnd() < 0.6 ? COLOR_PALETTE.goldenYellow : COLOR_PALETTE.softWhite;
        } else {
          col = rnd() < 0.7 ? COLOR_PALETTE.cyan : COLOR_PALETTE.electricBlue;
        }
      } else {
        const t = (ratio - 0.65) / 0.35;
        const tailTheta = t * Math.PI * 7;
        const tailR = (1 - t * 0.7) * 45 + t * 20;
        const sway = Math.sin(t * Math.PI * 3) * 60;

        x = sway + Math.cos(tailTheta) * tailR + (rnd() - 0.5) * (t * 60);
        y = -20 + t * 240;
        z = Math.sin(tailTheta) * tailR + (rnd() - 0.5) * (t * 60);

        col = t > 0.7 ? (rnd() < 0.5 ? COLOR_PALETTE.goldenYellow : COLOR_PALETTE.warmOrange) : COLOR_PALETTE.cyan;
      }

      targets[7][i3] = 350 + x;
      targets[7][i3 + 1] = y;
      targets[7][i3 + 2] = z;

      targetColors[7][i3] = col[0] / 255;
      targetColors[7][i3 + 1] = col[1] / 255;
      targetColors[7][i3 + 2] = col[2] / 255;
    }

    // Dynamic particle simulation arrays
    const curX = new Float32Array(PARTICLE_COUNT);
    const curY = new Float32Array(PARTICLE_COUNT);
    const curZ = new Float32Array(PARTICLE_COUNT);
    const curR = new Float32Array(PARTICLE_COUNT);
    const curG = new Float32Array(PARTICLE_COUNT);
    const curB = new Float32Array(PARTICLE_COUNT);
    const pSize = new Float32Array(PARTICLE_COUNT);
    const pPhase = new Float32Array(PARTICLE_COUNT);

    // Initialize with Scene 0 positions
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      curX[i] = targets[0][i3];
      curY[i] = targets[0][i3 + 1];
      curZ[i] = targets[0][i3 + 2];
      curR[i] = targetColors[0][i3];
      curG[i] = targetColors[0][i3 + 1];
      curB[i] = targetColors[0][i3 + 2];
      pSize[i] = 0.7 + rnd() * 1.3;
      pPhase[i] = rnd() * Math.PI * 2;
    }

    // Depth Sorting Array for Painter's Algorithm
    const indices = new Uint16Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) indices[i] = i;

    // Camera parameters
    const fov = 460;
    let cameraZ = 0;
    let rotY = 0;
    let rotX = 0;
    let lastTime = performance.now();

    // ==========================================
    // RENDER & PHYSICS SIMULATION LOOP
    // ==========================================
    const render = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Smooth scroll interpolation
      scrollProgress += (targetScrollProgress - scrollProgress) * 0.08;

      // Cursor spring physics
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;
      mouse.force *= 0.96;

      // Map scroll progress (0..1) across the 8 continuous scenes
      const totalStages = numScenes - 1;
      const stageExact = scrollProgress * totalStages;
      const stage0 = Math.min(Math.floor(stageExact), totalStages - 1);
      const stage1 = Math.min(stage0 + 1, totalStages);
      const blendRaw = stageExact - stage0;
      const blend = blendRaw * blendRaw * (3 - 2 * blendRaw);

      // Camera motion tied to scroll
      cameraZ = scrollProgress * 150;
      rotY = (mouse.x / width - 0.5) * 0.45 + Math.sin(now * 0.0006) * 0.15;
      rotX = (mouse.y / height - 0.5) * 0.35 + Math.cos(now * 0.0005) * 0.08;

      // Clear Canvas to pure deep cosmic black
      ctx.fillStyle = '#030303';
      ctx.fillRect(0, 0, width, height);

      // Subtle background cosmic ambient gradient
      const ambGrad = ctx.createRadialGradient(
        width / 2 + (mouse.x - width / 2) * 0.1,
        height / 2 + (mouse.y - height / 2) * 0.1,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75
      );
      ambGrad.addColorStop(0, 'rgba(6, 17, 26, 0.45)');
      ambGrad.addColorStop(0.5, 'rgba(3, 8, 14, 0.25)');
      ambGrad.addColorStop(1, 'rgba(3, 3, 3, 0)');
      ctx.fillStyle = ambGrad;
      ctx.fillRect(0, 0, width, height);

      // Precalculate rotation matrix
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const centerX = width / 2;
      const centerY = height / 2;

      // Update particle positions & color
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        const tx = targets[stage0][i3] * (1 - blend) + targets[stage1][i3] * blend;
        const ty = targets[stage0][i3 + 1] * (1 - blend) + targets[stage1][i3 + 1] * blend;
        const tz = targets[stage0][i3 + 2] * (1 - blend) + targets[stage1][i3 + 2] * blend;

        const cr = targetColors[stage0][i3] * (1 - blend) + targetColors[stage1][i3] * blend;
        const cg = targetColors[stage0][i3 + 1] * (1 - blend) + targetColors[stage1][i3 + 1] * blend;
        const cb = targetColors[stage0][i3 + 2] * (1 - blend) + targetColors[stage1][i3 + 2] * blend;

        // Subtle organic breathing motion
        const phase = pPhase[i] + now * 0.002;
        const breathX = Math.sin(phase) * 3.5;
        const breathY = Math.cos(phase * 0.8) * 3.5;
        const breathZ = Math.sin(phase * 1.2) * 3.5;

        // Physics spring interpolation
        curX[i] += (tx + breathX - curX[i]) * 0.09;
        curY[i] += (ty + breathY - curY[i]) * 0.09;
        curZ[i] += (tz + breathZ - curZ[i]) * 0.09;

        curR[i] += (cr - curR[i]) * 0.1;
        curG[i] += (cg - curG[i]) * 0.1;
        curB[i] += (cb - curB[i]) * 0.1;
      }

      // Depth sorting
      indices.sort((a, b) => curZ[b] - curZ[a]);

      // Render all particles
      for (let idx = 0; idx < PARTICLE_COUNT; idx++) {
        const i = indices[idx];

        let x = curX[i];
        let y = curY[i];
        let z = curZ[i] - cameraZ;

        // Rotate around Y
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotate around X
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        // 3D Perspective Projection
        const distance = fov + z2;
        if (distance <= 10) continue;

        const scale = fov / distance;
        let screenX = centerX + x1 * scale;
        let screenY = centerY + y2 * scale;

        // Cursor Gravitational Bubble (Subtle Shimmer with Minimal Zoom)
        const dx = screenX - mouse.x;
        const dy = screenY - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let bubbleScale = 1.0;
        let bubbleAlpha = 1.0;

        if (dist < mouse.radius && dist > 0.01) {
          const normDist = dist / mouse.radius;
          const bubbleFactor = (1 - normDist);
          // Very gentle displacement and subtle brightness increase without heavy zoom
          const pushForce = Math.sin(normDist * Math.PI) * 12 * (0.3 + mouse.force * 0.4);

          screenX += (dx / dist) * pushForce;
          screenY += (dy / dist) * pushForce;

          // Minimal, elegant scale factor (max ~8% subtle expansion)
          bubbleScale = 1.0 + bubbleFactor * 0.08;
          bubbleAlpha = 1.0 + bubbleFactor * 0.25;
        }

        if (screenX < -20 || screenX > width + 20 || screenY < -20 || screenY > height + 20) continue;

        const radius = Math.min(2.8, Math.max(0.6, pSize[i] * Math.min(scale, 1.4) * bubbleScale));
        const alpha = Math.min(0.85, Math.max(0.14, (scale * 0.72) * bubbleAlpha));

        const r = Math.round(curR[i] * 255);
        const g = Math.round(curG[i] * 255);
        const b = Math.round(curB[i] * 255);

        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
        ctx.fill();

        if (radius > 1.8) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, radius * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${(alpha * 0.18).toFixed(3)})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        background: '#030303'
      }}
    />
  );
}
