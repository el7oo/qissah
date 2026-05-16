"use client";

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/store/productStore';
import { audio } from '@/utils/audioEngine';
import { triggerRipple, flyToCart } from '@/utils/visualEffects';
import { useTranslation } from '@/utils/translations';
import { useLangStore } from '@/store/langStore';
import { XIcon, BagsIcon } from './Icons';
import { useState } from 'react';
import gsap from 'gsap';

export function ProductModal({ product, onClose }: { product: Product, onClose: () => void }) {
  const { addItem, openCart } = useCartStore();
  const { lang } = useLangStore();
  const t = useTranslation(lang);
  const [activeImage, setActiveImage] = useState(product.image);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    const tl = gsap.timeline();
    tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: 'power2.out' });
    tl.fromTo(
      panel,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.24, ease: 'power2.out' },
      0
    );
    return () => {
      tl.kill();
    };
  }, []);

  const handleAdd = (e: React.MouseEvent) => {
    triggerRipple(e as any);
    audio.playAddCart();
    flyToCart(product.image, e as any);
    
    addItem({ 
      id: product.id, 
      title: product.title, 
      price: product.price, 
      image: product.image,
      shippingPrice: product.shippingPrice
    } as any);
    
    setTimeout(() => {
      onClose();
      openCart();
    }, 400);
  };

  return (
    <>
      <div
        ref={overlayRef}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 99998,
          backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease'
        }}
        onClick={() => { audio.playTap(); onClose(); }}
      />
      <div
        ref={panelRef}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg)',
          zIndex: 99999, borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
          maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--txt)' }}>{product.title}</div>
          <button onClick={() => { audio.playTap(); onClose(); }} style={{ background: 'var(--card)', border: 'none', color: 'var(--txt)', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}>
            <XIcon />
          </button>
        </div>
        
        <div style={{ position: 'relative', width: '100%', padding: '0 16px' }}>
          <img src={activeImage} alt={product.title} style={{ width: '100%', height: '320px', objectFit: 'contain', borderRadius: '16px', background: '#fff' }} />
          {product.images && product.images.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '12px', paddingBottom: '4px' }}>
              <img 
                src={product.image} 
                onClick={() => setActiveImage(product.image)}
                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '12px', border: activeImage === product.image ? '2px solid var(--p1)' : '2px solid transparent', cursor: 'pointer' }}
              />
              {product.images.map((img, i) => (
                <img 
                  key={i} 
                  src={img} 
                  onClick={() => setActiveImage(img)}
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '12px', border: activeImage === img ? '2px solid var(--p1)' : '2px solid transparent', cursor: 'pointer', flexShrink: 0 }}
                />
              ))}
            </div>
          )}
        </div>
        
        <div style={{ padding: '24px' }}>
          <h2 className="ttl" style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--txt)' }}>{product.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ color: 'var(--p1)', fontSize: '24px', fontWeight: 900 }}>{product.price} دج</div>
            {product.oldPrice && <div style={{ textDecoration: 'line-through', color: 'var(--txt2)', fontSize: '16px' }}>{product.oldPrice}</div>}
          </div>

          {product.description && (
            <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--txt2)', marginBottom: '24px', padding: '16px', background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--bdr)' }}>
              {product.description}
            </div>
          )}
          
          <button 
            onClick={handleAdd}
            style={{ 
              width: '100%', padding: '18px', background: 'var(--p1)', color: '#fff',
              border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 900, 
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)', transition: 'all 0.2s', marginBottom: '32px'
            }}
          >
            <span style={{ width: '24px', height: '24px', display: 'inline-block' }}><BagsIcon active={true} /></span>
            {lang === 'ar' ? 'إضافة إلى السلة' : 'Add to cart'}
          </button>
          
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
