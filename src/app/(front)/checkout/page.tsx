"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useLangStore } from '@/store/langStore';
import { useTranslation } from '@/utils/translations';
import { orderService } from '@/services/orderService';
import toast from 'react-hot-toast';
import { audio } from '@/utils/audioEngine';
import { triggerConfetti, triggerRipple } from '@/utils/visualEffects';
import { AppleEmoji } from '@/components/ui/AppleEmoji';
import { algeriaWilayas } from '@/lib/algeria-wilayas';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { lang } = useLangStore();
  const t = useTranslation(lang);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    wilaya: '',
    address: '',
    notes: '',
    deliveryType: 'home' as 'home' | 'desk'
  });

  const selectedWilaya = useMemo(() => {
    return algeriaWilayas.find(w => w.id.toString() === formData.wilaya);
  }, [formData.wilaya]);

  useEffect(() => {
    setIsMounted(true);
  }, []);



  const { homeFee, deskFee } = useMemo(() => {
    if (!selectedWilaya) return { homeFee: 0, deskFee: 0 };
    
    let calcHome = 0;
    let calcDesk = 0;
    
    if (selectedWilaya) {
      let sumHome = 0;
      let sumDesk = 0;
      
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
        
        if (iHome > calcHome) calcHome = iHome;
        if (iDesk > calcDesk) calcDesk = iDesk;
      });
    }
    
    return { homeFee: calcHome, deskFee: calcDesk };
  }, [selectedWilaya, items]);

  const shippingFee = formData.deliveryType === 'home' ? homeFee : deskFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeliveryTypeChange = (type: 'home' | 'desk') => {
    setFormData({ ...formData, deliveryType: type });
  };

  const handlePlaceOrder = async (e: React.MouseEvent) => {
    triggerRipple(e as any);
    audio.playTap();

    if (!formData.fullName || !formData.phone || !formData.wilaya || (formData.deliveryType === 'home' && !formData.address)) {
      toast.error(t.fillFields || 'الرجاء ملء جميع الحقول');
      audio.playError();
      return;
    }
    
    setLoading(true);
    try {
      await orderService.createOrder({
        items: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
        shipping: {
          fullName: formData.fullName,
          phone: formData.phone,
          wilayaId: Number(formData.wilaya),
          deliveryType: formData.deliveryType,
          addressLine1: formData.deliveryType === 'home' ? formData.address : '',
          notes: formData.notes,
        }
      });

      toast.success(t.orderSuccess);
      clearCart();
      router.push('/success');
    } catch (err: any) {
      audio.playError();
      toast.error(err.message || t.orderError);
      setLoading(false);
    }
  };

  const tot = totalPrice();

  if (!isMounted) {
    return <div style={{ paddingTop: '10px', paddingBottom: '120px', minHeight: '100vh' }} />;
  }

  return (
    <div style={{ paddingTop: '10px', paddingBottom: '120px' }}>
      <div style={{ padding: '0 13px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="ttl" style={{ flex: 1 }}>{t.checkoutTitle}</div>
      </div>
      <div className="fw" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="fg">
          <input 
            className="fi" 
            name="fullName" 
            placeholder={t.fullName} 
            dir="auto" 
            value={formData.fullName} 
            onChange={handleInputChange} 
          />
        </div>
        <div className="fg">
          <input 
            className="fi" 
            name="phone" 
            placeholder={t.phone} 
            type="tel" 
            dir="ltr" 
            style={{ textAlign: lang === 'ar' ? 'right' : 'left' }} 
            value={formData.phone} 
            onChange={handleInputChange} 
          />
        </div>
        <div className="fg">
          <select 
            className="fi opt-styled" 
            name="wilaya" 
            value={formData.wilaya} 
            onChange={handleInputChange}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            <option value="" disabled>{t.wilaya}</option>
            {algeriaWilayas.map(w => (
              <option key={w.id} value={w.id}>{w.id} - {lang === 'ar' ? w.nameAr : w.nameEn}</option>
            ))}
          </select>
        </div>
        
        {selectedWilaya && (
          <div className="fg" style={{ display: 'flex', gap: '10px', marginTop: '10px', marginBottom: '10px' }}>
            <div 
              onClick={() => handleDeliveryTypeChange('home')}
              style={{ 
                flex: 1, 
                padding: '12px', 
                borderRadius: '12px', 
                border: formData.deliveryType === 'home' ? '2px solid var(--p1)' : '2px solid var(--bdr)',
                background: formData.deliveryType === 'home' ? 'var(--p1-10)' : 'var(--bg2)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: 'bold', color: formData.deliveryType === 'home' ? 'var(--p1)' : 'var(--txt1)' }}>
                {lang === 'ar' ? 'توصيل للمنزل' : 'Home Delivery'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--txt2)', marginTop: '4px' }}>
                {homeFee} دج
              </div>
            </div>
            <div 
              onClick={() => handleDeliveryTypeChange('desk')}
              style={{ 
                flex: 1, 
                padding: '12px', 
                borderRadius: '12px', 
                border: formData.deliveryType === 'desk' ? '2px solid var(--p1)' : '2px solid var(--bdr)',
                background: formData.deliveryType === 'desk' ? 'var(--p1-10)' : 'var(--bg2)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: 'bold', color: formData.deliveryType === 'desk' ? 'var(--p1)' : 'var(--txt1)' }}>
                {lang === 'ar' ? 'توصيل للمكتب' : 'Desk Delivery'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--txt2)', marginTop: '4px' }}>
                {deskFee} دج
              </div>
            </div>
          </div>
        )}

        {formData.deliveryType === 'home' && (
          <div className="fg">
            <input 
              className="fi" 
              name="address" 
              placeholder={t.address} 
              dir="auto" 
              value={formData.address} 
              onChange={handleInputChange} 
            />
          </div>
        )}

        <div className="fg">
          <textarea 
            className="fi" 
            name="notes" 
            placeholder={lang === 'ar' ? 'ملاحظات إضافية (مثال: لون الحذاء، مقاس معين...)' : 'Additional notes (e.g., shoe color, size...)'} 
            dir="auto" 
            rows={3}
            style={{ resize: 'vertical', paddingTop: '12px' }}
            value={formData.notes} 
            onChange={handleInputChange as any} 
          />
        </div>
      </div>
      
      <div className="ck-sum" style={{ maxWidth: '600px', margin: '0 auto 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', color: 'var(--txt2)' }}>
          <span>{t.subtotal}</span><span>{tot.toLocaleString()} دج</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '12px', color: 'var(--txt2)' }}>
          <span>{t.shipping}</span><span id="sf">{shippingFee > 0 ? `${shippingFee} دج` : t.free}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '16px', marginBottom: '16px' }}>
          <span>{t.total}</span><span style={{ color: 'var(--p1)' }} id="gt">{(tot + shippingFee).toLocaleString()} دج</span>
        </div>
        <button className="btn btn-p" onClick={handlePlaceOrder} disabled={loading} style={{ padding: '16px', fontSize: '16px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '100%', opacity: loading ? 0.7 : 1 }}>
          {loading ? t.processing : t.placeOrder}
        </button>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: '100px', boxShadow: '0 4px 16px var(--glow)', backdropFilter: 'blur(10px)' }}>
            <span className="ttl" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--p1)', letterSpacing: '0.5px' }}>{t.securePay}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
