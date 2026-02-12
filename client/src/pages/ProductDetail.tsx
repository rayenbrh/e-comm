import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProduct, useRelatedProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { Badge } from '@/components/ui/Badge';
import { ProductCard } from '@/components/product/ProductCard';
import toast from 'react-hot-toast';
import getImageUrl from '@/utils/imageUtils';
import { useLocalizedText } from '@/utils/multilingual';
import type { ProductVariant } from '@/types';
import {
  ShoppingCart,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  RefreshCw,
} from 'lucide-react';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error, isError } = useProduct(id || '');
  const { data: relatedProducts } = useRelatedProducts(id || '');
  const addToCart = useCartStore((state) => state.addToCart);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { t, tWithParams } = useTranslation();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // Always call hooks unconditionally - before any early returns
  const productName = useLocalizedText(product?.name);
  const productDescription = useLocalizedText(product?.description);
  const inWishlist = product ? isInWishlist(product._id) : false;

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{t('productDetail.invalidId')}</h1>
          <Button onClick={() => navigate('/products')}>{t('productDetail.browseProducts')}</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (isError || error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{t('productDetail.productNotFound')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error instanceof Error ? error.message : t('productDetail.notExist')}
          </p>
          <Button onClick={() => navigate('/products')}>{t('productDetail.browseProducts')}</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product) {
      if (product.hasVariants && !selectedVariant) {
        toast.error('Please select a variant');
        return;
      }
      addToCart(product, quantity, selectedVariant || undefined);
      toast.success(tWithParams('productDetail.addedToCart', { quantity: quantity.toString(), name: productName }));
    }
  };

  const handleWishlistToggle = () => {
    if (product) {
      if (inWishlist) {
        removeFromWishlist(product._id);
        toast.success(t('wishlist.removed'));
      } else {
        addToWishlist(product);
        toast.success(t('wishlist.added'));
      }
    }
  };

  const handleQuantityChange = (delta: number) => {
    const maxStock = product.hasVariants && selectedVariant 
      ? selectedVariant.stock 
      : product.stock;
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  // Handle variant attribute selection
  const handleAttributeChange = (attrName: string, value: string) => {
    const newAttributes = { ...selectedAttributes, [attrName]: value };
    setSelectedAttributes(newAttributes);
    
    // Find matching variant
    if (product.variants) {
      const matchingVariant = product.variants.find(variant => {
        return Object.keys(newAttributes).every(key => 
          variant.attributes[key] === newAttributes[key]
        ) && Object.keys(variant.attributes).length === Object.keys(newAttributes).length;
      });
      
      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
        // Update selected image if variant has an image
        if (matchingVariant.image) {
          const variantImageIndex = product.images?.indexOf(matchingVariant.image);
          if (variantImageIndex !== undefined && variantImageIndex >= 0) {
            setSelectedImage(variantImageIndex);
          }
        }
        // Reset quantity if it exceeds variant stock
        if (quantity > matchingVariant.stock) {
          setQuantity(1);
        }
      } else {
        setSelectedVariant(null);
      }
    }
  };

  // Get display price and stock based on variant
  // For products with variants, show minimum price if no variant selected
  let displayPrice: number | undefined;
  let regularPrice: number | undefined;
  
  if (product.hasVariants) {
    if (selectedVariant) {
      displayPrice = selectedVariant.promoPrice && selectedVariant.promoPrice > 0 
        ? selectedVariant.promoPrice 
        : selectedVariant.price;
      regularPrice = selectedVariant.price;
    } else if (product.variants && product.variants.length > 0) {
      // Show minimum price from variants
      const prices = product.variants
        .map(v => v.promoPrice && v.promoPrice > 0 ? v.promoPrice : v.price)
        .filter(p => p > 0);
      displayPrice = prices.length > 0 ? Math.min(...prices) : undefined;
      const regularPrices = product.variants
        .map(v => v.price)
        .filter(p => p > 0);
      regularPrice = regularPrices.length > 0 ? Math.min(...regularPrices) : undefined;
    }
  } else {
    displayPrice = product.promoPrice && product.promoPrice > 0 
      ? product.promoPrice 
      : product.price;
    regularPrice = product.price;
  }
  
  const displayStock = product.hasVariants && selectedVariant
    ? selectedVariant.stock
    : (product.hasVariants 
        ? (product.variants?.some(v => v.stock > 0) ? 1 : 0) 
        : product.stock);

  // Build images array including variant images
  const buildImages = () => {
    const baseImages = product.images && product.images.length > 0 
      ? product.images.map(img => getImageUrl(img))
      : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'];
    
    // Add variant images if they're not already in base images
    if (product.variants) {
      product.variants.forEach(variant => {
        if (variant.image && !baseImages.includes(getImageUrl(variant.image))) {
          baseImages.push(getImageUrl(variant.image));
        }
      });
    }
    
    return baseImages;
  };
  
  const images = buildImages();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-sm mb-8"
        >
          <Link to="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            {t('nav.home')}
          </Link>
          <span className="text-gray-400">/</span>
          <Link to="/products" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            {t('nav.products')}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white">{productName}</span>
        </motion.nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Main Image */}
            <div className="relative aspect-square mb-4 rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#3a0f17]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage]}
                  alt={productName}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-[#3a0f17]/80 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-burgundy-700 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-[#3a0f17]/80 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-burgundy-700 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {product.featured && <Badge variant="primary">{t('product.featured')}</Badge>}
                {displayStock < 10 && displayStock > 0 && (
                  <Badge variant="warning">{tWithParams('cart.onlyLeft', { count: displayStock })}</Badge>
                )}
                {displayStock === 0 && <Badge variant="danger">{t('common.outOfStock')}</Badge>}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800'
                        : 'border-gray-200 dark:border-[#2d2838] hover:border-gray-300 dark:hover:border-burgundy-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img src={image} alt={`${productName} ${index + 1}`} className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{productName}</h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-medium text-gray-900 dark:text-white">{product.rating || 0}</span>
              <span className="text-gray-500 dark:text-gray-400">({product.numReviews || 0} {t('product.reviews')})</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              {(() => {
                if (displayPrice === undefined || displayPrice === null) {
                  return (
                    <div className="flex flex-col gap-2">
                      <span className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
                        {t('product.selectVariant')}
                      </span>
                    </div>
                  );
                }
                
                const hasPromo = regularPrice !== undefined && regularPrice !== null && displayPrice < regularPrice;
                const discountPercentage = hasPromo && regularPrice && regularPrice > 0
                  ? Math.round(((regularPrice - displayPrice) / regularPrice) * 100)
                  : 0;
                
                return (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl font-bold text-[#510013] dark:text-white">
                        {product.hasVariants && !selectedVariant ? `${t('product.from')} ` : ''}{displayPrice.toFixed(2)} TND
                      </span>
                      {hasPromo && regularPrice !== undefined && regularPrice !== null && (
                        <span className="text-2xl text-gray-500 dark:text-gray-400 line-through">
                          {regularPrice.toFixed(2)} TND
                        </span>
                      )}
                      {hasPromo && discountPercentage > 0 && (
                        <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                          -{discountPercentage}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">{productDescription}</p>

            {/* Variant Selection */}
            {product.hasVariants && product.variantAttributes && product.variantAttributes.length > 0 && (
              <div className="mb-8 space-y-4">
                {product.variantAttributes.map((attr) => (
                  <div key={attr.name}>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                      {attr.name}:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {attr.values.map((value) => {
                        const isSelected = selectedAttributes[attr.name] === value;
                        const isAvailable = product.variants?.some(v => 
                          v.attributes[attr.name] === value && v.stock > 0
                        );
                        return (
                          <button
                            key={value}
                            onClick={() => handleAttributeChange(attr.name, value)}
                            disabled={!isAvailable}
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                : isAvailable
                                ? 'border-gray-300 dark:border-burgundy-600 hover:border-indigo-500 text-gray-700 dark:text-gray-300'
                                : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {selectedVariant && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      Variant selected: {Object.entries(selectedVariant.attributes).map(([key, value]) => `${key}: ${value}`).join(', ')}
                    </p>
                  </div>
                )}
                {!selectedVariant && Object.keys(selectedAttributes).length > 0 && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      Please select all attributes to see available variants
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* SKU */}
            {product.sku && (
              <div className="mb-6">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('product.sku')}: {product.sku}
                </span>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="default">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-3 text-gray-900 dark:text-white">{t('product.selectQuantity')}</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 dark:border-burgundy-600 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-6 py-2 font-medium min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    disabled={quantity >= displayStock}
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {displayStock > 0 ? `${displayStock} ${t('product.available')}` : t('common.outOfStock')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <Button
                onClick={handleAddToCart}
                disabled={displayStock === 0 || (product.hasVariants && !selectedVariant)}
                className="flex-1"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {t('common.addToCart')}
              </Button>
              <motion.button
                onClick={handleWishlistToggle}
                className={`px-6 rounded-lg border-2 transition-colors ${
                  inWishlist
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500'
                    : 'border-gray-300 dark:border-burgundy-600 hover:border-red-500 hover:text-red-500'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className={`w-6 h-6 ${inWishlist ? 'fill-current' : ''}`} />
              </motion.button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-[#3a0f17]/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-[#3a0f17]/30 rounded-lg">
                  <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t('productDetail.freeShipping')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('productDetail.freeShippingDesc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t('productDetail.securePayment')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('productDetail.securePaymentDesc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-[#3a0f17]/30 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t('productDetail.easyReturns')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('productDetail.easyReturnsDesc')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">{t('product.relatedProducts')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard product={relatedProduct} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
