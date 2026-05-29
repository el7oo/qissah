"use client";

import { useEffect } from 'react';
import { useLangStore } from '@/store/langStore';

export function SystemSetup() {
  const { lang, setLang } = useLangStore();

  useEffect(() => {
    // 1. Theme Detection
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    mediaQuery.addEventListener('change', handleChange);

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
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [lang]);

  return null;
}
