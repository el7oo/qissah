import { createClient } from 'next-sanity';

type SanityProductRecord = {
  _id: string;
  slug?: string;
  title: string;
  price: number;
  discountPrice?: number;
  shippingCost?: number;
  customShipping?: { wilayaId: number; homePrice: number; deskPrice: number }[];
  stockStatus?: string;
  description?: string;
  mainImage?: string;
  gallery?: string[];
  categoryId?: string;
};

type FetchProductsOptions = {
  categoryId?: string;
  offset?: number;
  limit?: number;
};

function requiredSanityEnv() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production';
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || '2024-05-03';

  if (!projectId) {
    throw new Error('Sanity project is not configured.');
  }

  return { projectId, dataset, apiVersion };
}

function createSanityServerClient() {
  const { projectId, dataset, apiVersion } = requiredSanityEnv();
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
  });
}

export async function fetchProductsFromSanity(
  options?: FetchProductsOptions
): Promise<SanityProductRecord[]> {
  const client = createSanityServerClient();
  const offset = Math.max(0, Number(options?.offset || 0));
  const limit = Math.min(250, Math.max(1, Number(options?.limit || 100)));
  const query = `*[_type == "product" && (!defined($categoryId) || category->slug.current == $categoryId)] | order(_createdAt desc) [$offset...$end]{
    _id,
    "slug": slug.current,
    title,
    price,
    discountPrice,
    shippingCost,
    customShipping,
    stockStatus,
    description,
    "mainImage": mainImage.asset->url,
    "gallery": gallery[].asset->url,
    "categoryId": category->slug.current
  }`;

  const data = await client.fetch<SanityProductRecord[]>(query, {
    categoryId: options?.categoryId || null,
    offset,
    end: offset + limit,
  });

  if (!Array.isArray(data)) {
    throw new Error('Sanity products query returned unexpected payload.');
  }
  return data;
}

export async function fetchCategoriesFromSanity() {
  const client = createSanityServerClient();
  return client.fetch<
    { _id: string; title: string; slug: string; icon?: string }[]
  >(`*[_type == "category"]{ _id, title, "slug": slug.current, icon }`);
}

export async function fetchProductsByIds(productIds: string[]): Promise<SanityProductRecord[]> {
  if (productIds.length === 0) return [];
  const client = createSanityServerClient();
  const query = `*[_type == "product" && _id in $ids]{
    _id,
    "slug": slug.current,
    title,
    price,
    discountPrice,
    shippingCost,
    customShipping,
    stockStatus,
    description,
    "mainImage": mainImage.asset->url,
    "gallery": gallery[].asset->url,
    "categoryId": category->slug.current
  }`;
  const rows = await client.fetch<SanityProductRecord[]>(query, { ids: productIds });
  return Array.isArray(rows) ? rows : [];
}
