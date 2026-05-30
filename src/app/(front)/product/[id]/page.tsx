"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { productService, Product } from '@/services/productService';
import { audio } from '@/utils/audioEngine';
import { triggerRipple, flyToCart } from '@/utils/visualEffects';
import { useTranslation } from '@/utils/translations';
import { useLangStore } from '@/store/langStore';
import { ProductCard } from '@/components/ProductCard';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { lang } = useLangStore();
  const t = useTranslation(lang);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchProduct = async () => {
      try {
        const id = params.id as string;
        if (!id) return;
        const results = await productService.getProductsByIds([id]);
        if (results && results.length > 0 && !cancelled) {
          const currentProd = results[0];
          setProduct(currentProd);
          setActiveImage(currentProd.image);

          // Fetch related products
          const allProducts = await productService.getAllProducts(lang);
          if (!cancelled) {
            const related = allProducts.filter(p => p.categoryId === currentProd.categoryId && p.id !== currentProd.id).slice(0, 6);
            setRelatedProducts(related);
          }
        }
      } catch (err) {
        console.error("Error fetching product", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProduct();
    return () => { cancelled = true; };
  }, [params.id, lang]);

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
      shippingPrice: product.shippingPrice,
      categoryId: product.categoryId
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
        <h2 style={{ fontFamily: 'var(--font-tajawal)' }}>{lang === 'ar' ? 'المنتج غير موجود' : 'Product not found'}</h2>
        <button onClick={() => router.push('/')} className="btn btn-p" style={{ marginTop: '20px', width: 'auto' }}>
          {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </button>
      </div>
    );
  }

  const optimizedActiveImage = activeImage?.includes('cdn.sanity.io') 
    ? `${activeImage}${activeImage.includes('?') ? '&' : '?'}auto=format&w=800&q=80`
    : activeImage;

  return (
    <div className="product-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container">
        <div className="product-layout">
          {/* Gallery Section */}
          <div className="product-gallery">
            <div className="pg-main-wrap">
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
              <div className="pg-thumbs">
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

          {/* Info Section */}
          <div className="product-info">
            <div className="pi-header">
              <h1 className="pi-title">{product.title}</h1>
              <div className="pi-rating">
                {'★'.repeat(5)} <span style={{ color: 'var(--p1)' }}>{product.rating || '5.0'}</span>
              </div>
            </div>

            <div className="pi-price-box">
              <div className="pi-price-current">{product.price ? Number(product.price).toLocaleString('en-US') : ''} د.ج</div>
              {product.oldPrice && (
                <div className="pi-price-old">{Number(product.oldPrice).toLocaleString('en-US')} د.ج</div>
              )}
            </div>

            {/* Scrollable Description */}
            <div className="pi-desc-box">
              <h3 className="pi-desc-title">{lang === 'ar' ? 'تفاصيل المنتج' : 'Product Details'}</h3>
              <div className="pi-desc-content">
                {product.description ? product.description : 'نوعية ممتازة وعالية الجودة. يتميز هذا المنتج بمواصفات مذهلة تمنحك تجربة استخدام فريدة ومريحة. اطلبه الآن قبل نفاذ الكمية!'}
              </div>
            </div>

            <div className="pi-notes">
              <label className="pi-notes-lbl">
                {lang === 'ar' ? '📝 ملاحظات للطلب (اختياري)' : '📝 Order Notes (Optional)'}
              </label>
              <textarea
                className="pi-notes-input"
                placeholder={lang === 'ar' ? 'اكتب اللون المطلوب، المقاس، أو أي تفاصيل أخرى...' : 'Color, Size, or any other details...'}
                dir="auto"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Desktop Add Button */}
            <div className="desktop-add-btn">
              <button className="pi-add-btn" onClick={handleAdd}>
                <span style={{ fontSize: '20px' }}>🛒</span> {lang === 'ar' ? 'إضافة إلى الطلب' : 'Add to Order'}
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-section">
            <h2 className="related-title">{lang === 'ar' ? 'منتجات ذات صلة' : 'Related Products'}</h2>
            <div className="pg" style={{ padding: '0', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Footer */}
      <div className="mobile-sticky-footer">
        <div className="msf-price">
           <div className="msf-pr">{product.price ? Number(product.price).toLocaleString('en-US') : ''} د.ج</div>
           {product.oldPrice && <div className="msf-old">{Number(product.oldPrice).toLocaleString('en-US')} د.ج</div>}
        </div>
        <button className="pi-add-btn" onClick={handleAdd}>
           {lang === 'ar' ? 'إضافة إلى الطلب' : 'Add to Order'}
        </button>
      </div>

      <style>{`
        .product-page {
          min-height: 100vh;
          background: var(--bg);
          padding-top: 16px;
          padding-bottom: 90px; /* space for mobile footer */
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }

        .product-layout {
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: var(--card);
          border-radius: 20px;
          padding: 12px;
          border: 1px solid var(--bdr);
        }

        /* Gallery */
        .product-gallery {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pg-main-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 16px;
          overflow: hidden;
          background: var(--bg2);
        }

        .pg-main-img {
          width: 100%;
          height: 100%;
          object-fit: contain; /* Prevent large stretched images */
          background: #fff;
        }

        .pg-badge {
          position: absolute;
          top: 12px; right: 12px;
          background: var(--p1); color: #FFF;
          font-size: 11px; font-weight: 800;
          padding: 4px 10px; border-radius: 20px;
          box-shadow: 0 4px 12px var(--glow);
        }

        .pg-thumbs {
          display: flex; gap: 8px;
          overflow-x: auto; scrollbar-width: none;
        }
        .pg-thumbs::-webkit-scrollbar { display: none; }

        .pg-thumb {
          width: 60px; height: 60px; min-width: 60px;
          border-radius: 10px; object-fit: cover;
          border: 2px solid transparent; cursor: pointer;
          transition: all 0.2s; background: #fff;
        }
        .pg-thumb.active {
          border-color: var(--p1);
        }

        /* Info Section */
        .product-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .pi-header {
          margin-bottom: 16px;
        }

        .pi-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--txt);
          line-height: 1.3;
          margin-bottom: 6px;
          font-family: var(--font-tajawal);
        }

        .pi-rating {
          font-size: 14px;
          color: #FFC107;
          display: flex; align-items: center; gap: 6px;
        }

        .pi-price-box {
          display: inline-flex;
          align-items: baseline;
          gap: 12px;
          padding: 12px;
          background: var(--bg2);
          border-radius: 12px;
          margin-bottom: 16px;
          border: 1px solid var(--bdr);
        }
        .pi-price-current {
          font-size: 22px; font-weight: 900; color: var(--p1);
        }
        .pi-price-old {
          font-size: 14px; color: var(--txt2); text-decoration: line-through;
        }

        /* Scrollable Description Box */
        .pi-desc-box {
          background: var(--bg);
          border: 1px solid var(--bdr);
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 16px;
          max-height: 200px;
          display: flex;
          flex-direction: column;
        }
        
        .pi-desc-title {
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--txt);
          border-bottom: 1px solid var(--bdr);
          padding-bottom: 8px;
        }

        .pi-desc-content {
          font-size: 14px;
          line-height: 1.8;
          color: var(--txt2);
          white-space: pre-wrap;
          overflow-y: auto;
          flex: 1;
          padding-right: 8px; /* space for scrollbar */
        }
        
        .pi-desc-content::-webkit-scrollbar {
          width: 4px;
        }
        .pi-desc-content::-webkit-scrollbar-thumb {
          background: var(--bdr);
          border-radius: 4px;
        }

        .pi-notes {
          margin-bottom: 16px;
        }
        .pi-notes-lbl {
          display: block; font-size: 13px; font-weight: 700; color: var(--txt); margin-bottom: 8px;
        }
        .pi-notes-input {
          width: 100%; padding: 12px; border-radius: 12px;
          border: 1px solid var(--bdr); background: var(--bg); color: var(--txt);
          font-size: 13px; font-family: inherit; resize: none; outline: none;
          transition: border-color 0.2s;
        }
        .pi-notes-input:focus { border-color: var(--p1); }

        /* Buttons */
        .desktop-add-btn { display: none; }
        
        .pi-add-btn {
          width: 100%;
          background: var(--p1);
          color: #FFF;
          font-size: 16px; font-weight: 800;
          padding: 12px; border-radius: 100px;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform 0.2s, filter 0.2s;
        }
        .pi-add-btn:active { transform: scale(0.96); filter: brightness(0.9); }

        .mobile-sticky-footer {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: var(--card);
          padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
          border-top: 1px solid var(--bdr);
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.03);
        }

        .msf-price {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
        }
        .msf-pr { font-size: 16px; font-weight: 900; color: var(--p1); }
        .msf-old { font-size: 12px; color: var(--txt2); text-decoration: line-through; }

        /* Related section */
        .related-section {
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid var(--bdr);
        }
        .related-title {
          font-size: 20px; font-weight: 800; margin-bottom: 20px; color: var(--txt);
        }

        @media (min-width: 768px) {
          .product-page { padding-top: 30px; padding-bottom: 40px; }
          .product-layout { flex-direction: row; padding: 24px; gap: 30px; }
          .product-gallery { width: 40%; max-width: 450px; }
          .pg-main-wrap { border-radius: 16px; }
          .pi-title { font-size: 24px; }
          .desktop-add-btn { display: block; margin-top: auto; }
          .mobile-sticky-footer { display: none; }
          .pi-desc-box { max-height: 280px; }
        }
      `}</style>
    </div>
  );
}
