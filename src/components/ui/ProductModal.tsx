"use client";

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/store/productStore';
import { audio } from '@/utils/audioEngine';
import { triggerRipple, flyToCart } from '@/utils/visualEffects';
import { useTranslation } from '@/utils/translations';
import { useLangStore } from '@/store/langStore';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export function ProductModal({ product, onClose }: { product: Product, onClose: () => void }) {
  const { addItem } = useCartStore();
  const { lang } = useLangStore();
  const t = useTranslation(lang);
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(product.image);

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
      router.push('/cart');
    }, 400);
  };

  const optimizedActiveImage = activeImage?.includes('cdn.sanity.io') 
    ? `${activeImage}${activeImage.includes('?') ? '&' : '?'}auto=format&w=800&q=80`
    : activeImage;

  return (
    <>
      {/* Dark Blurred Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, 
          background: 'rgba(0,0,0,0.65)', 
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          zIndex: 99998,
        }}
        onClick={() => { audio.playTap(); onClose(); }}
      />
      
      {/* Modal Container */}
      <div className="product-modal-wrapper" onClick={(e) => { if (e.target === e.currentTarget) { audio.playTap(); onClose(); } }}>
        <motion.div
          className="product-modal-panel"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Close Button */}
          <button 
            onClick={() => { audio.playTap(); onClose(); }} 
            className="pm-close-btn"
          >
            ✕
          </button>
          
          {/* Image Area - Edge to Edge */}
          <div className="pm-img-area">
            <img 
              src={optimizedActiveImage || 'https://placehold.co/800x600/222/FFF?text=Image'} 
              alt={product.title} 
              className="pm-main-img"
              loading="lazy" 
            />
            
            {/* Gallery Thumbnails Overlay */}
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
            
            <div className="pm-title-row">
              <h2 className="pm-title">{product.title}</h2>
              <div className="pm-price">
                <div className="pm-current-price">{product.price ? Number(product.price).toLocaleString('en-US') : ''} د.ج</div>
                {product.oldPrice && (
                  <div className="pm-old-price">{Number(product.oldPrice).toLocaleString('en-US')} د.ج</div>
                )}
              </div>
            </div>

            <div className="pm-desc">
              {product.description ? product.description : 'نوعية ممتازة وعالية الجودة. يتميز هذا المنتج بمواصفات مذهلة تمنحك تجربة استخدام فريدة ومريحة. اطلبه الآن قبل نفاذ الكمية!'}
            </div>

            <button className="pm-add-btn" onClick={handleAdd}>
              {lang === 'ar' ? 'إضافة إلى الطلب' : 'Add to Order'} — {product.price ? Number(product.price).toLocaleString('en-US') : ''} د.ج
            </button>
          </div>
        </motion.div>
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
          max-width: 480px;
          background: var(--card);
          border-radius: 32px;
          border: 1px solid var(--bdr);
          box-shadow: 0 40px 80px rgba(0,0,0,0.2);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: 90vh;
        }

        .pm-close-btn {
          position: absolute;
          top: 16px;
          right: 16px; /* Right by default, we can mirror if RTL but keeping right is universal for LTR/RTL modals sometimes, let's keep right */
          width: 32px;
          height: 32px;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(8px);
          border: none;
          border-radius: 50%;
          color: #FFF;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: background 0.2s;
        }
        .pm-close-btn:hover {
          background: rgba(0,0,0,0.8);
        }

        .pm-img-area {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          max-height: 350px;
          background: var(--bg);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pm-main-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .pm-gallery {
          position: absolute;
          bottom: 16px;
          left: 16px;
          right: 16px;
          display: flex;
          gap: 10px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .pm-gallery::-webkit-scrollbar { display: none; }
        
        .pm-thumb {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 12px;
          border: 2px solid rgba(0,0,0,0.1);
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .pm-thumb.active {
          border-color: var(--p1);
          transform: scale(1.05);
        }

        .pm-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .pm-content::-webkit-scrollbar { display: none; }

        .pm-badge {
          display: inline-block;
          background: var(--p1);
          color: #FFF;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
          align-self: flex-start;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }

        .pm-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 12px;
        }

        .pm-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--txt);
          margin: 0;
          line-height: 1.3;
          font-family: var(--font-tajawal), sans-serif;
        }

        .pm-price {
          text-align: right;
          flex-shrink: 0;
        }

        .pm-current-price {
          font-size: 20px;
          font-weight: 900;
          color: var(--p1);
        }

        .pm-old-price {
          font-size: 14px;
          color: var(--txt2);
          text-decoration: line-through;
          margin-top: 2px;
        }

        .pm-desc {
          font-size: 14px;
          line-height: 1.6;
          color: var(--txt2);
          margin-bottom: 24px;
          font-family: var(--font-tajawal), sans-serif;
        }

        .pm-add-btn {
          width: 100%;
          background: var(--p1);
          color: #FFF;
          font-size: 16px;
          font-weight: 800;
          padding: 18px;
          border-radius: 16px;
          border: none;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          font-family: var(--font-tajawal), sans-serif;
        }
        .pm-add-btn:active {
          transform: scale(0.96);
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
