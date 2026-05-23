"use client";

import { useEffect } from 'react';

/**
 * MobileKeyboardHandler - Detects virtual keyboard open/close on mobile
 * and hides/shows the bottom nav to prevent overlap issues.
 * Uses the visualViewport API for reliable keyboard detection.
 */
export function MobileKeyboardHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const viewport = window.visualViewport;
    if (!viewport) return;

    let keyboardOpen = false;

    const handleResize = () => {
      const bottomNav = document.querySelector('.bot-nav') as HTMLElement | null;
      if (!bottomNav) return;

      // On mobile, when the virtual keyboard opens, the visualViewport height shrinks
      const heightDiff = window.innerHeight - viewport.height;
      const isKeyboardUp = heightDiff > 150; // threshold for keyboard

      if (isKeyboardUp && !keyboardOpen) {
        keyboardOpen = true;
        bottomNav.style.transform = 'translateY(100%)';
        bottomNav.style.opacity = '0';
        bottomNav.style.pointerEvents = 'none';
        
        // Also scroll the focused input into view
        const active = document.activeElement as HTMLElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) {
          setTimeout(() => {
            active.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      } else if (!isKeyboardUp && keyboardOpen) {
        keyboardOpen = false;
        bottomNav.style.transform = 'translateY(0)';
        bottomNav.style.opacity = '1';
        bottomNav.style.pointerEvents = '';
      }
    };

    viewport.addEventListener('resize', handleResize);
    viewport.addEventListener('scroll', handleResize);

    return () => {
      viewport.removeEventListener('resize', handleResize);
      viewport.removeEventListener('scroll', handleResize);
    };
  }, []);

  return null;
}
