"use client";

import { ProductCard } from '@/components/ProductCard';
import { AppleEmoji } from '@/components/ui/AppleEmoji';
import { Navigation } from '@/components/ui/Navigation';
import { TruckIcon, PadlockIcon, StarIcon, PhoneIcon } from '@/components/ui/Icons';

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

import { useRouter } from 'next/navigation';
import { useLangStore } from '@/store/langStore';
import { useTranslation } from '@/utils/translations';
import { productService, Product } from '@/services/productService';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function Home() {
  const router = useRouter();
  const { lang } = useLangStore();
  const t = useTranslation(lang);
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [sanityCategories, setSanityCategories] = useState<any[]>([]);

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
      } catch (err: any) {
        if (!cancelled) {
          setCatalogError(err?.message || 'Failed to load catalog');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sections = root.querySelectorAll('[data-home-reveal]');
    gsap.fromTo(
      sections,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.28, stagger: 0.06, ease: 'power2.out' }
    );
  }, [products.length, sanityCategories.length]);

  const featuredProducts = products.filter(p => p.discount);
  const newArrivals = products.slice(0, 8);

  const heroParticles = Array.from({length: 8}, (_, i) => (
    <div key={i} className="hp" style={{
      width: `${4 + i * 2}px`, 
      height: `${4 + i * 2}px`, 
      left: `${10 + i * 11}%`, 
      top: `${15 + i * 8}%`, 
      animationDuration: `${3 + i * 0.7}s`, 
      animationDelay: `${i * 0.4}s`, 
      opacity: 0.2 + i * 0.05
    }}></div>
  ));

  // Merge hardcoded and sanity categories, giving priority to Sanity for new ones
  const categories = [
    ...categoryList.map(c => ({
      id: c.id,
      name: (t as any)[c.nameKey] || c.nameKey,
      icon: c.icon
    })),
    ...sanityCategories
      .filter(sc => !categoryList.some(hc => hc.id === sc.slug))
      .filter(sc => sc.slug !== 'all' && sc.title?.ar !== 'عرض الكل' && sc.title !== 'عرض الكل')
      .map(sc => ({
        id: sc.slug,
        name: sc.title?.ar || sc.title?.en || sc.title || sc.slug,
        icon: sc.icon || '📌'
      }))
  ];

  return (
    <div ref={rootRef} style={{ paddingTop: '6px' }}>
      <div className="hero-sec" data-home-reveal>
        <div className="hero-particles">{heroParticles}</div>
        <div className="hero-txt">
          <div className="hero-badge" style={{ fontFamily: "'Amiri', serif" }}>{t.heroBadge}</div>
          <div className="hero-ttl">{t.heroTitle} <AppleEmoji name="✨" /></div>
          <div className="hero-sub">{t.heroSub}</div>
          <button className="hero-btn" onClick={() => router.push('/shop')}>
            {t.shopNow}
          </button>
        </div>
        <div className="hero-bg"><AppleEmoji name="🌸" /></div>
      </div>

      {catalogError ? (
        <div className="empty" style={{ marginTop: '12px' }}>
          <span className="e-ico"><AppleEmoji name="⚠️" /></span>
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>
            {lang === 'ar' ? 'تعذر تحميل الكتالوج' : 'Catalog unavailable'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--txt2)' }}>{catalogError}</div>
        </div>
      ) : null}

      <div style={{ marginBottom: '20px' }} data-home-reveal>
        <div className="sec-hd" style={{ marginTop: '20px' }}>
          <div className="ttl"><AppleEmoji name="🛍️" /> {lang === 'ar' ? 'تسوق حسب الفئة' : 'Shop by Category'}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', padding: '0 13px' }}>
          {categories.slice(0, 8).map((c, i) => {
            const gradients = [
              'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
              'linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)',
              'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
              'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)',
              'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
              'linear-gradient(135deg, #fdcbf1 0%, #fdcbf1 1%, #e6dee9 100%)',
              'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
            ];
            return (
              <div 
                key={c.id} 
                onClick={() => router.push('/shop')}
                style={{ position: 'relative', height: '110px', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 4px 15px var(--shd)', background: gradients[i % gradients.length], display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}><AppleEmoji name={c.icon} /></div>
                <div style={{ textAlign: 'center', color: '#333', fontWeight: 800, fontSize: '13px', padding: '0 8px' }}>
                  {c.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {featuredProducts.length > 0 ? (
        <div style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(220, 88, 109, 0.05) 0%, rgba(220, 88, 109, 0.15) 100%)', padding: '24px 0', borderRadius: '24px', margin: '0 13px', border: '1px solid rgba(220, 88, 109, 0.2)' }} data-home-reveal>
          <div className="sec-hd" style={{ padding: '0 16px', marginBottom: '16px' }}>
            <div className="ttl" style={{ color: 'var(--p1)', fontSize: '20px' }}><AppleEmoji name="⚡" /> {lang === 'ar' ? 'تخفيضات حصرية' : 'Exclusive Discounts'}</div>
          </div>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '0 16px 12px 16px' }}>
            {featuredProducts.slice(0, 12).map((p, i) => (
              <div key={p.id || `feat-${i}`} style={{ width: '160px', flexShrink: 0 }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      ) : products.length === 0 && !catalogError ? (
        <div style={{ marginBottom: '24px', padding: '24px 0', margin: '0 13px' }}>
          <div className="sec-hd" style={{ padding: '0 16px', marginBottom: '16px' }}>
            <div className="skel" style={{ width: '120px', height: '20px', borderRadius: '4px' }}></div>
          </div>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'hidden', padding: '0 16px 12px 16px' }}>
            {[1,2,3,4].map(i => (
              <div key={`sk-f-${i}`} style={{ width: '160px', flexShrink: 0 }}>
                <div className="skel-card" style={{ height: '240px' }}><div className="skel-img skel"></div><div className="skel-body"><div className="skel-line skel"></div><div className="skel-line skel" style={{ width: '60%' }}></div></div></div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ marginBottom: '24px' }} data-home-reveal>
        <div className="sec-hd">
          <div className="ttl"><AppleEmoji name="🔥" /> {lang === 'ar' ? 'الأكثر رواجاً' : 'Most Popular'}</div>
        </div>
        <div className="pg-swipe">
          {products.length === 0 && !catalogError ? (
            [1,2,3,4,5,6,7,8].map(i => (
              <div key={`sk-p-${i}`} className="skel-card" style={{ height: '240px' }}><div className="skel-img skel"></div><div className="skel-body"><div className="skel-line skel"></div><div className="skel-line skel" style={{ width: '60%' }}></div></div></div>
            ))
          ) : (
            products.slice(0, 50).map((p, i) => (
              <ProductCard key={p.id || `pop-${i}`} product={p} />
            ))
          )}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }} data-home-reveal>
        <div className="sec-hd">
          <div className="ttl"><AppleEmoji name="✨" /> {t.newArrivals}</div>
        </div>
        <div className="pg-swipe">
          {products.length === 0 && !catalogError ? (
            [1,2,3,4,5,6,7,8].map(i => (
              <div key={`sk-n-${i}`} className="skel-card" style={{ height: '240px' }}><div className="skel-img skel"></div><div className="skel-body"><div className="skel-line skel"></div><div className="skel-line skel" style={{ width: '60%' }}></div></div></div>
            ))
          ) : (
            products.slice(0, 50).map((p, i) => (
              <ProductCard key={p.id || `new-${i}`} product={p} />
            ))
          )}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '32px' }}>
          <button className="btn btn-p" onClick={() => router.push('/shop')} style={{ width: 'auto', padding: '14px 48px', fontSize: '18px', borderRadius: '100px' }}>
            {lang === 'ar' ? 'اكتشف المزيد' : 'Discover More'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '22px' }} data-home-reveal>
        <div className="sec-hd">
          <div className="ttl">{lang === 'ar' ? 'لماذا قصة' : 'Why Qissah'}</div>
        </div>
        <div className="feat-grid">
          {[
            ['🚚', lang === 'ar' ? 'التوصيل متوفر 58 ولاية' : 'Delivery to 58 Wilayas', '2.5s'],
            ['🔒', t.securePayment, '3.2s'],
            ['⭐', t.highQuality, '1.8s'],
            ['📞', t.support247, '4s']
          ].map(([ico, lbl, d], idx) => (
            <div key={idx} className="feat-card">
              <span className="feat-ico" style={{ animationDuration: d as string, animationDelay: `${idx * 0.2}s` }}>
                <AppleEmoji name={ico as string} />
              </span>
              <div className="feat-lbl">{lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
