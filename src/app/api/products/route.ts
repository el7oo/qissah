import { NextResponse } from 'next/server';
import { fetchCategoriesFromSanity, fetchProductsByIds, fetchProductsFromSanity } from '@/lib/server/sanityServer';

function mapProduct(p: any) {
  const currentPrice = Number(p.discountPrice ?? p.price ?? 0);
  const originalPrice = Number(p.price ?? 0);
  const hasDiscount = Number.isFinite(originalPrice) && originalPrice > currentPrice;
  const discount = hasDiscount
    ? `-${Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}%`
    : undefined;

  return {
    id: p._id,
    slug: p.slug || '',
    categoryId: p.categoryId || '',
    title: p.title || '',
    price: String(currentPrice || 0),
    oldPrice: hasDiscount ? String(originalPrice) : undefined,
    discount,
    shippingPrice: String(p.shippingCost ?? 0),
    customShipping: Array.isArray(p.customShipping) ? p.customShipping : [],
    stockStatus: p.stockStatus || 'unknown',
    description: p.description || '',
    rating: '5.0 · 120',
    image:
      p.mainImage ||
      (Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery[0] : null) ||
      'https://placehold.co/300x300/FFE8D6/DC586D?text=No+Image',
    images: Array.isArray(p.gallery) ? p.gallery : [],
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const ids = (url.searchParams.get('ids') || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    if (type === 'categories') {
      const categories = await fetchCategoriesFromSanity();
      return NextResponse.json({
        categories: categories.map((c) => ({
          _id: c._id,
          title: c.title,
          slug: c.slug,
          icon: c.icon || '📌',
        })),
      });
    }

    const categoryId = url.searchParams.get('categoryId') || undefined;
    const slug = url.searchParams.get('slug') || undefined;
    const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
    const pageSize = Math.min(250, Math.max(1, Number(url.searchParams.get('pageSize') || '100')));
    const offset = (page - 1) * pageSize;

    const products = ids.length > 0
      ? await fetchProductsByIds(ids)
      : await fetchProductsFromSanity({ categoryId, offset, limit: pageSize });
    const filtered = slug ? products.filter((p) => p.slug === slug) : products;
    return NextResponse.json({
      products: filtered.map(mapProduct),
      paging: ids.length > 0
        ? undefined
        : {
            page,
            pageSize,
            hasMore: filtered.length === pageSize,
          },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to fetch products from Sanity.',
        detail: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
