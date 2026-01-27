import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';
import type { Pack } from '@/hooks/usePacks';

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  addPackToCart: (pack: Pack, quantity?: number) => void;
  removeFromCart: (itemId: string, type: 'product' | 'pack') => void;
  updateQuantity: (itemId: string, quantity: number, type: 'product' | 'pack') => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.type === 'product' && item.product?._id === product._id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.type === 'product' && item.product?._id === product._id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity, type: 'product' }],
          };
        });
      },

      addPackToCart: (pack, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.type === 'pack' && item.pack?._id === pack._id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.type === 'pack' && item.pack?._id === pack._id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { 
              pack: {
                _id: pack._id,
                name: pack.name,
                description: pack.description,
                image: pack.image,
                discountPrice: pack.discountPrice,
                originalPrice: pack.originalPrice,
                discountPercentage: pack.discountPercentage,
                products: pack.products.map((p) => ({
                  product: p.product as Product,
                  quantity: p.quantity,
                })),
              },
              quantity, 
              type: 'pack' 
            }],
          };
        });
      },

      removeFromCart: (itemId, type) => {
        set((state) => ({
          items: state.items.filter((item) => {
            if (type === 'product') {
              return !(item.type === 'product' && item.product?._id === itemId);
            } else {
              return !(item.type === 'pack' && item.pack?._id === itemId);
            }
          }),
        }));
      },

      updateQuantity: (itemId, quantity, type) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId, type);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (type === 'product' && item.type === 'product' && item.product?._id === itemId) {
              return { ...item, quantity };
            } else if (type === 'pack' && item.type === 'pack' && item.pack?._id === itemId) {
              return { ...item, quantity };
            }
            return item;
          }),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          if (item.type === 'product' && item.product) {
            // Use promoPrice if available, otherwise use regular price
            const price = item.product.promoPrice && item.product.promoPrice > 0 
              ? item.product.promoPrice 
              : item.product.price;
            return total + price * item.quantity;
          } else if (item.type === 'pack' && item.pack) {
            return total + item.pack.discountPrice * item.quantity;
          }
          return total;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
