import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { t, tWithParams } = useTranslation();
  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(t('common.addToCart'));
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product._id);
      toast.success(t('wishlist.removed'));
    } else {
      addToWishlist(product);
      toast.success(t('wishlist.added'));
    }
  };

  const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';
  
  // If promoPrice exists, show it as the display price and cross out the regular price
  const hasPromo = product.promoPrice && product.promoPrice > 0;
  const displayPrice = hasPromo ? product.promoPrice : product.price;
  const regularPrice = product.price;
  const discountPercentage = hasPromo && regularPrice > 0 
    ? Math.round(((regularPrice - product.promoPrice) / regularPrice) * 100)
    : 0;

  return (
    <Link to={`/products/${product._id}`}>
      <motion.div
        whileHover={{ y: -8 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden group cursor-pointer h-full flex flex-col"
      >
        {/* Image */}
        <div className="relative overflow-hidden aspect-square bg-gray-100 dark:bg-[#3a0f17]">
          <motion.img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
          />

          {/* Wishlist Button - Always Visible */}
          <motion.button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 z-20 p-2 bg-white/90 dark:bg-[#3a0f17]/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-[#3a0f17] transition-colors"
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart 
              size={18} 
              className={`${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'}`} 
            />
          </motion.button>

          {/* Discount Badge */}
          {hasPromo && discountPercentage > 0 && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                -{discountPercentage}%
              </span>
            </div>
          )}

          {/* Featured Badge */}
          {product.featured && (
            <div className={`absolute top-3 ${hasPromo && discountPercentage > 0 ? 'left-3 mt-8' : 'left-3'}`}>
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {t('product.featured')}
              </span>
            </div>
          )}

          {/* Stock Badge */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-lg">
                {t('common.outOfStock')}
              </span>
            </div>
          )}

          {/* Quick Add to Cart - Shows on hover */}
          {product.stock > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute bottom-3 right-3 p-3 bg-white dark:bg-[#3a0f17] rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              <ShoppingCart size={20} className="text-burgundy-600 dark:text-burgundy-500" />
            </motion.button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Category */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {product.category.name}
          </p>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white line-clamp-2 group-hover:text-burgundy-600 dark:group-hover:text-burgundy-500 transition">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={`${
                  i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
              ({product.numReviews})
            </span>
          </div>

          {/* Price and Stock */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[#510013] dark:text-white">
                  {displayPrice.toFixed(2)} TND
                </span>
                {hasPromo && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    {regularPrice.toFixed(2)} TND
                  </span>
                )}
              </div>
            </div>
            {product.stock > 0 && product.stock < 10 && (
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                {tWithParams('cart.onlyLeft', { count: product.stock })}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
