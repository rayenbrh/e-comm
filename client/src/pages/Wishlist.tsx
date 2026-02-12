import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button';
import { Trash2, ShoppingCart, Heart, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import getImageUrl from '@/utils/imageUtils';
import { useLocalizedText } from '@/utils/multilingual';

export const Wishlist = () => {
  const navigate = useNavigate();
  const { items, removeFromWishlist, clearWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const { t } = useTranslation();

  const handleAddToCart = (product: typeof items[0]) => {
    if (product.stock > 0) {
      addToCart(product);
      toast.success(t('wishlist.added'));
    } else {
      toast.error(t('common.outOfStock'));
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-gray-100 dark:bg-[#3a0f17] rounded-full"
          >
            <Heart className="w-12 h-12 text-gray-400" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{t('wishlist.empty')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {t('wishlist.emptyDescription')}
          </p>
          <Button onClick={() => navigate('/products')} size="lg">
            {t('wishlist.startShopping')}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">{t('wishlist.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{items.length} {items.length === 1 ? t('wishlist.product') : t('wishlist.products')}</p>
          </div>
          {items.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                if (window.confirm(t('wishlist.clearWishlistConfirm'))) {
                  clearWishlist();
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('wishlist.clearWishlist')}
            </Button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {items.map((product, index) => {
              // Handle products with variants - they may not have a price at product level
              const hasVariants = product.hasVariants && product.variants && product.variants.length > 0;
              
              // Get minimum price from variants if product has variants
              let minPrice: number | undefined;
              if (hasVariants && product.variants) {
                const prices = product.variants
                  .map(v => v.promoPrice && v.promoPrice > 0 ? v.promoPrice : v.price)
                  .filter(p => p > 0);
                minPrice = prices.length > 0 ? Math.min(...prices) : undefined;
              }
              
              // If promoPrice exists, show it as the display price and cross out the regular price
              const hasPromo = product.promoPrice && product.promoPrice > 0;
              const displayPrice = hasVariants 
                ? minPrice 
                : (hasPromo && product.promoPrice ? product.promoPrice : product.price);
              const regularPrice = hasVariants 
                ? (product.variants?.find(v => v.promoPrice && v.promoPrice > 0)?.price || minPrice)
                : product.price;
              const discountPercentage = hasPromo && regularPrice && regularPrice > 0 && product.promoPrice
                ? Math.round(((regularPrice - product.promoPrice) / regularPrice) * 100)
                : 0;

              return (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white dark:bg-[#3a0f17] rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-[#2d2838] group"
                >
                  {/* Image */}
                  <Link to={`/products/${product._id}`} className="relative block aspect-square overflow-hidden bg-gray-100 dark:bg-[#3a0f17]">
                    <motion.img
                      src={getImageUrl(product.images?.[0])}
                      alt={useLocalizedText(product.name)}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                    />

                    {/* Discount Badge */}
                    {hasPromo && discountPercentage > 0 && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          -{discountPercentage}%
                        </span>
                      </div>
                    )}

                    {/* Remove from Wishlist Button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromWishlist(product._id);
                        toast.success(t('wishlist.removed'));
                      }}
                      className="absolute top-3 right-3 p-2 bg-white dark:bg-[#3a0f17] rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </motion.button>

                    {/* Stock Badge */}
                    {!hasVariants && product.stock !== undefined && product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-lg">
                          {t('common.outOfStock')}
                        </span>
                      </div>
                    )}
                    {hasVariants && product.variants && product.variants.every(v => v.stock === 0) && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-lg">
                          {t('common.outOfStock')}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="p-4">
                    <Link to={`/products/${product._id}`}>
                      <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white line-clamp-2 group-hover:text-burgundy-600 dark:group-hover:text-burgundy-500 transition">
                        {useLocalizedText(product.name)}
                      </h3>
                    </Link>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {getLocalizedText(product.category.name)}
                    </p>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      {displayPrice !== undefined && displayPrice !== null ? (
                        <>
                          <span className="text-2xl font-bold text-[#510013] dark:text-white">
                            {hasVariants ? `${t('product.from')} ` : ''}{displayPrice.toFixed(2)} TND
                          </span>
                          {hasPromo && regularPrice && regularPrice > 0 && regularPrice > displayPrice && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                              {regularPrice.toFixed(2)} TND
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                          {t('product.selectVariant')}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          handleAddToCart(product);
                        }}
                        disabled={product.stock === 0}
                        className="flex-1"
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {t('common.addToCart')}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Continue Shopping */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link to="/products">
            <Button variant="outline" size="lg">
              {t('common.continueShopping')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

