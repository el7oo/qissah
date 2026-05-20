"use client";

import { useEffect, useRef, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/store/productStore';
import { audio } from '@/utils/audioEngine';
import { triggerRipple, flyToCart } from '@/utils/visualEffects';
import { useTranslation } from '@/utils/translations';
import { useLangStore } from '@/store/langStore';
import { XIcon, BagsIcon } from './Icons';
import gsap from 'gsap';
import Image from 'next/image';

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
        <button onClick={() => { audio.playTap(); onClose(); }} style={{ position: 'absolute', top: '16px', left: lang === 'ar' ? '16px' : 'auto', right: lang === 'ar' ? 'auto' : '16px', zIndex: 10, background: 'var(--card)', backdropFilter: 'blur(10px)', border: '1px solid var(--bdr)', color: 'var(--txt)', cursor: 'pointer', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }}>
          <XIcon />
        </button>
        
        <div className="product-modal-body" style={{ overflowY: 'auto', flex: 1, display: 'flex' }}>
          <div className="product-modal-image-col">
            <div style={{ borderRadius: '24px', overflow: 'hidden', background: '#fff', border: '1px solid var(--bdr)', position: 'relative', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
              <img src={activeImage || 'https://placehold.co/400x400/FFE8D6/DC586D?text=🛍️'} alt={product.title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', background: '#fff', display: 'block' }} loading="lazy" />
            </div>
            {product.images && product.images.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginTop: '16px', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                <img 
                  src={product.image || 'https://placehold.co/64x64/FFE8D6/DC586D?text=🛍️'} 
                  onClick={() => setActiveImage(product.image)}
                  alt={product.title}
                  style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '16px', border: activeImage === product.image ? '2px solid var(--p1)' : '2px solid var(--bdr)', cursor: 'pointer', transition: 'all 0.2s' }}
                  loading="lazy"
                />
                {product.images.map((img, i) => (
                  <img 
                    key={i} 
                    src={img || 'https://placehold.co/64x64/FFE8D6/DC586D?text=🛍️'} 
                    onClick={() => setActiveImage(img)}
                    alt={`${product.title} ${i}`}
                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '16px', border: activeImage === img ? '2px solid var(--p1)' : '2px solid var(--bdr)', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}
                    loading="lazy"
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="product-modal-info-col">
            <h2 className="ttl" style={{ fontSize: '32px', margin: '0 0 12px 0', color: 'var(--txt)', lineHeight: 1.2 }}>{product.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ color: 'var(--p1)', fontSize: '32px', fontWeight: 900, fontFamily: "var(--font-outfit), sans-serif", textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>{product.price ? product.price.toLocaleString('en-US') : ''} د.ج</div>
              {product.oldPrice && <div style={{ textDecoration: 'line-through', color: 'var(--txt2)', fontSize: '20px', opacity: 0.6, fontFamily: "var(--font-outfit), sans-serif" }}>{product.oldPrice.toLocaleString('en-US')} د.ج</div>}
            </div>

            <button 
              onClick={handleAdd}
              style={{ 
                width: '100%', padding: '20px', background: 'linear-gradient(135deg, var(--p1), var(--p2))', color: '#fff',
                border: 'none', borderRadius: '20px', fontSize: '20px', fontWeight: 900, 
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                boxShadow: '0 10px 40px var(--glow)', transition: 'transform 0.2s, box-shadow 0.2s', marginBottom: '24px',
                fontFamily: "inherit", flexShrink: 0
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ width: '28px', height: '28px', display: 'inline-block' }}><BagsIcon active={true} /></span>
              {lang === 'ar' ? 'إضافة إلى السلة' : 'Add to cart'}
            </button>

            {product.description && (
              <div style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--txt2)', marginBottom: '20px', padding: '20px', background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--bdr)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
                {product.description}
              </div>
            )}
            
          </div>
        </div>
      </div>
      </div>
      <style>{`
        .product-modal-wrapper {
          position: fixed; inset: 0; z-index: 99999;
          display: flex; align-items: center; justify-content: center;
          pointer-events: auto;
          padding: 20px;
        }
        .product-modal-panel {
          width: 100%;
          max-width: 440px;
          border-radius: 32px;
          max-height: 85vh;
          border: 1px solid var(--bdr);
          box-shadow: 0 30px 60px rgba(0,0,0,0.3);
          transform: translateZ(0);
          will-change: transform, opacity;
          position: relative;
        }
        .product-modal-body {
          flex-direction: column;
        }
        .product-modal-image-col {
          padding: 30px 24px 0;
          width: 100%;
        }
        .product-modal-info-col {
          padding: 24px;
          display: flex; flex-direction: column;
          scrollbar-width: none;
        }
        .product-modal-body::-webkit-scrollbar, .product-modal-info-col::-webkit-scrollbar { display: none; }
        @media (min-width: 768px) {
          .product-modal-wrapper {
            padding: 40px;
          }
          .product-modal-panel {
            max-width: 850px;
            border-radius: 36px;
          }
          .product-modal-body {
            flex-direction: row;
          }
          .product-modal-image-col {
            width: 45%;
            padding: 40px;
            background: var(--surf);
            border-left: 1px solid var(--bdr);
          }
          .product-modal-info-col {
            width: 55%;
            padding: 40px;
            overflow-y: auto;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalPop {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
