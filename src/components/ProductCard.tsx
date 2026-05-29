"use client";

import { useCartStore } from '@/store/cartStore';
import { audio } from '@/utils/audioEngine';
import { triggerRipple, flyToCart } from '@/utils/visualEffects';
import { Product } from '@/store/productStore';
import toast from 'react-hot-toast';

import { useState, useRef, useEffect } from 'react';

import Image from 'next/image';
import { MagneticButton } from './ui/MagneticButton';

import { ProductModal } from './ui/ProductModal';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const [modalOpen, setModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  // Intersection Observer for reveal animation (lightweight, no framer-motion)
  useEffect(() => {
    const el = cardRef.current;
    if (!el || hasAnimated.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('pc-visible');
          hasAnimated.current = true;
          observer.disconnect();
        }
      },
      { rootMargin: '-30px', threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    triggerRipple(e as any);
    audio.playAddCart();
    flyToCart(product.image, e as any);

    addItem({ 
      id: product.id, 
      title: product.title, 
      price: product.price, 
      image: product.image,
      shippingPrice: product.shippingPrice,
      customShipping: product.customShipping
    } as any);

    const optimizedImage = product.image?.includes('cdn.sanity.io') 
      ? `${product.image}${product.image.includes('?') ? '&' : '?'}auto=format&w=100&q=75`
      : product.image;

    toast.custom((tItem) => (
      <div
        style={{
          background: 'rgba(26, 26, 26, 0.95)',
          border: '1px solid var(--bdr)', borderRadius: '16px', padding: '12px',
          display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          cursor: 'pointer', transform: tItem.visible ? 'translateY(0)' : 'translateY(-20px)',
          opacity: tItem.visible ? 1 : 0, transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          direction: 'rtl'
        }}
        onClick={() => { toast.dismiss(tItem.id); document.querySelector('.ni[data-tab="cart"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })); }}
      >
        <Image src={optimizedImage || 'https://placehold.co/48x48/FFE8D6/DC586D?text=🛍️'} alt={product.title} width={48} height={48} style={{ borderRadius: '10px', objectFit: 'cover', width: '48px', height: '48px' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--txt)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{product.title}</div>
          <div style={{ fontSize: '11px', color: 'var(--txt2)', display: 'flex', alignItems: 'center', gap: '4px' }}>تمت الإضافة للسلة بنجاح 🎉</div>
        </div>
      </div>
    ), { duration: 3000, position: 'top-center' });
  };

  const ratingNum = parseFloat(product.rating?.split('·')[0] || product.rating || '5');
  const sold = product.rating?.split('·')[1]?.trim() || '120';

  const optimizedImage = product.image?.includes('cdn.sanity.io') 
    ? `${product.image}${product.image.includes('?') ? '&' : '?'}auto=format&w=400&q=75`
    : product.image;

  return (
    <>
      <div 
        ref={cardRef}
        className="pc pc-animate" 
        onClick={() => { audio.playTap(); setModalOpen(true); }}
      >
        {product.discount && (
          <div className="disc-tag">{product.discount}</div>
        )}
        <div className="pc-img-wrap">
          <Image 
            className="pc-img" 
            id={`pi_${product.id}`} 
            src={optimizedImage || 'https://placehold.co/300x300/FFE8D6/DC586D?text=🛍️'} 
            width={300}
            height={300}
            alt={product.title || 'Product'}
          />
          <div className="pc-img-overlay"></div>
        </div>
        <div className="pc-body">
          <div className="pc-name">{product.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
            <span className="pc-pr">{product.price ? Number(product.price).toLocaleString('en-US') : ''} د.ج</span>
            {product.oldPrice && (
              <span className="pc-old">{Number(product.oldPrice).toLocaleString('en-US')} د.ج</span>
            )}
          </div>
          <div className="pc-rating">
            {'★'.repeat(Math.floor(ratingNum))}
            <span style={{ color: 'var(--txt2)', fontSize: '9px' }}> {ratingNum} · {sold} مبيع</span>
          </div>
        </div>
        <MagneticButton className="add-fab" onClick={handleAdd}>+</MagneticButton>
      </div>
      {modalOpen && <ProductModal product={product} onClose={() => setModalOpen(false)} />}
    </>
  );
}
