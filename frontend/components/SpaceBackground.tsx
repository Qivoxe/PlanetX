"use client";
import { useEffect, useRef } from "react";

interface Asteroid {
  x: number; y: number;
  vx: number; vy: number;
  size: number; rotation: number;
  rotSpeed: number; opacity: number;
}

interface Meteor {
  x: number; y: number;
  active: boolean; timer: number;
  speed: number;
}

export default function SpaceBackground() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const animId = useRef<number>(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Stars
    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.008 + 0.003,
    }));

    // Asteroids
    const asteroids: Asteroid[] = Array.from({ length: 6 }, () => ({
      x:        Math.random() * window.innerWidth,
      y:        Math.random() * window.innerHeight,
      vx:       (Math.random() - 0.5) * 0.3,
      vy:       (Math.random() - 0.5) * 0.2,
      size:     Math.random() * 18 + 8,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      opacity:  Math.random() * 0.25 + 0.05,
    }));

    // Meteors
    const meteors: Meteor[] = Array.from({ length: 3 }, (_, i) => ({
      x: -100, y: -100, active: false,
      timer: i * 180,
      speed: Math.random() * 8 + 10,
    }));

    const drawAsteroid = (ctx: CanvasRenderingContext2D, a: Asteroid) => {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rotation);
      ctx.beginPath();
      const points = 7;
      for (let i = 0; i < points; i++) {
        const angle  = (i / points) * Math.PI * 2;
        const jitter = a.size * (0.7 + Math.sin(i * 2.3) * 0.3);
        const px     = Math.cos(angle) * jitter;
        const py     = Math.sin(angle) * jitter;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(249,115,22,${a.opacity})`;
      ctx.lineWidth   = 1;
      ctx.stroke();
      ctx.restore();
    };

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Stars with twinkle
      stars.forEach(s => {
        s.twinkle += s.speed;
        const opacity = 0.3 + Math.sin(s.twinkle) * 0.3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226,232,240,${opacity})`;
        ctx.fill();
      });

      // Asteroids
      asteroids.forEach(a => {
        a.rotation += a.rotSpeed;
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < -50)  a.x = canvas.width + 50;
        if (a.x > canvas.width + 50)  a.x = -50;
        if (a.y < -50)  a.y = canvas.height + 50;
        if (a.y > canvas.height + 50) a.y = -50;
        drawAsteroid(ctx, a);
      });

      // Meteors
      meteors.forEach(m => {
        m.timer++;
        if (!m.active && m.timer > 300) {
          m.x     = Math.random() * canvas.width * 0.6;
          m.y     = Math.random() * canvas.height * 0.3;
          m.speed = Math.random() * 8 + 10;
          m.active = true;
          m.timer  = 0;
        }
        if (m.active) {
          const tailLen = 120;
          const grad    = ctx.createLinearGradient(m.x - tailLen, m.y - tailLen * 0.4, m.x, m.y);
          grad.addColorStop(0, "rgba(249,115,22,0)");
          grad.addColorStop(0.6, "rgba(249,115,22,0.4)");
          grad.addColorStop(1, "rgba(255,255,255,0.9)");
          ctx.beginPath();
          ctx.moveTo(m.x - tailLen, m.y - tailLen * 0.4);
          ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth   = 1.5;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(m.x, m.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = "#fff";
          ctx.fill();
          m.x += m.speed * 1.8;
          m.y += m.speed * 0.7;
          if (m.x > canvas.width + 100) m.active = false;
        }
      });

      animId.current = requestAnimationFrame(draw);
    };

    animId.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas ref={ref} style={{
      position: "fixed", top: 0, left: 0,
      width: "100%", height: "100%",
      zIndex: 0, pointerEvents: "none"
    }} />
  );
}