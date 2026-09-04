import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Compass, Search, CheckCircle2 } from 'lucide-react';

const TITLES = [
  {
    id: 0,
    text: "WELCOME TO THE UNIVERSE",
    subtext: "Where knowledge begins as a single particle.",
    stateName: "SCENE 01 // COSMIC ORIGIN",
    icon: Compass,
    accent: "#00D9FF",
    glow: "rgba(0, 217, 255, 0.35)"
  },
  {
    id: 1,
    text: "DISCOVER THE HIDDEN KNOWLEDGE",
    subtext: "Unlock the cosmic intelligence within your product.",
    stateName: "SCENE 02 // THE GENIE MATRIX",
    icon: CheckCircle2,
    accent: "#FFB000",
    glow: "rgba(255, 176, 0, 0.4)"
  }
];

// Multi-stage gradient color waypoints along the continuous journey
// p in [0.0, 2.0]
const COLOR_WAYPOINTS = [
  // p = 0.0 (State 1: Discovery - Architectural Dark / Silver Depth)
  {
    p: 0.0,
    stop0: [9, 9, 11],
    stop1: [14, 14, 17],
    stop2: [18, 18, 22],
    stop3: [9, 9, 11],
    orb1: [255, 255, 255],
    orb2: [161, 161, 170],
    grid: [255, 255, 255, 0.035],
    node: [255, 255, 255]
  },
  // p = 0.25 (Stage 1.25)
  {
    p: 0.25,
    stop0: [9, 9, 11],
    stop1: [15, 15, 19],
    stop2: [20, 20, 24],
    stop3: [9, 9, 11],
    orb1: [244, 244, 245],
    orb2: [113, 113, 122],
    grid: [255, 255, 255, 0.035],
    node: [228, 228, 231]
  },
  // p = 0.5 (Stage 1.5)
  {
    p: 0.5,
    stop0: [9, 9, 11],
    stop1: [16, 16, 20],
    stop2: [22, 22, 26],
    stop3: [9, 9, 11],
    orb1: [228, 228, 231],
    orb2: [161, 161, 170],
    grid: [255, 255, 255, 0.04],
    node: [255, 255, 255]
  },
  // p = 0.75 (Stage 1.75)
  {
    p: 0.75,
    stop0: [9, 9, 11],
    stop1: [16, 16, 20],
    stop2: [22, 22, 26],
    stop3: [9, 9, 11],
    orb1: [255, 255, 255],
    orb2: [113, 113, 122],
    grid: [255, 255, 255, 0.04],
    node: [244, 244, 245]
  },
  // p = 1.0 (State 2: Searching)
  {
    p: 1.0,
    stop0: [9, 9, 11],
    stop1: [18, 18, 22],
    stop2: [24, 24, 28],
    stop3: [9, 9, 11],
    orb1: [255, 255, 255],
    orb2: [161, 161, 170],
    grid: [255, 255, 255, 0.045],
    node: [255, 255, 255]
  },
  // p = 1.25 (Stage 2.25)
  {
    p: 1.25,
    stop0: [9, 9, 11],
    stop1: [16, 16, 20],
    stop2: [22, 22, 26],
    stop3: [9, 9, 11],
    orb1: [244, 244, 245],
    orb2: [113, 113, 122],
    grid: [255, 255, 255, 0.04],
    node: [228, 228, 231]
  },
  // p = 1.5 (Stage 2.5)
  {
    p: 1.5,
    stop0: [9, 9, 11],
    stop1: [15, 15, 19],
    stop2: [20, 20, 24],
    stop3: [9, 9, 11],
    orb1: [228, 228, 231],
    orb2: [161, 161, 170],
    grid: [255, 255, 255, 0.035],
    node: [255, 255, 255]
  },
  // p = 1.75 (Stage 2.75)
  {
    p: 1.75,
    stop0: [9, 9, 11],
    stop1: [14, 14, 18],
    stop2: [19, 19, 23],
    stop3: [9, 9, 11],
    orb1: [255, 255, 255],
    orb2: [113, 113, 122],
    grid: [255, 255, 255, 0.035],
    node: [244, 244, 245]
  },
  // p = 2.0 (State 3: Resolution)
  {
    p: 2.0,
    stop0: [9, 9, 11],
    stop1: [14, 14, 17],
    stop2: [18, 18, 22],
    stop3: [9, 9, 11],
    orb1: [255, 255, 255],
    orb2: [255, 59, 48],
    grid: [255, 255, 255, 0.04],
    node: [255, 255, 255]
  }
];

