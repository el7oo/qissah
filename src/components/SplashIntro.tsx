"use client";

import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { useLangStore } from '@/store/langStore';

export function SplashIntro() {
  const [show, setShow] = useState(true);
  const { lang } = useLangStore();

  useEffect(() => {
    // Only show splash once per session
    const hasSeenSplash = sessionStorage.getItem('qissa_splash_v1');
    if (hasSeenSplash) {
      setShow(false);
      return;
    }

    sessionStorage.setItem('qissa_splash_v1', 'true');

    // Make sure body doesn't scroll during splash
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        setShow(false);
      }
    });

    // Animate the logo text - pure cinematic fade in
    tl.fromTo('.splash-txt', 
      { scale: 0.9, opacity: 0, filter: 'blur(12px)', y: 20 },
      { scale: 1, opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.5, ease: 'power3.out' }
    )
    .to('.splash-txt', {
      scale: 1.1, opacity: 0, filter: 'blur(10px)', duration: 0.8, ease: 'power2.in', delay: 0.6
    })
    // Split the doors (curtains) like an opening sequence
    .to('.splash-door.top', {
      yPercent: -100, duration: 1.2, ease: 'power4.inOut'
    }, "-=0.4")
    .to('.splash-door.bottom', {
      yPercent: 100, duration: 1.2, ease: 'power4.inOut'
    }, "-=1.2");

  }, []);

  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
      <div className="splash-door top" style={{ width: '100%', height: '50%', background: 'var(--bg)', borderBottom: '1px solid var(--bdr)' }}></div>
      <div className="splash-door bottom" style={{ width: '100%', height: '50%', background: 'var(--bg)' }}></div>
      
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 className="splash-txt" style={{ 
          fontFamily: "var(--font-tajawal), 'Tajawal', sans-serif", 
          fontSize: '72px', 
          fontWeight: 900, 
          color: 'var(--txt)',
          textShadow: '0 8px 30px var(--glow)',
          letterSpacing: '2px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {lang === 'ar' ? 'قـصـة' : 'QISSA'}
          <span style={{ fontSize: '42px', fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif' }}>✨🛍️</span>
        </h1>
      </div>
    </div>
  );
}
