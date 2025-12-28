import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';
  
  // Calculate discount percentage
  const hasPromo = product.promoPrice && product.promoPrice > 0;
  const displayPrice = hasPromo ? product.promoPrice : product.price;
  const oldPrice = product.oldPrice || product.price;
  const discountPercentage = hasPromo && oldPrice > 0 
    ? Math.round(((oldPrice - (product.promoPrice || 0)) / oldPrice) * 100)
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
            <div className={`absolute top-3 ${hasPromo && discountPercentage > 0 ? 'right-3' : 'left-3'}`}>
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Featured
              </span>
            </div>
          )}

          {/* Stock Badge */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-lg">
                Out of Stock
              </span>
            </div>
          )}

          {/* Quick Add to Cart */}
          {product.stock > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute bottom-3 right-3 p-3 bg-white dark:bg-[#3a0f17] rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
                {hasPromo && oldPrice > displayPrice && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    {oldPrice.toFixed(2)} TND
                  </span>
                )}
              </div>
            </div>
            {product.stock > 0 && product.stock < 10 && (
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
