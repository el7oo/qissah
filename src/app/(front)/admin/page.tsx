"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { audio } from '@/utils/audioEngine';
import { triggerRipple } from '@/utils/visualEffects';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

import { useProductStore, Product } from '@/store/productStore';
import { orderService } from '@/services/orderService';
import { productService, Product as CatalogProduct } from '@/services/productService';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('products');
  const { products, addProduct, updateProduct, removeProduct } = useProductStore();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [orderMeta, setOrderMeta] = useState<Record<string, CatalogProduct>>({});
  const [orderError, setOrderError] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [orderLimit, setOrderLimit] = useState(30);

  const fetchOrders = (limit: number) => {
    setLoadingOrders(true);
    setOrderError(null);
    orderService
      .getAllOrders(limit)
      .then(data => setOrders(data))
      .catch(err => setOrderError(err.message || 'Failed to fetch orders.'))
      .finally(() => setLoadingOrders(false));
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders(orderLimit);
    }
  }, [activeTab, orderLimit]);

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) return;
    setDeletingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders?id=${orderId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل الحذف');
      setOrders(orders.filter(o => o.id !== orderId));
    } catch (err) {
      alert('خطأ أثناء حذف الطلب');
    } finally {
      setDeletingOrderId(null);
    }
  };

  useEffect(() => {
    if (activeTab !== 'orders' || orders.length === 0) return;
    const ids = Array.from(
      new Set(
        orders.flatMap((order) =>
          Array.isArray(order.items) ? order.items.map((item: any) => String(item.id || '').trim()) : []
        ).filter(Boolean)
      )
    );
    if (ids.length === 0) return;
    let cancelled = false;
    setLoadingMetadata(true);
    productService
      .getProductsByIds(ids)
      .then((rows) => {
        if (cancelled) return;
        const map: Record<string, CatalogProduct> = {};
        rows.forEach((p) => {
          map[p.id] = p;
        });
        setOrderMeta(map);
      })
      .finally(() => {
        if (!cancelled) setLoadingMetadata(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, orders]);

  const handleLogout = async (e: React.MouseEvent) => {
    triggerRipple(e as any);
    audio.playTap();
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    router.push('/');
  };

  const handleSave = () => {
    audio.playTap();
    if (editingId === 'new') {
      addProduct(formData as Omit<Product, 'id'>);
    } else if (editingId) {
      updateProduct(editingId, formData);
    }
    setEditingId(null);
    setFormData({});
  };

  const handleEdit = (p: Product) => {
    audio.playTap();
    setFormData(p);
    setEditingId(p.id);
  };

  const handleDelete = (id: string) => {
    audio.playTap();
    if (confirm('هل أنت متأكد من الحذف؟')) {
      removeProduct(id);
    }
  };

  return (
    <div style={{ paddingTop: '10px', paddingBottom: '120px' }}>
      <div style={{ padding: '0 13px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="ttl" style={{ fontSize: '24px', color: 'var(--p1)' }}>
          لوحة تحكم المشرف
        </div>
        <button 
          onClick={handleLogout}
          style={{
            background: 'rgba(255, 50, 50, 0.08)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 50, 50, 0.2)',
            color: '#ff4444',
            padding: '8px 16px',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'var(--font-alexandria), sans-serif',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(255, 50, 50, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 50, 50, 0.2)';
            e.currentTarget.style.background = 'rgba(255, 50, 50, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 50, 50, 0.1)';
            e.currentTarget.style.background = 'rgba(255, 50, 50, 0.08)';
          }}
        >
          خروج <CategoryIcon name="🚪" size={18} className="text-primary" />
        </button>
      </div>

      <div className="adm-tabs" style={{ marginBottom: '20px', padding: '0 13px' }}>
        <button className={`atab ${activeTab === 'dashboard' ? 'on' : ''}`} onClick={(e) => { triggerRipple(e as any); audio.playTap(); setActiveTab('dashboard'); }}>الاحصائيات</button>
        <button className={`atab ${activeTab === 'products' ? 'on' : ''}`} onClick={(e) => { triggerRipple(e as any); audio.playTap(); setActiveTab('products'); }}>المنتجات والفئات</button>
        <button className={`atab ${activeTab === 'orders' ? 'on' : ''}`} onClick={(e) => { triggerRipple(e as any); audio.playTap(); setActiveTab('orders'); }}>الطلبات</button>
      </div>

      <div className="fw" style={{ padding: '0 13px', border: 'none', background: 'transparent' }}>
        {activeTab === 'products' && (
          <div className="pf-box" style={{ padding: '30px 20px', textAlign: 'center' }}>
            <CategoryIcon name="🛍️" size={48} className="text-primary" />
            <h2 style={{ color: 'var(--p1)', marginTop: '10px', fontSize: '20px' }}>إدارة المنتجات والفئات</h2>
            <p style={{ color: 'var(--txt2)', fontSize: '14px', marginTop: '10px', lineHeight: '1.6' }}>
              تم ربط لوحة التحكم الخاصة بك بنظام <b>Sanity CMS</b> بنجاح!
              <br/>
              من خلال النظام الجديد يمكنك:
              <br/>
              • إضافة عدد لا محدود من الفئات الجديدة
              <br/>
              • رفع صور متعددة للمنتج الواحد
              <br/>
              • التحكم الكامل في المخزون والأسعار والتخفيضات
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '25px' }}>
              <button 
                onClick={() => router.push('/studio')}
                style={{
                  background: 'var(--p1)',
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '24px',
                  fontSize: '15px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-alexandria), sans-serif',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(220, 88, 109, 0.3)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                الدخول إلى منصة إدارة المنتجات (Sanity)
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'dashboard' && (
          <div className="pf-box" style={{ padding: '20px', textAlign: 'center' }}>
            <CategoryIcon name="👑" size={48} className="text-primary" />
            <h2 style={{ color: 'var(--p1)', marginTop: '10px' }}>مرحباً بك يا مدير!</h2>
            <p style={{ color: 'var(--txt2)', fontSize: '14px', marginTop: '5px' }}>
              غرفة الأدمن جاهزة. تم الآن دمج Sanity Studio بالكامل لإدارة آلاف المنتجات بكفاءة!
            </p>
            <button 
              onClick={() => router.push('/studio')}
              style={{
                marginTop: '15px',
                background: 'linear-gradient(45deg, #f03e3e, #f783ac)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '24px',
                fontSize: '15px',
                fontWeight: 700,
                fontFamily: 'var(--font-alexandria), sans-serif',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(240, 62, 62, 0.3)'
              }}
            >
              الدخول إلى Sanity Studio
            </button>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="pf-box" style={{ padding: '20px', textAlign: 'center' }}>
            <CategoryIcon name="📦" size={48} className="text-primary" />
            <h2 style={{ color: 'var(--p1)', marginTop: '10px' }}>الطلبات الجديدة</h2>
            <div style={{ marginTop: '10px', marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', color: 'var(--txt2)', marginLeft: '10px' }}>عدد الطلبات المعروضة:</label>
              <select 
                value={orderLimit} 
                onChange={(e) => setOrderLimit(Number(e.target.value))}
                style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--bdr)', background: 'var(--bg)', color: 'var(--txt)' }}
              >
                <option value={30}>أحدث 30 طلب</option>
                <option value={100}>أحدث 100 طلب</option>
                <option value={500}>أحدث 500 طلب</option>
              </select>
            </div>
            {loadingOrders ? (
              <p style={{ color: 'var(--txt2)', fontSize: '14px', marginTop: '15px' }}>جاري جلب الطلبات...</p>
            ) : orderError ? (
              <div style={{ color: '#ff4444', fontSize: '14px', marginTop: '15px', background: 'rgba(255,50,50,0.1)', padding: '12px', borderRadius: '8px' }}>
                <p style={{ fontWeight: 'bold' }}>حدث خطأ أثناء جلب الطلبات:</p>
                <p>{orderError}</p>
                <p style={{ marginTop: '8px', fontSize: '12px' }}>* ملاحظة: تأكد من أن تاريخ النظام بجهازك هو التاريخ الحقيقي (ليس سنة 2026)، فهذا قد يسبب رفض طلبات Firebase.</p>
              </div>
            ) : orders.length === 0 ? (
              <p style={{ color: 'var(--txt2)', fontSize: '14px', marginTop: '15px' }}>لا توجد طلبات حالياً.</p>
            ) : (
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'right', direction: 'rtl' }}>
                {orders.map((order) => (
                  <div key={order.id} style={{ background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: '12px', padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bdr)', paddingBottom: '10px', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 'bold' }}>رقم الطلب: {order.id.substring(0, 8)}...</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ color: 'var(--p1)', fontWeight: 'bold', direction: 'ltr' }}>{order.total_amount?.toLocaleString()} دج</span>
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          disabled={deletingOrderId === order.id}
                          style={{
                            background: '#ff4444', color: 'white', border: 'none', borderRadius: '6px', 
                            padding: '4px 10px', fontSize: '12px', cursor: 'pointer', opacity: deletingOrderId === order.id ? 0.5 : 1
                          }}
                        >
                          {deletingOrderId === order.id ? 'جاري الحذف...' : 'حذف'}
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--txt)' }}>
                      <p><b>العميل:</b> {order.shipping_address?.fullName}</p>
                      <p><b>الهاتف:</b> <span dir="ltr" style={{ display: 'inline-block' }}>{order.shipping_address?.phone}</span></p>
                      <p><b>الولاية:</b> {order.shipping_address?.city}</p>
                      <p><b>العنوان:</b> {order.shipping_address?.addressLine1}</p>
                      <p><b>التاريخ:</b> {new Date(order.created_at).toLocaleDateString('ar-DZ')} {new Date(order.created_at).toLocaleTimeString('ar-DZ')}</p>
                    </div>
                    <div style={{ marginTop: '10px', background: 'var(--bg2)', padding: '10px', borderRadius: '8px' }}>
                      <b>المنتجات:</b>
                      {loadingMetadata ? (
                        <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--txt2)' }}>
                          مزامنة بيانات Sanity...
                        </p>
                      ) : null}
                      <ul style={{ margin: '5px 0 0 20px', fontSize: '13px' }}>
                        {order.items?.map((item: any, i: number) => (
                          <li key={i}>
                            {item.title} (الكمية: {item.quantity}) - {item.price?.toLocaleString()} دج
                            {orderMeta[item.id] ? (
                              <div style={{ fontSize: '11px', color: 'var(--txt2)', marginTop: '3px', direction: 'ltr', textAlign: 'left' }}>
                                SKU: {item.id.slice(0, 12)}... | slug: {orderMeta[item.id].slug || 'n/a'} | category: {orderMeta[item.id].categoryId || 'n/a'} | stock: {orderMeta[item.id].stockStatus || 'n/a'}
                              </div>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
