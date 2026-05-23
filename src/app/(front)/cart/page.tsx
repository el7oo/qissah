"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useLangStore } from '@/store/langStore';
import { useTranslation } from '@/utils/translations';
import { audio } from '@/utils/audioEngine';
import { triggerRipple } from '@/utils/visualEffects';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import gsap from 'gsap';
import Image from 'next/image';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const { lang } = useLangStore();
  const t = useTranslation(lang);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sections = root.querySelectorAll('[data-cart-section]');
    gsap.fromTo(
      sections,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.24, stagger: 0.05, ease: 'power2.out' }
    );
  }, [items.length]);
  
  const tot = totalPrice();

  const handleUpdateQty = (id: string, qty: number, e: React.MouseEvent) => {
    triggerRipple(e as any);
    audio.playTap();
    updateQuantity(id, qty);
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    triggerRipple(e as any);
    audio.playRemoveItem();
    // Visual removal animation
    const el = document.getElementById('ci_' + id);
    if (el) {
      el.style.transform = 'translateX(100%)';
      el.style.opacity = '0';
    }
    setTimeout(() => {
      removeItem(id);
    }, 280);
  };

  const handleCheckout = (e: React.MouseEvent) => {
    triggerRipple(e as any);
    audio.playTap();
    router.push('/checkout');
  };

  return (
    <div ref={rootRef} style={{ paddingTop: '10px', paddingBottom: '120px' }}>
      <div style={{ padding: '0 13px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="ttl" style={{ flex: 1 }}>{t.cart}</div>
      </div>
      
      {items.length === 0 ? (
        <div className="empty" data-cart-section>
          <span className="e-ico"><CategoryIcon name="🛒" size={48} className="text-primary" /></span>
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>{t.emptyCart}</div>
          <button className="btn btn-s" style={{ width: 'auto', marginTop: '12px', padding: '10px 22px' }} onClick={(e) => { triggerRipple(e as any); audio.playTap(); router.push('/shop'); }}>{t.shopNow}</button>
        </div>
      ) : (
        <>
          <div data-cart-section>
            {items.map(item => (
              <div key={item.id} id={'ci_' + item.id} className="ci">
                <Image className="ci-img" src={item.image || 'https://placehold.co/100x100/FFE8D6/DC586D?text=🛍️'} alt={item.title} width={100} height={100} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '3px' }}>{item.title}</div>
                  <div style={{ fontSize: '14px', color: 'var(--p1)', fontWeight: 900 }}>{item.price} دج</div>
                  <div className="qty-row">
                    <button className="qty-btn" onClick={(e) => handleUpdateQty(item.id, Math.max(1, item.quantity - 1), e)}>-</button>
                    <div className="qty-val">{item.quantity}</div>
                    <button className="qty-btn" onClick={(e) => handleUpdateQty(item.id, item.quantity + 1, e)}>+</button>
                  </div>
                </div>
                <button className="rm-btn" onClick={(e) => handleRemove(item.id, e)}><CategoryIcon name="🗑️" size={16} className="text-primary" /></button>
              </div>
            ))}
          </div>
          
          <div className="ck-sum" style={{ marginTop: '15px' }} data-cart-section>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', color: 'var(--txt2)' }}>
              <span>{t.subtotal}</span><span>{tot.toLocaleString()} دج</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '12px', color: 'var(--txt2)' }}>
              <span>{t.shipping}</span><span><CategoryIcon name="🚚" size={16} className="inline-block" /> {t.free}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '16px', marginBottom: '16px' }}>
              <span>{t.total}</span><span style={{ color: 'var(--p1)' }}>{tot.toLocaleString()} دج</span>
            </div>
            <button className="btn btn-p" onClick={handleCheckout}>{t.checkout}</button>
          </div>
        </>
      )}
    </div>
  );
}
