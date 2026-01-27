import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePack } from '@/hooks/usePacks';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';
import getImageUrl from '@/utils/imageUtils';
import {
  ShoppingCart,
  Truck,
  Shield,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

export const PackDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: pack, isLoading, error, isError } = usePack(id || '');
  const { addPackToCart } = useCartStore();
  const { t, tWithParams } = useTranslation();

  const [quantity, setQuantity] = useState(1);

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{t('packDetail.invalidId')}</h1>
          <Button onClick={() => navigate('/')}>{t('packDetail.browsePacks')}</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text={t('common.loading')} />
      </div>
    );
  }

  if (isError || error || !pack) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{t('packDetail.packNotFound')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error instanceof Error ? error.message : t('packDetail.notExist')}
          </p>
          <Button onClick={() => navigate('/')}>{t('packDetail.browsePacks')}</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addPackToCart(pack, quantity);
    toast.success(tWithParams('packDetail.addedToCart', { quantity: quantity, name: pack.name }));
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const images = pack.image 
    ? [getImageUrl(pack.image)] 
    : pack.products[0]?.product.images?.[0] 
      ? [getImageUrl(pack.products[0].product.images[0])] 
      : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'];

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
          <span className="text-gray-900 dark:text-white">{t('packDetail.packs')}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white">{pack.name}</span>
        </motion.nav>

        {/* Pack Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Main Image */}
            <div className="relative aspect-square mb-4 rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#3a0f17]">
              <motion.img
                src={images[0] || ''}
                alt={pack.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {pack.featured && <Badge variant="primary">{t('packDetail.featured')}</Badge>}
                <Badge variant="danger">-{pack.discountPercentage}%</Badge>
              </div>
            </div>
          </motion.div>

          {/* Pack Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{pack.name}</h1>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">{pack.description}</p>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <span className="text-5xl font-bold text-[#510013] dark:text-white">
                  {pack.discountPrice.toFixed(2)} TND
                </span>
                <span className="text-2xl text-gray-500 dark:text-gray-400 line-through">
                  {pack.originalPrice.toFixed(2)} TND
                </span>
                <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {tWithParams('packDetail.save', { percent: pack.discountPercentage })}
                </span>
              </div>
            </div>

            {/* Products in Pack */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                {t('packDetail.contains')} {pack.products.length} {pack.products.length === 1 ? t('packDetail.product') : t('packDetail.products')}
              </h2>
              <div className="space-y-3">
                {pack.products.map((item, index) => (
                  <Link
                    key={index}
                    to={`/products/${item.product._id}`}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#1E0007] rounded-lg hover:bg-gray-100 dark:hover:bg-[#3a0f17] transition"
                  >
                    {item.product.images?.[0] && (
                      <img
                        src={getImageUrl(item.product.images[0])}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.product.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.product.price.toFixed(2)} TND x {item.quantity}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-3 text-gray-900 dark:text-white">{t('packDetail.selectQuantity')}</label>
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
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <Button
                onClick={handleAddToCart}
                className="flex-1"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {t('common.addToCart')}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-[#3a0f17]/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-[#3a0f17]/30 rounded-lg">
                  <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t('packDetail.freeShipping')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('packDetail.freeShippingCondition')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t('packDetail.securePayment')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('packDetail.securePaymentCondition')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-[#3a0f17]/30 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t('packDetail.easyReturns')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('packDetail.easyReturnsCondition')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

