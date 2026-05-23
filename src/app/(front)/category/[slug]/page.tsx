"use client";

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useLangStore } from '@/store/langStore';
import { useTranslation } from '@/utils/translations';
import { ProductCard } from '@/components/ProductCard';
import { ProductSkeleton } from '@/components/ProductSkeleton';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { audio } from '@/utils/audioEngine';
import { productService, Product } from '@/services/productService';
import gsap from 'gsap';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;
  const router = useRouter();
  const { lang } = useLangStore();
  const t = useTranslation(lang);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>(slug);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 50;
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [items, categories] = await Promise.all([
          productService.getAllProducts(lang, slug),
          productService.getCategories(),
        ]);
        if (cancelled) return;
        
        // Find category name
        const cat = (categories || []).find((c: any) => c.slug === slug);
        if (cat) {
          setCategoryName(cat.title?.ar || cat.title?.en || cat.title || slug);
        } else {
          // Check hardcoded
          const hardcoded: any = {
            clothing: lang === 'ar' ? 'ملابس' : 'Clothing',
            electronics: lang === 'ar' ? 'إلكترونيات' : 'Electronics',
            shoes: lang === 'ar' ? 'أحذية' : 'Shoes',
            care: lang === 'ar' ? 'عناية وجمال' : 'Beauty & Care',
            watches: lang === 'ar' ? 'ساعات وإكسسوارات' : 'Watches',
          };
          if (hardcoded[slug]) {
            setCategoryName(hardcoded[slug]);
          }
        }
        
        // Filter locally just in case the API returned all
        const catProducts = items.filter(p => p.categoryId === slug);
        setProducts(catProducts);
      } catch (err) {
        console.error("Failed to load category products", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug, lang]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sections = root.querySelectorAll('[data-shop-reveal]');
    gsap.fromTo(
      sections,
      { y: 8, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.24, stagger: 0.05, ease: 'power2.out' }
    );
  }, [products.length, currentPage, loading]);

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const paginatedProducts = products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div ref={rootRef} style={{ paddingTop: '10px', paddingBottom: '120px' }}>
      <div style={{ padding: '0 13px 20px', display: 'flex', alignItems: 'center', gap: '12px' }} data-shop-reveal>
        <button 
          onClick={() => { audio.playTap(); router.back(); }}
          style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'var(--card)', boxShadow: '0 4px 12px var(--shd)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <span style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none', fontSize: '18px' }}>➔</span>
        </button>
        <div className="ttl" style={{ flex: 1, fontSize: '24px' }}>
          {categoryName}
        </div>
      </div>
      
      {loading ? (
        <div className="pg" data-shop-reveal>
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty" data-shop-reveal>
          <span className="e-ico"><CategoryIcon name="🔍" size={48} className="text-primary" /></span>
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>
            {lang === 'ar' ? 'لا توجد منتجات في هذا القسم' : 'No products found in this category'}
          </div>
          <button 
            className="btn btn-p" 
            style={{ width: 'auto', marginTop: '16px', padding: '12px 32px' }} 
            onClick={() => { audio.playTap(); router.push('/shop'); }}
          >
            {lang === 'ar' ? 'تصفح كل المنتجات' : 'Browse All Products'}
          </button>
        </div>
      ) : (
        <>
          <div className="pg" data-shop-reveal>
            {paginatedProducts.map(product => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '30px' }} data-shop-reveal>
              <button 
                onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); audio.playTap(); }} 
                disabled={currentPage === 1} 
                className="ib"
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1) {
                  return (
                    <button 
                      key={pageNum} 
                      onClick={() => { setCurrentPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); audio.playTap(); }}
                      className={`ib ${currentPage === pageNum ? 'on' : ''}`}
                      style={currentPage === pageNum ? { background: 'var(--p1)', color: 'white', borderColor: 'var(--p1)' } : {}}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} style={{ color: 'var(--txt2)', display: 'flex', alignItems: 'flex-end', padding: '0 4px' }}>...</span>;
                }
                return null;
              })}
              <button 
                onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); audio.playTap(); }} 
                disabled={currentPage === totalPages} 
                className="ib"
              >
                &gt;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
