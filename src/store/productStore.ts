import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  categoryId: string;
  title: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  shippingPrice: string;
  customShipping?: { wilayaId: number, homePrice: number, deskPrice: number }[];
  rating: string;
  image: string;
  images?: string[];
  description?: string;
}

interface ProductStore {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  removeProduct: (id: string) => void;
}

const initialProducts: Product[] = [];

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: initialProducts,
      addProduct: (product) => set((state) => ({ 
        products: [{ ...product, id: Date.now().toString() }, ...state.products] 
      })),
      updateProduct: (id, updatedProduct) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updatedProduct } : p)
      })),
      removeProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),
    }),
    {
      name: 'qissa-products',
    }
  )
);
