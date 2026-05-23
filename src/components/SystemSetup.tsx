"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useLangStore } from '@/store/langStore';
import { MobileKeyboardHandler } from './ui/MobileKeyboardHandler';

export function SystemSetup() {
  const { lang, setLang } = useLangStore();

  useEffect(() => {
    // 1. Theme Detection
    const lx = document.querySelector('.lx');
    if (lx) {
      // It's already handled by the inline script to avoid flash.
      // But we can listen for system preference changes if needed.
    }

    // 2. Language Detection
    const hasVisited = localStorage.getItem('luxara_visited');
    if (!hasVisited) {
      localStorage.setItem('luxara_visited', 'true');
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('en')) {
        setLang('en');
      } else if (browserLang.startsWith('fr')) {
        setLang('fr');
      } else {
        setLang('ar');
      }
    } else {
      // Apply saved lang to DOM just in case
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      if (lx) {
        lx.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      }
    }
  }, []);

  return <MobileKeyboardHandler />;
}
