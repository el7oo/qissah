export interface Product {
  id: string;
  slug?: string;
  categoryId: string;
  title: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  shippingPrice: string;
  customShipping?: { wilayaId: number, homePrice: number, deskPrice: number }[];
  stockStatus?: string;
  rating: string;
  description?: string;
  image: string;
  images?: string[];
}

export type ProductPageResult = {
  products: Product[];
  paging?: {
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
};

export const productService = {
  async getAllProducts(_lang?: string, categoryId?: string): Promise<Product[]> {
    const first = await this.getProductsPage(1, 250, categoryId);
    if (!first.paging?.hasMore) return first.products;

    const results = [...first.products];
    let page = 2;
    let hasMore = true;
    while (hasMore && page <= 20) {
      const next = await this.getProductsPage(page, 250, categoryId);
      results.push(...next.products);
      hasMore = Boolean(next.paging?.hasMore);
      page += 1;
    }
    return results;
  },

  async getProductsPage(page = 1, pageSize = 100, categoryId?: string): Promise<ProductPageResult> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    if (categoryId) params.set('categoryId', categoryId);
    const res = await fetch(`/api/products?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store',
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload?.error || 'Failed to fetch products');
    }
    const payload = await res.json();
    return {
      products: Array.isArray(payload.products) ? payload.products : [],
      paging: payload?.paging,
    };
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const res = await fetch(`/api/products?slug=${encodeURIComponent(slug)}`, {
      method: 'GET',
      cache: 'no-store',
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload?.error || 'Failed to fetch product');
    }
    const payload = await res.json();
    const list = Array.isArray(payload.products) ? payload.products : [];
    return list[0] || null;
  },

  async getCategories() {
    const res = await fetch('/api/products?type=categories', {
      method: 'GET',
      cache: 'no-store',
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload?.error || 'Failed to fetch categories');
    }
    const payload = await res.json();
    return Array.isArray(payload.categories) ? payload.categories : [];
  },

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    const params = new URLSearchParams();
    params.set('ids', ids.join(','));
    const res = await fetch(`/api/products?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store',
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload?.error || 'Failed to fetch products by ids');
    }
    const payload = await res.json();
    return Array.isArray(payload.products) ? payload.products : [];
  }
};
