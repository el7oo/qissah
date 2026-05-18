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
    // Relying entirely on CSS animations for smoother performance (no GSAP lagging)
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
          position: 'fixed', inset: 0, background: 'rgba(0,10,30,0.65)', zIndex: 99998,
          animation: 'fadeIn 0.25s ease forwards'
        }}
        onClick={() => { audio.playTap(); onClose(); }}
      />
      <div className="product-modal-wrapper" onClick={(e) => { if (e.target === e.currentTarget) { audio.playTap(); onClose(); } }}>
        <div
          ref={panelRef}
          className="product-modal-panel"
          style={{
            background: 'var(--bg)',
            display: 'flex', flexDirection: 'column',
            animation: 'modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            position: 'relative'
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
      </div>
      <style>{`
        .product-modal-wrapper {
          position: fixed; inset: 0; z-index: 99999;
          display: flex; align-items: flex-end; justify-content: center;
          pointer-events: auto;
        }
        .product-modal-panel {
          width: 100%;
          border-top-left-radius: 32px; border-top-right-radius: 32px;
          max-height: 90vh;
        }
        @media (min-width: 768px) {
          .product-modal-wrapper {
            align-items: center; padding: 20px;
          }
          .product-modal-panel {
            width: 90vw; max-width: 480px;
            border-radius: 32px;
            max-height: 90vh;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalPop {
          from { opacity: 0; transform: translateY(40px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
