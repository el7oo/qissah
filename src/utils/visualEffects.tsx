"use client";

import { useEffect, useRef } from 'react';
import { audio } from './audioEngine';

// Ripple Effect
export function triggerRipple(e: React.MouseEvent<HTMLElement> | MouseEvent) {
  let btn = e.currentTarget as HTMLElement;
  if (!btn || !btn.getBoundingClientRect) {
    if (e.target) {
      btn = (e.target as HTMLElement).closest('button, .btn, .ib, .ni, .ci-btn, .add-fab, .cat-chip, .lb') as HTMLElement;
    }
  }
  if (!btn || typeof btn.getBoundingClientRect !== 'function') return;

  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  const ripple = document.createElement('span');
  ripple.className = 'ripple-span';
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 550);
}

export function initGlobalEffects() {
  if (typeof window === 'undefined') return;
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const isButton = target.closest('button, .btn, .ib, .ni, .ci-btn, .add-fab, .cat-chip');
    if (isButton) {
      triggerRipple(e);
      if (!isButton.classList.contains('add-fab') && !isButton.classList.contains('ci-btn')) {
        audio.playTap();
      }
    }
  });
}

// Confetti Effect
export function triggerConfetti() {
  const colors = ['#f48fb1', '#ad1457', '#ffe082', '#81d4fa', '#a5d6a7'];
  for (let i = 0; i < 30; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    
    const size = Math.random() * 10 + 5;
    el.style.width = `${size}px`;
    el.style.height = `${size * 0.5}px`;
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.left = `${Math.random() * 100}vw`;
    
    // Staggered delay
    el.style.animationDelay = `${Math.random() * 0.5}s`;
    
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }
}

// Fly-to-Cart Effect
export function flyToCart(imgSrc: string, startEvent: React.MouseEvent) {
  const img = document.createElement('img');
  img.src = imgSrc;
  img.style.position = 'fixed';
  img.style.zIndex = '9999';
  img.style.width = '60px';
  img.style.height = '60px';
  img.style.objectFit = 'cover';
  img.style.borderRadius = '50%';
  img.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
  img.style.pointerEvents = 'none';
  img.style.transition = 'all 0.8s cubic-bezier(0.2, 1, 0.3, 1)';

  const startX = startEvent.clientX;
  const startY = startEvent.clientY;
  
  img.style.left = `${startX - 30}px`;
  img.style.top = `${startY - 30}px`;
  
  document.body.appendChild(img);

  // Find cart icon position
  const cartIcon = document.querySelector('.cart-icon-wrap') || document.querySelector('[href="/cart"]');
  let endX = window.innerWidth / 2;
  let endY = window.innerHeight;
  
  if (cartIcon) {
    const rect = cartIcon.getBoundingClientRect();
    endX = rect.left + rect.width / 2;
    endY = rect.top + rect.height / 2;
  }

  // Animate
  requestAnimationFrame(() => {
    img.style.transform = 'scale(0.2) rotate(360deg)';
    img.style.left = `${endX - 30}px`;
    img.style.top = `${endY - 30}px`;
    img.style.opacity = '0.5';
  });

  setTimeout(() => img.remove(), 800);
}

// Particle Background Component
export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initGlobalEffects(); // Initialize global effects once

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: any[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: `hsla(${Math.random() * 40 + 330}, 80%, 60%, 1)`, // Pink/Maroon hues
        baseAlpha: Math.random() * 0.5 + 0.1,
        seed: Math.random() * 100
      });
    }

    let raf: number;
    let time = 0;

    const loop = () => {
      time += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const alpha = p.baseAlpha + Math.sin(time + p.seed) * 0.2;
        ctx.fillStyle = p.color.replace(', 1)', `, ${Math.max(0, alpha)})`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
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
        zIndex: 0
      }} 
    />
  );
}
