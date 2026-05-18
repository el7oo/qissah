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
        className="product-modal-panel"
        style={{
          position: 'fixed', background: 'var(--bg)',
          zIndex: 99999, display: 'flex', flexDirection: 'column',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.2)'
        }}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--bdr)' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--txt)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', paddingRight: '10px' }}>{product.title}</div>
          <button onClick={() => { audio.playTap(); onClose(); }} style={{ background: 'var(--card)', border: '1px solid var(--bdr)', color: 'var(--txt)', cursor: 'pointer', padding: '8px', borderRadius: '50%', flexShrink: 0, transition: 'transform 0.2s' }}>
            <XIcon />
          </button>
        </div>
        
        <div className="product-modal-body" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative', width: '100%', padding: '20px 20px 0' }}>
            <div style={{ borderRadius: '24px', overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--bdr)', position: 'relative' }}>
              <img src={activeImage} alt={product.title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', background: '#fff' }} />
            </div>
            {product.images && product.images.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginTop: '16px', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                <img 
                  src={product.image} 
                  onClick={() => setActiveImage(product.image)}
                  style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '14px', border: activeImage === product.image ? '2px solid var(--p1)' : '2px solid var(--bdr)', cursor: 'pointer', transition: 'border-color 0.2s' }}
                />
                {product.images.map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    onClick={() => setActiveImage(img)}
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '14px', border: activeImage === img ? '2px solid var(--p1)' : '2px solid var(--bdr)', cursor: 'pointer', flexShrink: 0, transition: 'border-color 0.2s' }}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div style={{ padding: '24px 20px' }}>
            <h2 className="ttl" style={{ fontSize: '26px', margin: '0 0 12px 0', color: 'var(--txt)', lineHeight: 1.3 }}>{product.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ color: 'var(--p1)', fontSize: '28px', fontWeight: 900, textShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>{product.price} دج</div>
              {product.oldPrice && <div style={{ textDecoration: 'line-through', color: 'var(--txt2)', fontSize: '18px', opacity: 0.7 }}>{product.oldPrice}</div>}
            </div>

            {product.description && (
              <div style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--txt2)', marginBottom: '30px', padding: '18px', background: 'var(--card)', borderRadius: '20px', border: '1px solid var(--bdr)' }}>
                {product.description}
              </div>
            )}
            
            <button 
              onClick={handleAdd}
              style={{ 
                width: '100%', padding: '18px', background: 'linear-gradient(135deg, var(--p1), var(--p2))', color: '#fff',
                border: 'none', borderRadius: '16px', fontSize: '18px', fontWeight: 900, 
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: '0 8px 30px var(--glow)', transition: 'transform 0.2s, box-shadow 0.2s', marginBottom: '20px',
                fontFamily: "'Tajawal', sans-serif"
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ width: '26px', height: '26px', display: 'inline-block' }}><BagsIcon active={true} /></span>
              {lang === 'ar' ? 'إضافة إلى السلة' : 'Add to cart'}
            </button>
            
          </div>
        </div>
      </div>
      <style>{`
        .product-modal-panel {
          bottom: 0; left: 0; right: 0; 
          border-top-left-radius: 32px; border-top-right-radius: 32px;
          max-height: 90vh;
        }
        @media (min-width: 768px) {
          .product-modal-panel {
            top: 5vh; bottom: 5vh; left: 50%; right: auto; 
            width: 90vw; max-width: 500px;
            transform: translateX(-50%) !important;
            border-radius: 32px;
            max-height: none;
          }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
