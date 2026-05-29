"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useLangStore } from '@/store/langStore';
import { useTranslation } from '@/utils/translations';
import { HouseIcon, BagsIcon, CartIcon } from './Icons';
import { AppleEmoji } from './AppleEmoji';
import { audio } from '@/utils/audioEngine';

export function Navigation({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const { totalItems } = useCartStore();
  const { lang, setLang } = useLangStore();
  const t = useTranslation(lang);
  const cartCount = totalItems();
  const router = require('next/navigation').useRouter();
  
  const [langOpen, setLangOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check initial theme on HTML tag or localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      // Auto detect if no saved theme
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  useEffect(() => {
    audio.playPageChange();
  }, [pathname]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <>
      <div className="top-nav">
        <span className="ttl" onClick={() => router.push('/')} style={{ cursor: "pointer", fontSize: "24px", color: "var(--p1)", display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-tajawal), sans-serif", fontWeight: 900 }}>
          <span className="heart-light"><AppleEmoji name="❤️" width={22} height={22} /></span>
          <span className="heart-dark"><AppleEmoji name="🤍" width={22} height={22} /></span>
          قصــــة
        </span>
        <div style={{display:"flex", gap:"8px", alignItems:"center", flexWrap:"nowrap"}}>
          <div style={{ position: "relative" }}>
            <button className="ib-small" onClick={() => setLangOpen(!langOpen)} title="Language">
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--txt)' }}>{lang.toUpperCase()}</span>
            </button>
            {langOpen && (
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "8px", background: "var(--card)", borderRadius: "12px", padding: "6px", boxShadow: "0 8px 24px var(--shd)", zIndex: 100, border: "1px solid var(--bdr)", minWidth: "80px" }}>
                {(['ar','fr','en'] as const).map(l => (
                  <button 
                    key={l} 
                    style={{ display: "block", width: "100%", padding: "6px 12px", background: lang === l ? "var(--p1)" : "transparent", color: lang === l ? "#fff" : "var(--txt)", borderRadius: "8px", marginBottom: "2px", border: "none", cursor: "pointer", fontWeight: "bold", textAlign: "center" }}
                    onClick={() => { setLang(l); setLangOpen(false); }}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="ib-small" onClick={toggleTheme} title="Toggle Theme">
            {isMounted && isDark ? <AppleEmoji name="🌙" width={18} height={18} /> : <AppleEmoji name="☀️" width={18} height={18} />}
          </button>
          <div className="cart-icon-wrap" style={{position:"relative", cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", width: "36px", height: "36px", background: "var(--card)", borderRadius: "50%", border: "1px solid var(--bdr)"}} onClick={() => router.push('/cart')}>
            <AppleEmoji name="🛒" width={18} height={18} />
            {isMounted && cartCount > 0 && <div className="cbadge" style={{ top: "-4px", right: "-4px" }}>{cartCount}</div>}
          </div>
        </div>
      </div>

      <div className="scroll-area">
        {children}
      </div>

      <div className="bot-nav">
        <div className={`ni ${pathname === '/' ? 'act' : ''}`} onClick={() => router?.push('/')}>
          <div className="ni-glow"></div>
          <div className="ni-ico"><HouseIcon /></div>
          <div className="ni-lbl">{t.home}</div>
        </div>
        <div className={`ni ${pathname === '/shop' ? 'act' : ''}`} onClick={() => router?.push('/shop')}>
          <div className="ni-glow"></div>
          <div className="ni-ico"><BagsIcon /></div>
          <div className="ni-lbl">{t.shop}</div>
        </div>
        <div className={`ni ${pathname === '/cart' ? 'act' : ''}`} onClick={() => router?.push('/cart')}>
          <div className="ni-glow"></div>
          <div className="ni-ico" style={{position:"relative"}}>
            <CartIcon />
            {isMounted && cartCount > 0 && <div className="cbadge">{cartCount}</div>}
          </div>
          <div className="ni-lbl">{t.cart}</div>
        </div>
        </div>
    </>
  );
}
