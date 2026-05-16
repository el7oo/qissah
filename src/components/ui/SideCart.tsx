"use client";

import { useCartStore } from '@/store/cartStore';
import { useLangStore } from '@/store/langStore';
import { useTranslation } from '@/utils/translations';
import { useRouter } from 'next/navigation';
import { audio } from '@/utils/audioEngine';
import { triggerRipple } from '@/utils/visualEffects';
import { XIcon, TrashIcon } from './Icons';
import { AppleEmoji } from './AppleEmoji';

export function SideCart() {
  const { items, isCartOpen, closeCart, updateQuantity, removeItem, totalPrice, totalShipping } = useCartStore();
  const { lang } = useLangStore();
  const t = useTranslation(lang);
  const router = useRouter();

  if (!isCartOpen) return null;

  const handleCheckout = (e: React.MouseEvent) => {
    triggerRipple(e as any);
    audio.playTap();
    closeCart();
    router.push('/checkout');
  };

  const handleClose = () => {
    audio.playTap();
    closeCart();
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    triggerRipple(e as any);
    audio.playRemoveItem();
    removeItem(id);
  };

  const handleUpdateQty = (id: string, qty: number, e: React.MouseEvent) => {
    triggerRipple(e as any);
    audio.playTap();
    updateQuantity(id, Math.max(1, qty));
  };

  return (
    <>
      <div 
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9998,
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease'
        }}
        onClick={handleClose}
      />
      <div 
        style={{
          position: 'fixed', top: 0, right: lang === 'ar' ? 'auto' : 0, left: lang === 'ar' ? 0 : 'auto',
          bottom: 0, width: '100%', maxWidth: '420px', 
          background: 'var(--surf)', 
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderLeft: lang === 'ar' ? 'none' : '1px solid var(--bdr)',
          borderRight: lang === 'ar' ? '1px solid var(--bdr)' : 'none',
          zIndex: 9999,
          boxShadow: '0 0 40px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column',
          animation: lang === 'ar' ? 'slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--bdr)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card)' }}>
          <h2 className="ttl" style={{ fontSize: '24px', margin: 0, color: 'var(--txt)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-alexandria), sans-serif' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {lang === 'ar' ? 'سلة المشتريات' : lang === 'fr' ? 'Votre Panier' : 'Your Cart'} <AppleEmoji name="🛍️" />
            </span>
            <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--txt2)', fontFamily: 'var(--font-alexandria), sans-serif', marginTop: '6px', opacity: 0.9 }}>
              {lang === 'ar' ? 'رحلة الأناقة تبدأ من هنا' : lang === 'fr' ? 'Le voyage de l\'élégance commence ici' : 'The journey of elegance begins here'} <AppleEmoji name="✨" />
            </span>
          </h2>
          <button onClick={handleClose} style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: '50%', color: 'var(--txt)', cursor: 'pointer', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            <XIcon />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--txt2)', marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '56px', marginBottom: '20px', opacity: 0.5 }}><AppleEmoji name="🛒" /></div>
              <div style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'var(--font-alexandria), sans-serif', color: 'var(--txt)' }}>{t.emptyCart}</div>
              <p style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8, fontFamily: 'var(--font-alexandria), sans-serif', maxWidth: '240px', lineHeight: 1.6 }}>
                {lang === 'ar' ? 'تصفح منتجاتنا الفاخرة وأضف ما يعجبك هنا' : 'Browse our luxury products and add them here'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '16px', background: 'var(--card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--bdr)', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
                  <img src={item.image} alt={item.title} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '12px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--txt)', marginBottom: '4px', fontFamily: 'var(--font-alexandria), sans-serif' }}>{item.title}</div>
                    <div style={{ color: 'var(--p1)', fontWeight: 800, fontSize: '16px', fontFamily: 'var(--font-alexandria), sans-serif' }}>{item.price} دج</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg2)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--bdr)' }}>
                        <button onClick={(e) => handleUpdateQty(item.id, item.quantity - 1, e)} style={{ background: 'none', border: 'none', color: 'var(--txt)', cursor: 'pointer', padding: '0 4px', fontSize: '16px' }}>-</button>
                        <span style={{ fontSize: '14px', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={(e) => handleUpdateQty(item.id, item.quantity + 1, e)} style={{ background: 'none', border: 'none', color: 'var(--txt)', cursor: 'pointer', padding: '0 4px', fontSize: '16px' }}>+</button>
                      </div>
                      <button onClick={(e) => handleRemove(item.id, e)} style={{ background: 'rgba(255,50,50,0.1)', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid var(--bdr)', background: 'var(--card)', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--txt2)', fontFamily: 'var(--font-alexandria), sans-serif' }}>
            <span>{t.subtotal}</span>
            <span>{totalPrice().toLocaleString()} دج</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: 'var(--txt2)', fontFamily: 'var(--font-alexandria), sans-serif' }}>
            <span>{t.shipping}</span>
            <span>{totalShipping() > 0 ? `${totalShipping()} دج` : t.free}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: 900, fontSize: '20px', color: 'var(--txt)', fontFamily: 'var(--font-alexandria), sans-serif' }}>
            <span>{t.total}</span>
            <span style={{ color: 'var(--p1)' }}>{(totalPrice() + totalShipping()).toLocaleString()} دج</span>
          </div>
          
          <button 
            onClick={handleCheckout} 
            disabled={items.length === 0}
            className="btn btn-p"
            style={{ 
              width: '100%', 
              padding: '16px', 
              borderRadius: '12px', 
              fontSize: '16px', 
              fontWeight: 800, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              opacity: items.length === 0 ? 0.5 : 1,
              cursor: items.length === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-alexandria), sans-serif'
            }}
          >
            {t.checkout}
            {items.length > 0 && <span style={{ display: 'inline-flex' }}><AppleEmoji name="💳" /></span>}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
