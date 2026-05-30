import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/services/productService';
import toast from 'react-hot-toast';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  totalShipping: () => number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.id === product.id);
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            };
          }
          
          return { items: [...state.items, { ...product, quantity }] };
        });
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== productId)
        }));
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map(item =>
            item.id === productId ? { ...item, quantity } : item
          )
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      totalPrice: () => {
        return get().items.reduce((total, item) => {
          const priceStr = item.price ? String(item.price).replace(/,/g, '') : '0';
          const price = parseFloat(priceStr) || 0;
          return total + (price * item.quantity);
        }, 0);
      },

      totalShipping: () => {
        const items = get().items;
        let total = 0;
        
        items.forEach(item => {
          // Calculate shipping for each different product type
          // If a user orders quantity=2 of the *same* product, shipping is added only once.
          // If a user orders two *different* products, shipping is added twice.
          const shippingStr = (item as any).shippingPrice || '0';
          const shipping = parseFloat(String(shippingStr).replace(/,/g, '')) || 0;
          total += shipping;
        });

        return total;
      },
    }),
    {
      name: 'souq-pro-cart',
    }
  )
);
