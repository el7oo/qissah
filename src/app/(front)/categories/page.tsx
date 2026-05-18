"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLangStore } from '@/store/langStore';
import { useTranslation } from '@/utils/translations';
import { AppleEmoji } from '@/components/ui/AppleEmoji';
import { productService } from '@/services/productService';
import gsap from 'gsap';
import { audio } from '@/utils/audioEngine';

const hardcodedCategories = [
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

export default function CategoriesPage() {
  const router = useRouter();
  const { lang } = useLangStore();
  const t = useTranslation(lang);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    productService.getCategories().then((sanityCategories) => {
      if (cancelled) return;
      const merged = [
        ...hardcodedCategories.map(c => ({
          id: c.id,
          name: (t as any)[c.nameKey] || c.nameKey,
          icon: c.icon
        })),
        ...sanityCategories.filter((sc: any) => !hardcodedCategories.some(hc => hc.id === sc.slug)).map((sc: any) => ({
          id: sc.slug,
          name: sc.title?.ar || sc.title?.en || sc.title || sc.slug,
          icon: sc.icon || '📌'
        }))
      ];
      setCategories(merged);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [lang]);

  useEffect(() => {
    if (loading || categories.length === 0) return;
    const root = rootRef.current;
    if (!root) return;
    const items = root.querySelectorAll('.cat-grid-card');
    gsap.fromTo(
      items,
      { y: 20, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(1.2)' }
    );
  }, [loading, categories.length]);

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
    <div ref={rootRef} style={{ paddingTop: '10px', paddingBottom: '120px' }}>
      <div style={{ padding: '0 13px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="ttl" style={{ flex: 1, fontSize: '28px' }}>
          <AppleEmoji name="🛍️" /> {lang === 'ar' ? 'تصفح الأقسام' : 'Browse Categories'}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '0 13px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skel" style={{ height: '140px', borderRadius: '24px' }}></div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '0 13px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
          {categories.map((c, i) => (
            <div 
              key={c.id} 
              className="cat-grid-card"
              onClick={() => { audio.playTap(); router.push(`/category/${c.id}`); }}
              style={{ 
                height: '140px', 
                borderRadius: '24px', 
                overflow: 'hidden', 
                cursor: 'pointer', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)', 
                background: gradients[i % gradients.length], 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                transition: 'transform 0.2s',
                border: '1px solid rgba(255,255,255,0.4)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            >
              <div style={{ fontSize: '42px', marginBottom: '12px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>
                <AppleEmoji name={c.icon} />
              </div>
              <div style={{ textAlign: 'center', color: '#1a1a1a', fontWeight: 800, fontSize: '14px', padding: '0 12px', textShadow: '0 2px 4px rgba(255,255,255,0.8)' }}>
                {c.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
