import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type LangState = {
  lang: 'ar' | 'en' | 'fr';
  setLang: (lang: 'ar' | 'en' | 'fr') => void;
};

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'ar',
      setLang: (lang) => {
        set({ lang });
        if (typeof document !== 'undefined') {
          document.documentElement.lang = lang;
          document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
          const lx = document.querySelector('.lx');
          if (lx) {
            lx.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
          }
        }
      },
    }),
    {
      name: 'luxara-lang',
    }
  )
);
