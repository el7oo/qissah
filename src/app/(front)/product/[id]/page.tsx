"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { productService, Product } from '@/services/productService';
import { audio } from '@/utils/audioEngine';
import { triggerRipple, flyToCart } from '@/utils/visualEffects';
import { useTranslation } from '@/utils/translations';
import { useLangStore } from '@/store/langStore';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { lang } = useLangStore();
  const t = useTranslation(lang);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const id = params.id as string;
        if (!id) return;
        const results = await productService.getProductsByIds([id]);
        if (results && results.length > 0) {
          setProduct(results[0]);
          setActiveImage(results[0].image);
        }
      } catch (err) {
        console.error("Error fetching product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  const handleAdd = (e: React.MouseEvent) => {
    if (!product) return;
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
      router.push('/cart');
    }, 350);
  };

  if (loading) {
    return (
      <div className="product-page-loading" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏷️</div>
        <h2 style={{ fontFamily: 'var(--font-tajawal)' }}>المنتج غير موجود</h2>
        <button onClick={() => router.push('/')} className="btn btn-p" style={{ marginTop: '20px', width: 'auto' }}>
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const optimizedActiveImage = activeImage?.includes('cdn.sanity.io') 
    ? `${activeImage}${activeImage.includes('?') ? '&' : '?'}auto=format&w=800&q=80`
    : activeImage;

  return (
    <div className="product-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="product-header">
        <button className="back-btn" onClick={() => router.back()}>
          {lang === 'ar' ? '➔' : '←'}
        </button>
      </div>

      <div className="product-content-wrap">
        <div className="product-gallery-section">
          <div className="pg-main-img-wrap">
            <img 
              src={optimizedActiveImage || 'https://placehold.co/800x800/222/FFF?text=Image'} 
              alt={product.title} 
              className="pg-main-img"
            />
            {product.discount && (
              <div className="pg-badge">SALE {product.discount}</div>
            )}
          </div>
          
          {product.images && product.images.length > 0 && (
            <div className="pg-thumbs-row">
              <img 
                src={product.image || 'https://placehold.co/100x100/222/FFF'} 
                onClick={() => setActiveImage(product.image)}
                alt={product.title}
                className={`pg-thumb ${activeImage === product.image ? 'active' : ''}`}
              />
              {product.images.map((img, i) => (
                <img 
                  key={i} 
                  src={img || 'https://placehold.co/100x100/222/FFF'} 
                  onClick={() => setActiveImage(img)}
                  alt={`${product.title} ${i}`}
                  className={`pg-thumb ${activeImage === img ? 'active' : ''}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-info-section">
          <h1 className="pi-title">{product.title}</h1>
          <div className="pi-price-row">
            <div className="pi-current-price">{product.price ? Number(product.price).toLocaleString('en-US') : ''} د.ج</div>
            {product.oldPrice && (
              <div className="pi-old-price">{Number(product.oldPrice).toLocaleString('en-US')} د.ج</div>
            )}
          </div>
          <div className="pi-desc">
            {product.description ? product.description : 'نوعية ممتازة وعالية الجودة. يتميز هذا المنتج بمواصفات مذهلة تمنحك تجربة استخدام فريدة ومريحة. اطلبه الآن قبل نفاذ الكمية!'}
          </div>

          <div className="pi-notes-section">
            <label className="pi-notes-label">
              {lang === 'ar' ? '📝 تفاصيل إضافية (اختياري)' : '📝 Order Details (Optional)'}
            </label>
            <textarea
              className="pi-notes-input"
              placeholder={lang === 'ar' 
                ? 'اكتب تفاصيل طلبك هنا (اللون المطلوب، المقاس، الخ...)'
                : 'Write your order details here (Color, Size, etc...)'}
              dir="auto"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="product-sticky-footer">
        <button className="pi-add-btn" onClick={handleAdd}>
          {lang === 'ar' ? 'إضافة إلى الطلب' : 'Add to Order'} — {product.price ? Number(product.price).toLocaleString('en-US') : ''} د.ج
        </button>
      </div>

      <style>{`
        .product-page {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          flex-direction: column;
          padding-bottom: 80px; /* space for sticky footer */
        }
        
        .product-header {
          padding: 16px 20px;
          position: absolute;
          top: 0; left: 0; right: 0;
          z-index: 10;
          pointer-events: none;
        }
        
        .back-btn {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: none;
          color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          pointer-events: auto;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }
        
        .back-btn:active {
          transform: scale(0.9);
          background: rgba(0,0,0,0.8);
        }

        .product-content-wrap {
          display: flex;
          flex-direction: column;
        }

        .product-gallery-section {
          width: 100%;
          background: var(--card);
        }

        .pg-main-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          background: var(--bg2);
          overflow: hidden;
        }

        .pg-main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pg-badge {
          position: absolute;
          top: 16px; right: 16px;
          background: var(--p1);
          color: #FFF;
          font-size: 11px; font-weight: 800;
          padding: 6px 12px;
          border-radius: 20px;
          box-shadow: 0 4px 12px var(--glow);
        }

        .pg-thumbs-row {
          display: flex; gap: 8px;
          padding: 12px 16px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .pg-thumbs-row::-webkit-scrollbar { display: none; }

        .pg-thumb {
          width: 60px; height: 60px; min-width: 60px;
          border-radius: 12px;
          object-fit: cover;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pg-thumb.active {
          border-color: var(--p1);
          transform: scale(1.05);
        }

        .product-info-section {
          padding: 24px 20px;
          flex: 1;
        }

        .pi-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--txt);
          line-height: 1.3;
          margin-bottom: 12px;
          font-family: var(--font-tajawal);
        }

        .pi-price-row {
          display: flex; align-items: baseline; gap: 12px;
          margin-bottom: 20px;
        }
        .pi-current-price {
          font-size: 28px; font-weight: 900; color: var(--p1);
        }
        .pi-old-price {
          font-size: 16px; color: var(--txt2); text-decoration: line-through; opacity: 0.8;
        }

        .pi-desc {
          font-size: 15px;
          line-height: 1.7;
          color: var(--txt2);
          margin-bottom: 24px;
          white-space: pre-wrap;
        }

        .pi-notes-section {
          margin-bottom: 20px;
        }
        .pi-notes-label {
          display: block; font-size: 14px; font-weight: 700; color: var(--txt); margin-bottom: 8px;
        }
        .pi-notes-input {
          width: 100%; padding: 14px; border-radius: 16px;
          border: 1.5px solid var(--bdr); background: var(--bg2); color: var(--txt);
          font-size: 13px; font-family: inherit; resize: none; outline: none;
          transition: all 0.2s;
        }
        .pi-notes-input:focus {
          border-color: var(--p1); box-shadow: 0 0 0 3px var(--glow); background: var(--card);
        }

        .product-sticky-footer {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          max-width: 480px; /* match container max-width */
          margin: 0 auto;
          background: var(--card);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          padding: 16px 20px calc(16px + env(safe-area-inset-bottom, 0px));
          border-top: 1px solid var(--bdr);
          z-index: 100;
        }

        .pi-add-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--p1), var(--p2));
          color: #FFF;
          font-size: 18px; font-weight: 800;
          padding: 18px; border-radius: 100px;
          border: none; cursor: pointer;
          box-shadow: 0 8px 24px rgba(220,88,109,0.25);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .pi-add-btn:active {
          transform: scale(0.96); box-shadow: 0 4px 12px rgba(220,88,109,0.15);
        }

        @media (min-width: 768px) {
          .product-page { padding-bottom: 0; }
          .product-content-wrap { flex-direction: row; gap: 30px; padding: 40px; }
          .product-gallery-section { flex: 1; max-width: 50%; border-radius: 24px; overflow: hidden; }
          .product-info-section { flex: 1; padding: 0; }
          .product-sticky-footer { position: static; background: transparent; border: none; padding: 0; box-shadow: none; margin-top: 30px; max-width: none; }
          .product-header { display: none; }
        }
      `}</style>
    </div>
  );
}
