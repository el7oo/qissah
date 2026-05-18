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

  return (
    <div ref={rootRef} style={{ paddingTop: '10px', paddingBottom: '120px' }}>
      <div style={{ padding: '0 13px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="ttl" style={{ flex: 1, fontSize: '28px' }}>
          {lang === 'ar' ? 'تصفح الأقسام' : 'Browse Categories'}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '0 13px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skel" style={{ height: '140px', borderRadius: '12px' }}></div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '0 13px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
          {categories.map((c, i) => (
            <div 
              key={c.id} 
              className="cat-grid-card"
              onClick={() => { audio.playTap(); router.push(`/category/${c.id}`); }}
              style={{ 
                height: '130px', 
                borderRadius: '8px', 
                overflow: 'hidden', 
                cursor: 'pointer', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
                background: '#00D4FF', 
                display: 'flex', 
                flexDirection: 'column', 
                position: 'relative',
                transition: 'transform 0.2s',
                border: '1px solid rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            >
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))' }}>
                <AppleEmoji name={c.icon} />
              </div>
              <div style={{ background: '#fff', padding: '6px 4px', textAlign: 'center', color: '#000', fontWeight: 800, fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {c.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
