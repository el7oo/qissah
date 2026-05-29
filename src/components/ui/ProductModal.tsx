"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/store/productStore';
import { audio } from '@/utils/audioEngine';
import { triggerRipple, flyToCart } from '@/utils/visualEffects';
import { useTranslation } from '@/utils/translations';
import { useLangStore } from '@/store/langStore';
import { useRouter } from 'next/navigation';

export function ProductModal({ product, onClose }: { product: Product, onClose: () => void }) {
  const { addItem } = useCartStore();
  const { lang } = useLangStore();
  const t = useTranslation(lang);
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(product.image);
  const [visible, setVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  // Animate in on mount
  useEffect(() => {
    // Tiny delay so CSS transition fires
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    });
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 250);
  }, [onClose]);

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
      handleClose();
      router.push('/cart');
    }, 350);
  };

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleClose]);

  const optimizedActiveImage = activeImage?.includes('cdn.sanity.io') 
    ? `${activeImage}${activeImage.includes('?') ? '&' : '?'}auto=format&w=800&q=80`
    : activeImage;

  return (
    <>
      {/* Dark Blurred Backdrop */}
      <div
        className={`pm-backdrop ${visible ? 'pm-show' : ''}`}
        onClick={() => { audio.playTap(); handleClose(); }}
      />
      
      {/* Modal Container */}
      <div 
        className={`pm-wrapper ${visible ? 'pm-show' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) { audio.playTap(); handleClose(); } }}
      >
        <div
          ref={panelRef}
          className={`pm-panel ${visible ? 'pm-show' : ''}`}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Close Button */}
          <button 
            onClick={() => { audio.playTap(); handleClose(); }} 
            className="pm-close"
            aria-label="Close"
          >
            ✕
          </button>
          
          {/* Scrollable Content Area */}
          <div className="pm-scroll">
            {/* Image Area */}
            <div className="pm-img-area">
              <img 
                src={optimizedActiveImage || 'https://placehold.co/800x600/222/FFF?text=Image'} 
                alt={product.title} 
                className="pm-main-img"
                loading="eager" 
              />
              
              {/* Gallery Thumbnails */}
              {product.images && product.images.length > 0 && (
                <div className="pm-gallery">
                  <img 
                    src={product.image || 'https://placehold.co/100x100/222/FFF'} 
                    onClick={() => setActiveImage(product.image)}
                    alt={product.title}
                    className={`pm-thumb ${activeImage === product.image ? 'active' : ''}`}
                  />
                  {product.images.map((img, i) => (
                    <img 
                      key={i} 
                      src={img || 'https://placehold.co/100x100/222/FFF'} 
                      onClick={() => setActiveImage(img)}
                      alt={`${product.title} ${i}`}
                      className={`pm-thumb ${activeImage === img ? 'active' : ''}`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Content Area */}
            <div className="pm-content">
              {product.discount && (
                <div className="pm-badge">SALE {product.discount}</div>
              )}
              
              <h2 className="pm-title">{product.title}</h2>

              <div className="pm-price-row">
                <div className="pm-current-price">{product.price ? Number(product.price).toLocaleString('en-US') : ''} د.ج</div>
                {product.oldPrice && (
                  <div className="pm-old-price">{Number(product.oldPrice).toLocaleString('en-US')} د.ج</div>
                )}
              </div>

              <div className="pm-desc">
                {product.description ? product.description : 'نوعية ممتازة وعالية الجودة. يتميز هذا المنتج بمواصفات مذهلة تمنحك تجربة استخدام فريدة ومريحة. اطلبه الآن قبل نفاذ الكمية!'}
              </div>

              {/* Notes / Product Details Field */}
              <div className="pm-notes-section">
                <label className="pm-notes-label">
                  {lang === 'ar' ? '📝 تفاصيل الطلب' : '📝 Order Details'}
                </label>
                <textarea
                  className="pm-notes-input"
                  placeholder={lang === 'ar' 
                    ? 'اكتب تفاصيل طلبك هنا:\n• اللون المطلوب (أسود، أبيض، أحمر...)\n• المقاس (S, M, L, XL, XXL...)\n• الحجم أو الوزن\n• أي ملاحظة أخرى...'
                    : 'Write your order details here:\n• Color (black, white, red...)\n• Size (S, M, L, XL, XXL...)\n• Weight or volume\n• Any other note...'}
                  dir="auto"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Sticky Add to Cart Button - ALWAYS visible */}
          <div className="pm-sticky-footer">
            <button className="pm-add-btn" onClick={handleAdd}>
              {lang === 'ar' ? 'إضافة إلى الطلب' : 'Add to Order'} — {product.price ? Number(product.price).toLocaleString('en-US') : ''} د.ج
            </button>
          </div>
        </div>
      </div>

      <style>{`
        /* ==================== BACKDROP ==================== */
        .pm-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 99998;
          opacity: 0;
          transition: opacity 0.25s ease;
          will-change: opacity;
        }
        .pm-backdrop.pm-show {
          opacity: 1;
        }

        /* ==================== WRAPPER ==================== */
        .pm-wrapper {
          position: fixed; inset: 0; z-index: 99999;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          pointer-events: none;
        }
        .pm-wrapper.pm-show {
          pointer-events: auto;
        }

        /* ==================== PANEL ==================== */
        .pm-panel {
          width: 100%;
          max-width: 520px;
          background: var(--card);
          border-radius: 28px 28px 0 0;
          border: 1px solid var(--bdr);
          border-bottom: none;
          box-shadow: 0 -10px 60px rgba(0,0,0,0.25);
          position: relative;
          display: flex;
          flex-direction: column;
          max-height: 85vh;
          max-height: 85dvh;
          transform: translateY(100%);
          opacity: 0;
          transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease;
          will-change: transform, opacity;
          overflow: hidden;
        }
        .pm-panel.pm-show {
          transform: translateY(0);
          opacity: 1;
        }

        /* ==================== CLOSE ==================== */
        .pm-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: none;
          border-radius: 50%;
          color: #FFF;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: background 0.15s, transform 0.15s;
        }
        .pm-close:active {
          transform: scale(0.88);
          background: rgba(0,0,0,0.7);
        }

        /* ==================== SCROLLABLE ==================== */
        .pm-scroll {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          scrollbar-width: none;
        }
        .pm-scroll::-webkit-scrollbar { display: none; }

        /* ==================== IMAGE ==================== */
        .pm-img-area {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          max-height: 340px;
          background: var(--bg);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .pm-main-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .pm-gallery {
          position: absolute;
          bottom: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .pm-gallery::-webkit-scrollbar { display: none; }
        
        .pm-thumb {
          width: 48px;
          height: 48px;
          min-width: 48px;
          object-fit: cover;
          border-radius: 10px;
          border: 2.5px solid rgba(255,255,255,0.4);
          cursor: pointer;
          transition: border-color 0.15s, transform 0.15s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .pm-thumb.active {
          border-color: var(--p1);
          transform: scale(1.08);
        }

        /* ==================== CONTENT ==================== */
        .pm-content {
          padding: 20px 20px 8px;
        }

        .pm-badge {
          display: inline-block;
          background: var(--p1);
          color: #FFF;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }

        .pm-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--txt);
          margin: 0 0 10px 0;
          line-height: 1.4;
          font-family: var(--font-tajawal), sans-serif;
        }

        .pm-price-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 14px;
        }

        .pm-current-price {
          font-size: 22px;
          font-weight: 900;
          color: var(--p1);
        }

        .pm-old-price {
          font-size: 14px;
          color: var(--txt2);
          text-decoration: line-through;
        }

        .pm-desc {
          font-size: 13px;
          line-height: 1.7;
          color: var(--txt2);
          margin-bottom: 16px;
          font-family: var(--font-tajawal), sans-serif;
          max-height: 120px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--bdr) transparent;
          padding-left: 2px;
          padding-right: 2px;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .pm-desc::-webkit-scrollbar { width: 3px; }
        .pm-desc::-webkit-scrollbar-track { background: transparent; }
        .pm-desc::-webkit-scrollbar-thumb { background: var(--bdr); border-radius: 3px; }

        /* ==================== NOTES ==================== */
        .pm-notes-section {
          margin-bottom: 8px;
        }
        .pm-notes-label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: var(--txt);
          margin-bottom: 8px;
          font-family: var(--font-tajawal), sans-serif;
        }
        .pm-notes-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1.5px solid var(--bdr);
          background: var(--bg2);
          color: var(--txt);
          font-size: 12px;
          line-height: 1.6;
          font-family: var(--font-tajawal), sans-serif;
          resize: none;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-overflow-scrolling: touch;
        }
        .pm-notes-input::placeholder {
          color: var(--txt2);
          opacity: 0.55;
          font-size: 11px;
          line-height: 1.6;
        }
        .pm-notes-input:focus {
          border-color: var(--p1);
          box-shadow: 0 0 0 3px var(--glow);
          background: var(--card);
        }

        /* ==================== STICKY FOOTER ==================== */
        .pm-sticky-footer {
          flex-shrink: 0;
          padding: 12px 20px calc(12px + env(safe-area-inset-bottom, 0px));
          background: var(--card);
          border-top: 1px solid var(--bdr);
          box-shadow: 0 -4px 20px rgba(0,0,0,0.06);
        }

        .pm-add-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--p1), var(--p2));
          color: #FFF;
          font-size: 15px;
          font-weight: 800;
          padding: 16px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          font-family: var(--font-tajawal), sans-serif;
          letter-spacing: 0.2px;
        }
        .pm-add-btn:active {
          transform: scale(0.97);
        }

        /* ==================== DESKTOP ==================== */
        @media (min-width: 768px) {
          .pm-wrapper {
            align-items: center;
          }
          .pm-panel {
            max-width: 520px;
            border-radius: 28px;
            border-bottom: 1px solid var(--bdr);
            max-height: 88vh;
            transform: translateY(30px) scale(0.97);
          }
          .pm-panel.pm-show {
            transform: translateY(0) scale(1);
          }
          .pm-sticky-footer {
            border-radius: 0 0 28px 28px;
            padding-bottom: 16px;
          }
        }
      `}</style>
    </>
  );
}