// Helper: Multi-point continuous color interpolation
function sampleColorChannel(val, getRGB) {
  const count = COLOR_WAYPOINTS.length;
  if (val <= COLOR_WAYPOINTS[0].p) return getRGB(COLOR_WAYPOINTS[0]);
  if (val >= COLOR_WAYPOINTS[count - 1].p) return getRGB(COLOR_WAYPOINTS[count - 1]);

  for (let i = 0; i < count - 1; i++) {
    const w1 = COLOR_WAYPOINTS[i];
    const w2 = COLOR_WAYPOINTS[i + 1];
    if (val >= w1.p && val <= w2.p) {
      const t = (val - w1.p) / (w2.p - w1.p);
      const c1 = getRGB(w1);
      const c2 = getRGB(w2);
      const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
      const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
      const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
      return [r, g, b];
    }
  }
  return [9, 9, 11];
}

export default function IntroExperience({ isComplete, setIsComplete, isActive = true, onReverseToBrandIntro }) {
  const [currentState, setCurrentState] = useState(0);
  const stateRef = useRef(0);
  const isCompleteRef = useRef(isComplete);
  const isActiveRef = useRef(isActive);
  const onReverseRef = useRef(onReverseToBrandIntro);
  const isAnimatingRef = useRef(false);
  const touchStartYRef = useRef(null);

  // Smooth continuous transition progress (0.0 to 2.0)
  const progressRef = useRef(0);
  const morphTweenRef = useRef(null);

  // DOM Refs
  const canvasRef = useRef(null);
  const world3dRef = useRef(null);
  const titleContainerRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    stateRef.current = currentState;
  }, [currentState]);

  useEffect(() => {
    isCompleteRef.current = isComplete;
  }, [isComplete]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    onReverseRef.current = onReverseToBrandIntro;
  }, [onReverseToBrandIntro]);

  // Lock / unlock body scroll depending on isComplete & isActive
  useEffect(() => {
    if (!isActive) return;

    if (!isComplete) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }

    return () => {
      if (isActive) {
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
      }
    };
  }, [isComplete, isActive]);

  // Unified Multi-Stage Continuous Gradient & Title Morphing Transition
  const animateToState = (targetState, direction = 'down') => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const fromProg = progressRef.current;
    const toProg = targetState;
    const isDown = direction === 'down';

    // 1. Synchronized Title Roll Out (Characters flip & blur progressively)
    if (titleContainerRef.current) {
      const currentChars = titleContainerRef.current.querySelectorAll('.roll-char-span');
      if (currentChars.length) {
        gsap.to(currentChars, {
          y: isDown ? -65 : 65,
          scale: 0.68,
          opacity: 0,
          filter: 'blur(10px)',
          duration: 0.42,
          stagger: 0.015,
          ease: 'power2.in'
        });
      }
    }

    // 2. Continuous Multi-Stage Gradient & 3D Spatial Timeline
    const proxy = { p: fromProg };
    if (morphTweenRef.current) morphTweenRef.current.kill();

    morphTweenRef.current = gsap.to(proxy, {
      p: toProg,
      duration: 1.05, // 1.05s fluid cinematic duration
      ease: 'power2.inOut',
      onUpdate: () => {
        progressRef.current = proxy.p;
        const currentP = proxy.p;

        // Apply smooth 3D spatial field dynamics to the world stage
        if (world3dRef.current) {
          if (currentP <= 1.0) {
            // TRANSITION 1: State 0 -> State 1 (3D Spatial Fold)
            const subT = currentP;
            const bell = Math.sin(subT * Math.PI);

            const rotX = bell * (isDown ? 14 : -14);
            const rotY = bell * (isDown ? -8 : 8);
            const scale = 1 - bell * 0.06;
            const tz = -bell * 40;

            world3dRef.current.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale}) translateZ(${tz}px)`;
          } else {
            // TRANSITION 2: State 1 -> State 2 (Radial Convergence & Spatial Bloom)
            const subT = currentP - 1.0;
            const bell = Math.sin(subT * Math.PI);

            const rotX = -bell * (isDown ? 10 : -10);
            const rotY = bell * (isDown ? 5 : -5);
            const scale = 1 + bell * 0.06;
            const tz = bell * 35;

            world3dRef.current.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale}) translateZ(${tz}px)`;
          }
        }
      },
      onComplete: () => {
        progressRef.current = toProg;
        if (world3dRef.current) {
          world3dRef.current.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)';
        }
        isAnimatingRef.current = false;
      }
    });

    // 3. Switch React state midway (at ~40% mark) so incoming title rolls in smoothly
    setTimeout(() => {
      setCurrentState(targetState);
    }, 420);
  };

  // Synchronized Title Entrance (Roll In & Scale Up)
  useEffect(() => {
    if (!titleContainerRef.current) return;
    const chars = titleContainerRef.current.querySelectorAll('.roll-char-span');
    if (!chars.length) return;

    gsap.fromTo(
      chars,
      {
        y: 65,
        scale: 0.65,
        opacity: 0,
        filter: 'blur(8px)'
      },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.65,
        stagger: 0.02,
        ease: 'back.out(2.2)',
        delay: 0.05
      }
    );
  }, [currentState]);

  // Natural Page Scroll & Interactive Title Transition
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY > 120 && stateRef.current === 0 && !isAnimatingRef.current) {
        animateToState(1, 'down');
      } else if (scrollY < 60 && stateRef.current === 1 && !isAnimatingRef.current) {
        animateToState(0, 'up');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Continuous Fluid Multi-Stage Gradient Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 45 Nodes for ambient & structured network
    const nodeCount = 45;
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x0: Math.random() * width,
        y0: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 1.5,
        alpha: Math.random() * 0.5 + 0.35,
        angle: (i / nodeCount) * Math.PI * 2,
        dist1: 140 + (i % 6) * 55,
        dist2: 200 + (i % 4) * 45
      });
    }

    let time = 0;
    let pulseRadius = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      const p = progressRef.current; // 0.0 to 2.0 continuous float
      const centerX = width * 0.5;
      const centerY = height * 0.48;

      // 1. Transparent Cosmic Atmosphere Radial Gradient (reveals underlying multi-layer starfield)
      const grad = ctx.createRadialGradient(
        centerX,
        centerY,
        40,
        centerX,
        centerY,
        Math.max(width, height) * 0.85
      );
      grad.addColorStop(0, 'rgba(15, 20, 45, 0.35)');
      grad.addColorStop(0.4, 'rgba(8, 12, 28, 0.2)');
      grad.addColorStop(1, 'rgba(4, 6, 15, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Fluid Traveling Gradient Light Orbs
      const orb1RGB = sampleColorChannel(p, (w) => w.orb1);
      const orb2RGB = sampleColorChannel(p, (w) => w.orb2);

      // Moving Orb 1: Orbits smoothly based on progress & time
      const orb1X = centerX + Math.cos(p * Math.PI * 0.8 + time * 0.3) * (width * 0.28);
      const orb1Y = centerY + Math.sin(p * Math.PI * 0.6 + time * 0.25) * (height * 0.22);
      const orb1Grad = ctx.createRadialGradient(orb1X, orb1Y, 10, orb1X, orb1Y, 360);
      orb1Grad.addColorStop(0, `rgba(${orb1RGB[0]}, ${orb1RGB[1]}, ${orb1RGB[2]}, 0.15)`);
      orb1Grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = orb1Grad;
      ctx.beginPath();
      ctx.arc(orb1X, orb1Y, 360, 0, Math.PI * 2);
      ctx.fill();

      // Moving Orb 2: Counter-orbit
      const orb2X = centerX - Math.cos(p * Math.PI * 0.9 - time * 0.2) * (width * 0.32);
      const orb2Y = centerY - Math.sin(p * Math.PI * 0.7 - time * 0.3) * (height * 0.25);
      const orb2Grad = ctx.createRadialGradient(orb2X, orb2Y, 10, orb2X, orb2Y, 400);
      orb2Grad.addColorStop(0, `rgba(${orb2RGB[0]}, ${orb2RGB[1]}, ${orb2RGB[2]}, 0.12)`);
      orb2Grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = orb2Grad;
      ctx.beginPath();
      ctx.arc(orb2X, orb2Y, 400, 0, Math.PI * 2);
      ctx.fill();

      // 4. Searching Radar Pulse Waves (smooth bell curve around p = 1.0)
      if (p > 0.08 && p < 1.92) {
        const searchWeight = p <= 1.0 ? p : (2.0 - p); // 0 -> 1 -> 0
        ctx.save();
        pulseRadius = (pulseRadius + 1.8) % (Math.min(width, height) * 0.6);

        for (let r = 0; r < 3; r++) {
          const currentR = (pulseRadius + r * 130) % (Math.min(width, height) * 0.6);
          const alpha = (1 - currentR / (Math.min(width, height) * 0.6)) * 0.28 * searchWeight;
          ctx.beginPath();
          ctx.arc(centerX, centerY, currentR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 5. Resolution Radiant Energy Bloom (smooth growth for p > 1.0)
      if (p > 1.0) {
        const resWeight = p - 1.0; // 0 to 1
        ctx.save();
        const bloomRadius = 420 * resWeight;
        const bloomGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, bloomRadius);
        bloomGrad.addColorStop(0, `rgba(52, 211, 153, ${0.28 * resWeight})`);
        bloomGrad.addColorStop(0.5, `rgba(56, 189, 248, ${0.16 * resWeight})`);
        bloomGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = bloomGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, bloomRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. Smoothly Interpolating Nodes & Interconnecting Lines
      const nodeRGB = sampleColorChannel(p, (w) => w.node);
      const nodeFillStr = `rgb(${nodeRGB[0]}, ${nodeRGB[1]}, ${nodeRGB[2]})`;

      ctx.save();
      nodes.forEach((node, i) => {
        node.x0 += node.vx;
        node.y0 += node.vy;
        if (node.x0 < 0) node.x0 = width;
        if (node.x0 > width) node.x0 = 0;
        if (node.y0 < 0) node.y0 = height;
        if (node.y0 > height) node.y0 = 0;

        const posX0 = node.x0;
        const posY0 = node.y0;

        const angle1 = node.angle + time * 0.4;
        const posX1 = centerX + Math.cos(angle1) * node.dist1;
        const posY1 = centerY + Math.sin(angle1) * node.dist1;

        const angle2 = node.angle - time * 0.25;
        const posX2 = centerX + Math.cos(angle2) * node.dist2;
        const posY2 = centerY + Math.sin(angle2) * node.dist2;

        let curX, curY;
        if (p <= 1.0) {
          curX = posX0 + (posX1 - posX0) * p;
          curY = posY0 + (posY1 - posY0) * p;
        } else {
          const t = p - 1.0;
          curX = posX1 + (posX2 - posX1) * t;
          curY = posY1 + (posY2 - posY1) * t;
        }

        ctx.beginPath();
        ctx.arc(curX, curY, node.size * (1 + 0.15 * (p / 2)), 0, Math.PI * 2);
        ctx.fillStyle = nodeFillStr;
        ctx.globalAlpha = node.alpha;
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          let otherX, otherY;
          if (p <= 1.0) {
            const ox0 = other.x0;
            const oy0 = other.y0;
            const oAng1 = other.angle + time * 0.4;
            const ox1 = centerX + Math.cos(oAng1) * other.dist1;
            const oy1 = centerY + Math.sin(oAng1) * other.dist1;
            otherX = ox0 + (ox1 - ox0) * p;
            otherY = oy0 + (oy1 - oy0) * p;
          } else {
            const t = p - 1.0;
            const oAng1 = other.angle + time * 0.4;
            const ox1 = centerX + Math.cos(oAng1) * other.dist1;
            const oy1 = centerY + Math.sin(oAng1) * other.dist1;
            const oAng2 = other.angle - time * 0.25;
            const ox2 = centerX + Math.cos(oAng2) * other.dist2;
            const oy2 = centerY + Math.sin(oAng2) * other.dist2;
            otherX = ox1 + (ox2 - ox1) * t;
            otherY = oy1 + (oy2 - oy1) * t;
          }

          const dx = curX - otherX;
          const dy = curY - otherY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 120 + (p >= 1.0 ? 30 : 0);

          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(curX, curY);
            ctx.lineTo(otherX, otherY);
            ctx.strokeStyle = nodeFillStr;
            ctx.globalAlpha = (1 - dist / maxDist) * 0.25;
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }
      });
      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const activeTitle = TITLES[currentState];

  return (
    <div className="intro-experience-wrapper fixed-intro-stage" id="intro-experience-viewport">
      {/* 3D World Stage (Transforms cohesively with title roll) */}
      <div ref={world3dRef} className="intro-3d-world-stage">
        {/* Continuous Fluid Multi-Stage Gradient Canvas */}
        <canvas ref={canvasRef} className="intro-experience-canvas" />

        {/* Ambient Vignette Overlay */}
        <div className="intro-vignette-overlay" />

        {/* Synchronized Rolling Title Stage */}
        <div className="intro-content-container">
          <div className="intro-3d-stage">
            <div
              key={activeTitle.id}
              ref={titleContainerRef}
              className="title-3d-card active-roll-card"
              style={{
                '--title-accent': activeTitle.accent,
                '--title-glow': activeTitle.glow
              }}
            >
              <h1 className="intro-hero-title roll-letters-heading">
                {activeTitle.text.split(' ').map((word, wIdx) => (
                  <span key={wIdx} className="roll-word-span">
                    {word.split('').map((char, cIdx) => (
                      <span key={cIdx} className="roll-char-span">
                        {char}
                      </span>
                    ))}
                    <span className="roll-char-space">&nbsp;</span>
                  </span>
                ))}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
