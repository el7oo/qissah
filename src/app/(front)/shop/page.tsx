"use client";

import { useState, useEffect } from 'react';
import { useRef } from 'react';
import { useLangStore } from '@/store/langStore';
import { useTranslation } from '@/utils/translations';
import { ProductCard } from '@/components/ProductCard';
import { AppleEmoji } from '@/components/ui/AppleEmoji';
import { audio } from '@/utils/audioEngine';
import { triggerRipple } from '@/utils/visualEffects';
import { productService, Product } from '@/services/productService';
import gsap from 'gsap';

export default function Shop() {
  const { lang } = useLangStore();
  const t = useTranslation(lang);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [sanityCategories, setSanityCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [items, categories] = await Promise.all([
          productService.getAllProducts(),
          productService.getCategories(),
        ]);
        if (cancelled) return;
        setProducts(items);
        setSanityCategories(categories);
      } catch (err: any) {
        if (cancelled) return;
        setCatalogError(err?.message || 'Failed to load catalog');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sections = root.querySelectorAll('[data-shop-reveal]');
    gsap.fromTo(
      sections,
      { y: 8, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.24, stagger: 0.05, ease: 'power2.out' }
    );
  }, [products.length, activeCategory, search]);

  const categoryList = [
    { id: 'clothing', nameKey: 'clothing', icon: '👗' },
    { id: 'electronics', nameKey: 'electronics', icon: '💻' },
    { id: 'shoes', nameKey: 'shoes', icon: '👟' },
    { id: 'care', nameKey: 'care', icon: '✨' },
    { id: 'watches', nameKey: 'watchesAccessories', icon: '⌚' },
    { id: 'phones', nameKey: 'phones', icon: '📱' },
    { id: 'homeApp', nameKey: 'homeAppliances', icon: '🍳' },
    { id: 'carAcc', nameKey: 'carAccessories', icon: '🚗' },
    { id: 'oils', nameKey: 'oilsExtracts', icon: '💧' },
    { id: 'decor', nameKey: 'homeDecor', icon: '🏠' },
    { id: 'bags', nameKey: 'bags', icon: '👜' },
    { id: 'entertainment', nameKey: 'entertainment', icon: '🎮' },
    { id: 'security', nameKey: 'security', icon: '📹' },
    { id: 'kitchen', nameKey: 'kitchenSupplies', icon: '🍽️' },
    { id: 'work', nameKey: 'workEquipment', icon: '🛠️' },
    { id: 'camping', nameKey: 'camping', icon: '🏕️' },
    { id: 'baby', nameKey: 'babyMaternity', icon: '👶' },
    { id: 'flowers', nameKey: 'flowers', icon: '🌸' },
    { id: 'hijab', nameKey: 'hijab', icon: '🧕' },
    { id: 'womenAcc', nameKey: 'womenAccessories', icon: '💍' },
    { id: 'makeup', nameKey: 'makeup', icon: '💄' },
    { id: 'womenClothes', nameKey: 'womenClothing', icon: '👚' }
  ];

  const categories = [
    ...categoryList.map(c => ({
      id: c.id,
      name: (t as any)[c.nameKey] || c.nameKey,
      icon: c.icon
    })),
    ...sanityCategories.filter(sc => !categoryList.some(hc => hc.id === sc.slug)).map(sc => ({
      id: sc.slug,
      name: sc.title?.ar || sc.title?.en || sc.title || sc.slug,
      icon: sc.icon || '📌'
    }))
  ];

  const handleCatClick = (id: string | null, e: React.MouseEvent) => {
    triggerRipple(e as any);
    audio.playTap();
    setActiveCategory(id);
  };

  const filteredProducts = products.filter(p => {
    if (activeCategory && p.categoryId !== activeCategory) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div ref={rootRef} style={{ paddingTop: '10px', paddingBottom: '120px' }}>
      <div style={{ padding: '0 13px 10px', display: 'flex', alignItems: 'center', gap: '8px' }} data-shop-reveal>
        <div className="ttl" style={{ flex: 1 }}>{t.shop}</div>
      </div>
      
      <div className="search-wrap" data-shop-reveal>
        <span style={{ fontSize: '16px', flexShrink: 0 }}><AppleEmoji name="🔍" /></span>
        <input 
          className="search-inp" 
          placeholder="ابحث عن منتجات..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          dir="auto" 
        />
        {search && (
          <span 
            style={{ cursor: 'pointer', color: 'var(--txt2)', fontSize: '14px', padding: '2px 4px' }} 
            onClick={() => { audio.playTap(); setSearch(''); }}
          >
            ✕
          </span>
        )}
      </div>

      <div className="cat-scroll" style={{ marginBottom: '13px' }} data-shop-reveal>
        <div 
          className={`cat-chip ${!activeCategory ? 'sel' : ''}`} 
          onClick={(e) => handleCatClick(null, e)}
        >
          <span className="cc-ico"><AppleEmoji name="🌟" /></span>
          <span className="cc-lbl">{t.viewAll}</span>
        </div>
        {categories.map(c => (
          <div 
            key={c.id} 
            className={`cat-chip ${activeCategory === c.id ? 'sel' : ''}`} 
            onClick={(e) => handleCatClick(c.id, e)}
          >
            <span className="cc-ico"><AppleEmoji name={c.icon} /></span>
            <span className="cc-lbl">{c.name}</span>
          </div>
        ))}
      </div>

      {catalogError ? (
        <div className="empty" data-shop-reveal>
          <span className="e-ico"><AppleEmoji name="⚠️" /></span>
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>
            {lang === 'ar' ? 'تعذر تحميل الكتالوج' : 'Catalog unavailable'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--txt2)', marginBottom: '10px' }}>
            {catalogError}
          </div>
          <button
            className="btn btn-s"
            style={{ width: 'auto', marginTop: '12px', padding: '10px 22px' }}
            onClick={() => window.location.reload()}
          >
            {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty" data-shop-reveal>
          <span className="e-ico"><AppleEmoji name="🔍" /></span>
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>لا توجد منتجات</div>
          <button 
            className="btn btn-s" 
            style={{ width: 'auto', marginTop: '12px', padding: '10px 22px' }} 
            onClick={() => { audio.playTap(); setSearch(''); setActiveCategory(null); }}
          >
            إعادة ضبط
          </button>
        </div>
      ) : (
        <div className="pg" data-shop-reveal>
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      )}
    </div>
  );
}
