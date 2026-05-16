"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useLangStore } from '@/store/langStore';
import { useTranslation } from '@/utils/translations';
import { HouseIcon, BagsIcon, CartIcon, AdminIcon } from './Icons';
import { AppleEmoji } from './AppleEmoji';
import { audio } from '@/utils/audioEngine';

export function Navigation({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const { totalItems, openCart } = useCartStore();
  const { lang, setLang } = useLangStore();
  const t = useTranslation(lang);
  const cartCount = totalItems();
  const router = require('next/navigation').useRouter();
  
  const [langOpen, setLangOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check initial theme
    const lx = document.querySelector('.lx');
    if (lx && lx.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    audio.playPageChange();
  }, [pathname]);

  const toggleTheme = () => {
    const lx = document.querySelector('.lx');
    if (!lx) return;
    
    if (isDark) {
      lx.classList.remove('dark');
      setIsDark(false);
    } else {
      lx.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <>
      <div className="top-nav">
        <span className="ttl" onClick={() => router.push('/')} style={{ cursor: "pointer", fontSize: "24px", color: "var(--p1)", display: "flex", alignItems: "center", gap: "6px" }}>
          {t.luxara} <AppleEmoji name={isDark ? "🖤" : "❤️"} />
        </span>
        <div style={{display:"flex", gap:"4px", alignItems:"center", flexWrap:"nowrap"}}>
          <div style={{ position: "relative" }}>
            <button className="ib" onClick={() => setLangOpen(!langOpen)} title="settings">
              <AppleEmoji name="⚙️" width={20} height={20} className="" />
            </button>
            {langOpen && (
              <div style={{ position: "absolute", top: "100%", left: 0, marginTop: "8px", background: "var(--card)", borderRadius: "12px", padding: "8px", boxShadow: "0 4px 12px var(--shd)", zIndex: 100, border: "1px solid var(--bdr)" }}>
                {(['ar','fr','en'] as const).map(l => (
                  <button 
                    key={l} 
                    style={{ display: "block", width: "100%", padding: "4px 12px", background: lang === l ? "var(--p1)" : "transparent", color: lang === l ? "#fff" : "var(--txt)", borderRadius: "6px", marginBottom: "4px", border: "none", cursor: "pointer", fontWeight: "bold" }}
                    onClick={() => { setLang(l); setLangOpen(false); }}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="toggleWrapper">
            <input 
              className="input" 
              id="theme-toggle" 
              type="checkbox" 
              checked={isDark} 
              readOnly
            />
            <label className="toggle" onClick={toggleTheme}>
              <span className="toggle__handler">
                <span className="crater crater--1"></span>
                <span className="crater crater--2"></span>
                <span className="crater crater--3"></span>
              </span>
              <span className="star star--1"></span>
              <span className="star star--2"></span>
              <span className="star star--3"></span>
              <span className="star star--4"></span>
              <span className="star star--5"></span>
              <span className="star star--6"></span>
            </label>
          </div>
          <div className="cart-icon-wrap" style={{position:"relative", cursor:"pointer", flexShrink:0}} onClick={() => openCart()}>
            <div className="ib"><AppleEmoji name="🛒" width={20} height={20} className="" /></div>
            {isMounted && cartCount > 0 && <div className="cbadge">{cartCount}</div>}
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
