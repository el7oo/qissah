"use client";

import { useCartStore } from '@/store/cartStore';
import { useLangStore } from '@/store/langStore';
import { useTranslation } from '@/utils/translations';
import { useRouter } from 'next/navigation';
import { audio } from '@/utils/audioEngine';
import { triggerRipple } from '@/utils/visualEffects';
import { MagneticButton } from './MagneticButton';
import { ShoppingBag, Package, Sparkles, CreditCard, Rocket, Trash2, Plus, Minus, ArrowRight, ArrowLeft, X } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { algeriaWilayas } from '@/lib/algeria-wilayas';
import { orderService } from '@/services/orderService';
import toast from 'react-hot-toast';

export function SideCart() {
  const { items, isCartOpen, closeCart, updateQuantity, removeItem, totalPrice, totalShipping, clearCart } = useCartStore();
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
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998,
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={handleClose}
      />
      <div 
        style={{
          position: 'fixed', top: '16px', right: lang === 'ar' ? 'auto' : '16px', left: lang === 'ar' ? '16px' : 'auto',
          bottom: '16px', width: '100%', maxWidth: '440px', 
          background: 'var(--surf)', 
          backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '32px',
          zIndex: 9999,
          boxShadow: '0 20px 80px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column',
          animation: lang === 'ar' ? 'slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'transparent' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            {view === 'checkout' && (
              <button 
                onClick={() => { audio.playTap(); setView('cart'); }}
                style={{ background: 'var(--card)', border: '1px solid var(--bdr)', borderRadius: '50%', color: 'var(--txt)', cursor: 'pointer', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', marginTop: '2px', boxShadow: '0 4px 12px var(--shd)' }}
              >
                {lang === 'ar' ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
              </button>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 className="ttl" style={{ fontSize: '28px', margin: 0, color: 'var(--txt)', display: 'flex', alignItems: 'center', gap: '10px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                {view === 'cart' ? (lang === 'ar' ? 'سلة المشتريات' : 'Your Cart') : (lang === 'ar' ? 'تأكيد الطلب' : 'Checkout')} 
                {view === 'cart' ? <ShoppingBag className="text-primary" size={28} /> : <Package className="text-primary" size={28} />}
              </h2>
              <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--txt2)', marginTop: '4px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                {view === 'cart' 
                  ? (lang === 'ar' ? 'رحلة الأناقة تبدأ من هنا' : 'The journey of elegance begins here')
                  : (lang === 'ar' ? 'خطوة أخيرة لتستلم قطعتك الفاخرة' : 'One last step to receive your luxury item')}
                <Sparkles size={14} className="text-primary" />
              </span>
            </div>
          </div>
          <button onClick={handleClose} style={{ background: 'var(--card)', border: '1px solid var(--bdr)', borderRadius: '50%', color: 'var(--txt)', cursor: 'pointer', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 4px 12px var(--shd)' }}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {view === 'cart' ? (
            items.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--txt2)', marginTop: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ marginBottom: '24px', opacity: 0.8, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }}>
                  <ShoppingBag size={80} strokeWidth={1} className="text-primary" />
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--txt)', fontFamily: 'var(--font-cormorant), serif' }}>{t.emptyCart}</div>
                <p style={{ fontSize: '15px', marginTop: '12px', opacity: 0.8, maxWidth: '260px', lineHeight: 1.6 }}>
                  {lang === 'ar' ? 'تصفح منتجاتنا الفاخرة وأضف ما يعجبك هنا لتبدأ رحلتك' : 'Browse our luxury products and add them here to start your journey'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '16px', background: 'var(--card)', padding: '16px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', boxShadow: '0 8px 32px var(--shd)', transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    <Image src={item.image || 'https://placehold.co/80x80/FFE8D6/DC586D?text=🛍️'} alt={item.title} width={80} height={80} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--txt)', marginBottom: '6px', lineHeight: 1.4 }}>{item.title}</div>
                      <div style={{ color: 'var(--p1)', fontWeight: 900, fontSize: '18px', fontFamily: 'var(--font-cormorant), serif', letterSpacing: '0.5px' }}>{Number(item.price).toLocaleString('en-US')} د.ج</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg2)', padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--bdr)' }}>
                          <button onClick={(e) => handleUpdateQty(item.id, item.quantity - 1, e)} style={{ background: 'none', border: 'none', color: 'var(--txt)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} strokeWidth={3} /></button>
                          <span style={{ fontSize: '15px', fontWeight: 800, minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                          <button onClick={(e) => handleUpdateQty(item.id, item.quantity + 1, e)} style={{ background: 'none', border: 'none', color: 'var(--txt)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} strokeWidth={3} /></button>
                        </div>
                        <button onClick={(e) => handleRemove(item.id, e)} style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.2)', color: '#ff4444', cursor: 'pointer', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="co-form">
              <style>{`
                .co-input {
                  width: 100%; padding: 18px 20px; border-radius: 16px; border: 1px solid var(--bdr);
                  background: var(--card); color: var(--txt); font-size: 15px; outline: none;
                  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                  box-shadow: inset 0 2px 8px rgba(0,0,0,0.02);
                }
                .co-input:focus {
                  border-color: var(--p1); box-shadow: 0 0 0 4px var(--glow), inset 0 2px 8px rgba(0,0,0,0.02);
                  transform: translateY(-2px);
                }
                .co-input.valid {
                  border-color: #22c55e;
                }
                .co-btn {
                  flex: 1; padding: 16px; border-radius: 16px; border: 1px solid var(--bdr);
                  background: var(--card); color: var(--txt); font-weight: 800; cursor: pointer;
                  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .co-btn.active {
                  background: linear-gradient(135deg, var(--p1), var(--p2)); color: #fff; border-color: transparent;
                  box-shadow: 0 8px 24px var(--glow); transform: translateY(-2px);
                }
              `}</style>
              
              <div style={{ animation: 'fadeIn 0.4s ease 0.1s both' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '15px', color: 'var(--txt2)', fontWeight: 600 }}>الاسم الكامل</label>
                <input 
                  type="text" className="co-input" placeholder="مثال: محمد الأمين"
                  value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>

              <div style={{ animation: 'fadeIn 0.4s ease 0.2s both' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '15px', color: 'var(--txt2)', fontWeight: 600 }}>رقم الهاتف (05, 06, أو 07)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="tel" 
                    className={`co-input ${/^(05|06|07)[0-9]{8}$/.test(formData.phone) ? 'valid' : ''}`} 
                    placeholder="0555 55 55 55"
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value.replace(/\s/g, '')})}
                  />
                  {/^(05|06|07)[0-9]{8}$/.test(formData.phone) && (
                    <span style={{ position: 'absolute', left: lang === 'ar' ? '20px' : 'auto', right: lang === 'ar' ? 'auto' : '20px', top: '50%', transform: 'translateY(-50%)', color: '#22c55e', fontWeight: 800 }}>✓</span>
                  )}
                </div>
              </div>

              <div style={{ animation: 'fadeIn 0.4s ease 0.3s both' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '15px', color: 'var(--txt2)', fontWeight: 600 }}>الولاية</label>
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
                <div style={{ marginTop: '4px', animation: 'fadeIn 0.4s ease' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontSize: '15px', color: 'var(--txt2)', fontWeight: 600 }}>طريقة التوصيل</label>
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
                <div style={{ marginTop: '4px', animation: 'fadeIn 0.4s ease' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontSize: '15px', color: 'var(--txt2)', fontWeight: 600 }}>عنوان المنزل بالتفصيل</label>
                  <input 
                    type="text" className="co-input" placeholder="اسم الحي، رقم العمارة..."
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: '24px', background: 'var(--card)', borderTop: '1px solid rgba(255,255,255,0.05)', borderRadius: '0 0 32px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '15px', color: 'var(--txt2)' }}>
            <span>{t.subtotal}</span>
            <span style={{ fontWeight: 600 }}>{totalPrice().toLocaleString('en-US')} د.ج</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '15px', color: 'var(--txt2)' }}>
            <span>{t.shipping}</span>
            <span style={{ fontWeight: 600 }}>{view === 'checkout' ? `${shippingFee.toLocaleString('en-US')} د.ج` : (totalShipping() > 0 ? `${totalShipping().toLocaleString('en-US')} د.ج` : t.free)}</span>
          </div>
          
          <div style={{ height: '1px', background: 'var(--bdr)', margin: '0 0 20px 0', opacity: 0.5 }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontWeight: 900, fontSize: '24px', color: 'var(--txt)', fontFamily: 'var(--font-cormorant), serif' }}>
            <span>{t.total}</span>
            <span style={{ color: 'var(--p1)' }}>{(totalPrice() + (view === 'checkout' ? shippingFee : totalShipping())).toLocaleString('en-US')} د.ج</span>
          </div>
          
          {view === 'cart' ? (
            <MagneticButton 
              onClick={handleCheckout} 
              disabled={items.length === 0}
              className="btn btn-p"
              style={{ 
                width: '100%', padding: '18px', borderRadius: '16px', fontSize: '18px', fontWeight: 800, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                opacity: items.length === 0 ? 0.5 : 1, cursor: items.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: '0 12px 32px var(--glow)'
              }}
            >
              {t.checkout}
              {items.length > 0 && <span style={{ display: 'inline-flex' }}><CreditCard size={20} /></span>}
            </MagneticButton>
          ) : (
            <MagneticButton 
              onClick={handlePlaceOrder} 
              disabled={loading || items.length === 0}
              className="btn btn-p"
              style={{ 
                width: '100%', padding: '18px', borderRadius: '16px', fontSize: '18px', fontWeight: 800, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                opacity: (loading || items.length === 0) ? 0.5 : 1, cursor: (loading || items.length === 0) ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#FFF', borderColor: 'transparent',
                boxShadow: '0 12px 32px rgba(34, 197, 94, 0.4)'
              }}
            >
              {loading ? 'جاري التأكيد...' : 'تأكيد الطلب الآن'}
              {!loading && <span style={{ display: 'inline-flex' }}><Rocket size={20} /></span>}
            </MagneticButton>
          )}
        </div>
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
