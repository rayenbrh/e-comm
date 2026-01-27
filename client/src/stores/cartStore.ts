import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, ProductVariant } from '@/types';
import type { Pack } from '@/hooks/usePacks';

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: import('@/types').ProductVariant) => void;
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

      addToCart: (product, quantity = 1, variant?: ProductVariant) => {
        set((state) => {
          // For products with variants, we need to match both product ID and variant attributes
          const existingItem = state.items.find((item) => {
            if (item.type === 'product' && item.product?._id === product._id) {
              if (product.hasVariants && variant) {
                // Match variant by comparing attributes
                const itemVariant = item.selectedVariant;
                if (!itemVariant) return false;
                return Object.keys(variant.attributes).every(
                  key => variant.attributes[key] === itemVariant.attributes[key]
                ) && Object.keys(variant.attributes).length === Object.keys(itemVariant.attributes).length;
              } else {
                // No variants, match by product ID only
                return !item.selectedVariant;
              }
            }
            return false;
          });

          if (existingItem) {
            return {
              items: state.items.map((item) => {
                if (item.type === 'product' && item.product?._id === product._id) {
                  if (product.hasVariants && variant) {
                    const itemVariant = item.selectedVariant;
                    if (itemVariant && Object.keys(variant.attributes).every(
                      key => variant.attributes[key] === itemVariant.attributes[key]
                    ) && Object.keys(variant.attributes).length === Object.keys(itemVariant.attributes).length) {
                      return { ...item, quantity: item.quantity + quantity };
                    }
                  } else if (!item.selectedVariant) {
                    return { ...item, quantity: item.quantity + quantity };
                  }
                }
                return item;
              }),
            };
          }

          return {
            items: [...state.items, { product, quantity, type: 'product', selectedVariant: variant }],
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
            // If product has variants and a variant is selected, use variant price
            if (item.product.hasVariants && item.selectedVariant) {
              const price = item.selectedVariant.promoPrice && item.selectedVariant.promoPrice > 0
                ? item.selectedVariant.promoPrice
                : item.selectedVariant.price;
              return total + price * item.quantity;
            }
            // Otherwise use product price
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
