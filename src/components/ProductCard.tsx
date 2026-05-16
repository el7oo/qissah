"use client";

import { useCartStore } from '@/store/cartStore';
import { audio } from '@/utils/audioEngine';
import { triggerRipple, flyToCart } from '@/utils/visualEffects';
import { Product } from '@/store/productStore';
import toast from 'react-hot-toast';

import { useState } from 'react';
import { ProductModal } from './ui/ProductModal';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const [modalOpen, setModalOpen] = useState(false);

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

    toast.success(`تمت إضافة ${product.title} للسلة`);
  };

  const ratingNum = parseFloat(product.rating?.split('·')[0] || product.rating || '5');
  const sold = product.rating?.split('·')[1]?.trim() || '120';

  return (
    <>
      <div className="pc" onClick={() => { audio.playTap(); setModalOpen(true); }}>
        {product.discount && (
          <div className="disc-tag">{product.discount}</div>
        )}
        <div className="pc-img-wrap">
          <img 
            className="pc-img" 
            id={`pi_${product.id}`} 
            src={product.image} 
            loading="lazy" 
            onError={(e) => (e.currentTarget.src='https://placehold.co/300x300/FFE8D6/DC586D?text=🛍️')}
            alt={product.title}
          />
          <div className="pc-img-overlay"></div>
        </div>
        <div className="pc-body">
          <div className="pc-name">{product.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
            <span className="pc-pr">{product.price} دج</span>
            {product.oldPrice && (
              <span className="pc-old">{product.oldPrice}</span>
            )}
          </div>
          <div className="pc-rating">
            {'★'.repeat(Math.floor(ratingNum))}
            <span style={{ color: 'var(--txt2)', fontSize: '9px' }}> {ratingNum} · {sold} مبيع</span>
          </div>
        </div>
        <button className="add-fab" onClick={handleAdd}>+</button>
      </div>
      {modalOpen && <ProductModal product={product} onClose={() => setModalOpen(false)} />}
    </>
  );
}
