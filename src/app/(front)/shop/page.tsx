"use client";

import { useState, useEffect } from 'react';
import { useRef } from 'react';
import { useLangStore } from '@/store/langStore';
import { useTranslation } from '@/utils/translations';
import { ProductCard } from '@/components/ProductCard';
import { ProductSkeleton } from '@/components/ProductSkeleton';
import { AppleEmoji } from '@/components/ui/AppleEmoji';
import { audio } from '@/utils/audioEngine';
import { triggerRipple } from '@/utils/visualEffects';
import { productService, Product } from '@/services/productService';
import gsap from 'gsap';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Shop() {
  const { lang } = useLangStore();
  const router = useRouter();
  const t = useTranslation(lang);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [sanityCategories, setSanityCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 50;
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  
  const [searchFocused, setSearchFocused] = useState(false);
  
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
        setSanityCategories(categories || []);
        if (categories && categories.length > 0 && !cancelled) {
          setActiveCategory(null); // Default to 'All'
        }
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
    // Disabled GSAP stagger to massively improve performance and prevent lagging
  }, [products.length, activeCategory, search, currentPage, loading]);

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
    { id: 'womenClothes', nameKey: 'womenClothing', icon: '👚' },
    { id: 'doors', nameKey: 'doors', icon: '🚪' }
  ];

  const allCategories = [
    { id: null, name: lang === 'ar' ? 'عرض الكل' : 'All', icon: '✨' },
    ...categoryList.map(c => ({
      id: c.id,
      name: (t as any)[c.nameKey] || c.nameKey,
      icon: c.icon
    })),
    ...sanityCategories
      .filter(sc => !categoryList.some(hc => hc.id === sc.slug))
      .filter(sc => sc.slug !== 'all' && sc.title?.ar !== 'عرض الكل' && sc.title !== 'عرض الكل')
      .map(sc => {
        let scIcon = sc.icon;
        if (!scIcon || scIcon === '📌' || scIcon === '🏷️') {
          const title = (sc.title?.ar || sc.title?.en || sc.title || sc.slug).toLowerCase();
          if (title.match(/جمال|beauty|مكياج|عناية|بشرة|شعر/)) scIcon = '✨';
          else if (title.match(/مطبخ|kitchen|طبخ|طعام/)) scIcon = '🍳';
          else if (title.match(/سيار|car|مركب/)) scIcon = '🚗';
          else if (title.match(/هاتف|phone|جوال|اكسسوارات هواتف/)) scIcon = '📱';
          else if (title.match(/أمن|security|كامير/)) scIcon = '📹';
          else if (title.match(/كهربا|electric|الكترونيات/)) scIcon = '⚡';
          else if (title.match(/ملابس|clothes|أزياء|فستان|قميص/)) scIcon = '👕';
          else if (title.match(/أحذية|shoes|جزم/)) scIcon = '👟';
          else if (title.match(/عطور|perfume|رائحة/)) scIcon = '💨';
          else if (title.match(/صحة|health|طب|لياقة/)) scIcon = '🩺';
          else if (title.match(/أطفال|baby|رضع|ألعاب/)) scIcon = '👶';
          else if (title.match(/تخييم|camping|رحل/)) scIcon = '🏕️';
          else if (title.match(/شتاء|برد|دفا/)) scIcon = '❄️';
          else if (title.match(/صيف|بحر/)) scIcon = '🏖️';
          else if (title.match(/أثاث|ديكور|منزل/)) scIcon = '🏠';
          else if (title.match(/معدات|أدوات|عمل/)) scIcon = '🛠️';
          else if (title.match(/حقائب|شنط|bags/)) scIcon = '👜';
          else scIcon = '🏷️';
        }
        return {
          id: sc.slug || sc._id,
          name: sc.title?.ar || sc.title?.en || sc.title || sc.slug,
          icon: scIcon
        };
      })
  ];

  const categories = allCategories.filter(c => 
    c.id === null || products.some(p => p.categoryId === c.id)
  );

  const handleCatClick = (id: string | null, e: React.MouseEvent) => {
    triggerRipple(e as any);
    audio.playTap();
    setActiveCategory(id);
    setCurrentPage(1);
  };

  const normalizeArabic = (text: string) => {
    if (!text) return '';
    return text.toLowerCase()
      .replace(/[أإآا]/g, 'ا')
      .replace(/[ة]/g, 'ه')
      .replace(/[ى]/g, 'ي')
      .replace(/[\u064B-\u065F]/g, ''); // Remove tatweel/tashkeel
  };

  const filteredProducts = products.filter(p => {
    if (activeCategory && p.categoryId !== activeCategory) return false;
    if (search) {
      const normSearch = normalizeArabic(search);
      const normTitle = normalizeArabic(p.title);
      const normDesc = normalizeArabic(p.description || '');
      if (!normTitle.includes(normSearch) && !normDesc.includes(normSearch)) {
        return false;
      }
    }
    return true;
  });

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice(0, currentPage * PAGE_SIZE);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && currentPage < totalPages) {
        setCurrentPage(prev => prev + 1);
      }
    }, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [currentPage, totalPages]);

  const handleSearch = (v: string) => {
    setSearch(v);
    setCurrentPage(1);
  };

  return (
    <div ref={rootRef} style={{ paddingTop: '10px', paddingBottom: '120px' }}>
      <div style={{ padding: '0 13px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="ttl" style={{ flex: 1 }}>{t.shop}</div>
      </div>
      <div className="search-wrap" style={{ position: 'relative', zIndex: searchFocused ? 100 : 1 }}>
        <span style={{ fontSize: '16px', flexShrink: 0 }}><AppleEmoji name="🔍" /></span>
        <input 
          className="search-inp" 
          placeholder={lang === 'ar' ? 'ابحث عن منتجات، فئات...' : 'Search products, categories...'}
          value={search} 
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          dir="auto" 
        />
        {search && (
          <span 
            style={{ cursor: 'pointer', color: 'var(--txt2)', fontSize: '14px', padding: '2px 4px' }} 
            onClick={() => { audio.playTap(); handleSearch(''); }}
          >
            ✕
          </span>
        )}
        
        {searchFocused && search && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px',
            background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--bdr)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)', overflow: 'hidden', zIndex: 101,
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', animation: 'fadeIn 0.2s ease'
          }}>
            {filteredProducts.slice(0, 5).length > 0 ? (
              filteredProducts.slice(0, 5).map(p => (
                <div 
                  key={p.id} 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--bdr)', transition: 'background 0.2s' }}
                  onClick={() => { audio.playTap(); setSearchFocused(false); router.push(`/product/${p.id}`); }}
                >
                  <Image src={p.image || 'https://placehold.co/40x40/FFE8D6/DC586D?text=🛍️'} alt={p.title} width={40} height={40} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--txt)' }}>{p.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--p1)', fontWeight: 800 }}>{p.price} دج</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--txt2)', fontSize: '13px' }}>
                {lang === 'ar' ? 'لا توجد نتائج مطابقة' : 'No results found'}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="cat-scroll" style={{ marginBottom: '13px' }}>
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
        <div className="empty">
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
      ) : loading ? (
        <div className="pg">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty">
          <span className="e-ico"><AppleEmoji name="🔍" /></span>
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>لا توجد منتجات</div>
          <button 
            className="btn btn-s" 
            style={{ width: 'auto', marginTop: '12px', padding: '10px 22px' }} 
            onClick={() => { audio.playTap(); handleSearch(''); setActiveCategory(null); }}
          >
            إعادة ضبط
          </button>
        </div>
      ) : (
        <>
          <div className="pg">
            {paginatedProducts.map(product => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
          {currentPage < totalPages && (
            <div ref={loaderRef} style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
              <div className="skel" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
