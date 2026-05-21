"use client";

import { useCartStore } from '@/store/cartStore';
import { useLangStore } from '@/store/langStore';
import { useTranslation } from '@/utils/translations';
import { useRouter } from 'next/navigation';
import { audio } from '@/utils/audioEngine';
import { triggerRipple } from '@/utils/visualEffects';
import { XIcon, TrashIcon } from './Icons';
import { AppleEmoji } from './AppleEmoji';
import { MagneticButton } from './MagneticButton';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import { algeriaWilayas } from '@/lib/algeria-wilayas';
import { orderService } from '@/services/orderService';
import toast from 'react-hot-toast';

export function SideCart() {
  const { items, isCartOpen, closeCart, updateQuantity, removeItem, totalPrice, totalShipping } = useCartStore();
  const { lang } = useLangStore();
  const t = useTranslation(lang);
  const router = useRouter();

  const [view, setView] = useState<'cart' | 'checkout'>('cart');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    wilaya: '',
    address: '',
    deliveryType: 'desk' as 'home' | 'desk'
  });

  if (!isCartOpen) return null;

  const selectedWilaya = useMemo(() => {
    return algeriaWilayas.find(w => w.id.toString() === formData.wilaya);
  }, [formData.wilaya]);

  const { homeFee, deskFee } = useMemo(() => {
    if (!selectedWilaya) return { homeFee: 0, deskFee: 0 };
    
    let calcHome: number | null = selectedWilaya.homePrice;
    let calcDesk: number | null = selectedWilaya.deskPrice;
    
    items.forEach(item => {
      let iHome = selectedWilaya.homePrice;
      let iDesk = selectedWilaya.deskPrice;
      
      if (item.customShipping && item.customShipping.length > 0) {
        const custom = item.customShipping.find((c: any) => c.wilayaId === selectedWilaya.id);
        if (custom) {
          iHome = custom.homePrice;
          iDesk = custom.deskPrice;
        }
      }
      
      if (calcHome !== null && iHome !== null && iHome > calcHome) calcHome = iHome;
      if (calcDesk !== null && iDesk !== null && iDesk > calcDesk) calcDesk = iDesk;
    });
    
    return { homeFee: calcHome, deskFee: calcDesk };
  }, [selectedWilaya, items]);

  const shippingFee = formData.deliveryType === 'home' ? (homeFee || 0) : (deskFee || 0);

  const handleCheckout = (e: React.MouseEvent) => {
    triggerRipple(e as any);
    audio.playTap();
    setView('checkout');
  };

  const handleClose = () => {
    audio.playTap();
    closeCart();
    setTimeout(() => setView('cart'), 300);
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

  const handlePlaceOrder = async (e: React.MouseEvent) => {
    triggerRipple(e as any);
    audio.playTap();

    // Regex for Algerian phones: 05, 06, or 07 followed by 8 digits
    const phoneRegex = /^(05|06|07)[0-9]{8}$/;

    if (!formData.fullName || !formData.phone || !formData.wilaya) {
      toast.error(lang === 'ar' ? 'الرجاء ملء جميع الحقول الأساسية' : 'Please fill all basic fields');
      audio.playError();
      return;
    }

    if (!phoneRegex.test(formData.phone)) {
      toast.error(lang === 'ar' ? 'رقم الهاتف غير صالح. يجب أن يتكون من 10 أرقام ويبدأ بـ 05، 06، أو 07' : 'Invalid phone number format');
      audio.playError();
      return;
    }

    if (formData.deliveryType === 'home' && !formData.address) {
      toast.error(lang === 'ar' ? 'يرجى إدخال عنوان المنزل للتوصيل المنزلي' : 'Please provide home address');
      audio.playError();
      return;
    }
    
    setLoading(true);
    try {
      const res = await orderService.createOrder({
        items: items.map(i => ({ id: i.id, quantity: i.quantity })),
        shipping: {
          fullName: formData.fullName,
          phone: formData.phone,
          wilayaId: Number(formData.wilaya),
          deliveryType: formData.deliveryType,
          addressLine1: formData.address || 'Stop Desk',
          notes: ''
        }
      });
      
      if (res.success) {
        audio.playSuccess();
        toast.success(lang === 'ar' ? 'تم استلام طلبك بنجاح!' : 'Order placed successfully!');
        clearCart();
        closeCart();
        setTimeout(() => setView('cart'), 300);
        
        // Open WhatsApp for instant confirmation (Magic Touch!)
        const waMessage = encodeURIComponent(`مرحباً قصة، قمت بطلب بضاعة بقيمة ${(totalPrice() + shippingFee).toLocaleString('en-US')} د.ج. أرجو تأكيد الشحن لولاية ${selectedWilaya?.nameAr}.`);
        window.open(`https://wa.me/213555555555?text=${waMessage}`, '_blank');
      } else {
        throw new Error(res.error || 'Failed');
      }
    } catch (err: any) {
      audio.playError();
      toast.error(lang === 'ar' ? 'حدث خطأ، يرجى المحاولة لاحقاً' : 'An error occurred, please try again');
    } finally {
      setLoading(false);
    }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {view === 'checkout' && (
              <button 
                onClick={() => { audio.playTap(); setView('cart'); }}
                style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: '50%', color: 'var(--txt)', cursor: 'pointer', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ←
              </button>
            )}
            <h2 className="ttl" style={{ fontSize: '24px', margin: 0, color: 'var(--txt)', display: 'flex', flexDirection: 'column' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {view === 'cart' 
                  ? (lang === 'ar' ? 'سلة المشتريات' : 'Your Cart') 
                  : (lang === 'ar' ? 'تأكيد الطلب' : 'Checkout')} <AppleEmoji name={view === 'cart' ? "🛍️" : "📦"} />
              </span>
              <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--txt2)', marginTop: '6px', opacity: 0.9 }}>
                {view === 'cart' 
                  ? (lang === 'ar' ? 'رحلة الأناقة تبدأ من هنا' : 'The journey of elegance begins here')
                  : (lang === 'ar' ? 'خطوة أخيرة لتستلم قطعتك الفاخرة' : 'One last step to receive your luxury item')} <AppleEmoji name="✨" />
              </span>
            </h2>
          </div>
          <button onClick={handleClose} style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: '50%', color: 'var(--txt)', cursor: 'pointer', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            <XIcon />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {view === 'cart' ? (
            items.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--txt2)', marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '56px', marginBottom: '20px', opacity: 0.5 }}><AppleEmoji name="🛒" /></div>
                <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--txt)' }}>{t.emptyCart}</div>
                <p style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8, maxWidth: '240px', lineHeight: 1.6 }}>
                  {lang === 'ar' ? 'تصفح منتجاتنا الفاخرة وأضف ما يعجبك هنا' : 'Browse our luxury products and add them here'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '16px', background: 'var(--card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--bdr)', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
                    <Image src={item.image || 'https://placehold.co/70x70/FFE8D6/DC586D?text=🛍️'} alt={item.title} width={70} height={70} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '12px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--txt)', marginBottom: '4px' }}>{item.title}</div>
                      <div style={{ color: 'var(--p1)', fontWeight: 800, fontSize: '16px' }}>{Number(item.price).toLocaleString('en-US')} د.ج</div>
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
            )
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="co-form">
              <style>{`
                .co-input {
                  width: 100%; padding: 16px; border-radius: 12px; border: 1px solid var(--bdr);
                  background: var(--bg2); color: var(--txt); font-size: 15px; outline: none;
                  transition: all 0.3s ease;
                }
                .co-input:focus {
                  border-color: var(--p1); box-shadow: 0 0 0 3px rgba(255, 222, 89, 0.2);
                }
                .co-input.valid {
                  border-color: #22c55e;
                }
                .co-btn {
                  flex: 1; padding: 14px; border-radius: 12px; border: 1px solid var(--bdr);
                  background: var(--bg2); color: var(--txt); font-weight: 700; cursor: pointer;
                  transition: all 0.3s;
                }
                .co-btn.active {
                  background: var(--p1); color: #000; border-color: var(--p1);
                }
              `}</style>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--txt2)' }}>الاسم الكامل</label>
                <input 
                  type="text" className="co-input" placeholder="مثال: محمد الأمين"
                  value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--txt2)' }}>رقم الهاتف (05, 06, أو 07)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="tel" 
                    className={`co-input ${/^(05|06|07)[0-9]{8}$/.test(formData.phone) ? 'valid' : ''}`} 
                    placeholder="0555 55 55 55"
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value.replace(/\s/g, '')})}
                  />
                  {/^(05|06|07)[0-9]{8}$/.test(formData.phone) && (
                    <span style={{ position: 'absolute', left: lang === 'ar' ? '16px' : 'auto', right: lang === 'ar' ? 'auto' : '16px', top: '50%', transform: 'translateY(-50%)', color: '#22c55e' }}>✓</span>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--txt2)' }}>الولاية</label>
                <select 
                  className="co-input" 
                  value={formData.wilaya} 
                  onChange={e => setFormData({...formData, wilaya: e.target.value, deliveryType: 'desk'})}
                >
                  <option value="">اختر الولاية...</option>
                  {algeriaWilayas.map(w => (
                    <option key={w.id} value={w.id}>{w.id} - {lang === 'ar' ? w.nameAr : w.nameEn}</option>
                  ))}
                </select>
              </div>

              {formData.wilaya && (
                <div style={{ marginTop: '8px', animation: 'fadeIn 0.3s ease' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--txt2)' }}>طريقة التوصيل</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      className={`co-btn ${formData.deliveryType === 'desk' ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, deliveryType: 'desk'})}
                    >
                      مكتب ({deskFee} د.ج)
                    </button>
                    <button 
                      className={`co-btn ${formData.deliveryType === 'home' ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, deliveryType: 'home'})}
                    >
                      للمنزل ({homeFee} د.ج)
                    </button>
                  </div>
                </div>
              )}

              {formData.deliveryType === 'home' && formData.wilaya && (
                <div style={{ marginTop: '8px', animation: 'fadeIn 0.3s ease' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--txt2)' }}>عنوان المنزل بالتفصيل</label>
                  <input 
                    type="text" className="co-input" placeholder="اسم الحي، رقم العمارة..."
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid var(--bdr)', background: 'var(--card)', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--txt2)' }}>
            <span>{t.subtotal}</span>
            <span>{totalPrice().toLocaleString('en-US')} د.ج</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: 'var(--txt2)' }}>
            <span>{t.shipping}</span>
            <span>{view === 'checkout' ? `${shippingFee.toLocaleString('en-US')} د.ج` : (totalShipping() > 0 ? `${totalShipping().toLocaleString('en-US')} د.ج` : t.free)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: 900, fontSize: '20px', color: 'var(--txt)' }}>
            <span>{t.total}</span>
            <span style={{ color: 'var(--p1)' }}>{(totalPrice() + (view === 'checkout' ? shippingFee : totalShipping())).toLocaleString('en-US')} د.ج</span>
          </div>
          
          {view === 'cart' ? (
            <MagneticButton 
              onClick={handleCheckout} 
              disabled={items.length === 0}
              className="btn btn-p"
              style={{ 
                width: '100%', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 800, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                opacity: items.length === 0 ? 0.5 : 1, cursor: items.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {t.checkout}
              {items.length > 0 && <span style={{ display: 'inline-flex' }}><AppleEmoji name="💳" /></span>}
            </MagneticButton>
          ) : (
            <MagneticButton 
              onClick={handlePlaceOrder} 
              disabled={loading || items.length === 0}
              className="btn btn-p"
              style={{ 
                width: '100%', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 800, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                opacity: (loading || items.length === 0) ? 0.5 : 1, cursor: (loading || items.length === 0) ? 'not-allowed' : 'pointer',
                background: '#22c55e', color: '#FFF', borderColor: '#22c55e'
              }}
            >
              {loading ? 'جاري التأكيد...' : 'تأكيد الطلب الآن'}
              {!loading && <span style={{ display: 'inline-flex' }}><AppleEmoji name="🚀" /></span>}
            </MagneticButton>
          )}
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
