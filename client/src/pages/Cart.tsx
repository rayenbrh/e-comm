import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCartStore();
  const { t, tWithParams } = useTranslation();
  const total = getTotalPrice();

  const handleQuantityChange = (id: string, delta: number, type: 'product' | 'pack') => {
    const item = items.find((i) => {
      if (type === 'product') {
        return i.type === 'product' && i.product?._id === id;
      } else {
        return i.type === 'pack' && i.pack?._id === id;
      }
    });
    if (item) {
      const newQuantity = item.quantity + delta;
      if (newQuantity > 0) {
        if (type === 'product' && item.product) {
          if (newQuantity <= item.product.stock) {
            updateQuantity(id, newQuantity, type);
          }
        } else {
          updateQuantity(id, newQuantity, type);
        }
      }
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
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{t('cart.empty')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {t('cart.emptyDescription')}
          </p>
          <Button onClick={() => navigate('/products')} size="lg">
            {t('common.continueShopping')}
          </Button>
        </motion.div>
      </div>
    );
  }

  const shippingCost = total >= 150 ? 0 : 25;
  const finalTotal = total + shippingCost;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">{t('cart.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {items.length} {items.length === 1 ? t('cart.item') : t('cart.items')} {t('common.in')} {t('nav.cart').toLowerCase()}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => {
                const itemId = item.type === 'product' ? item.product?._id : item.pack?._id;
                const itemName = item.type === 'product' ? item.product?.name : item.pack?.name;
                const itemDescription = item.type === 'product' ? item.product?.description : item.pack?.description;
                const itemImage = item.type === 'product' 
                  ? item.product?.images?.[0] 
                  : item.pack?.image || item.pack?.products?.[0]?.product?.images?.[0];
                // Use promoPrice if available, otherwise use regular price
                const itemPrice = item.type === 'product' 
                  ? (item.product?.promoPrice && item.product.promoPrice > 0 ? item.product.promoPrice : item.product?.price || 0)
                  : item.pack?.discountPrice || 0;
                const itemLink = item.type === 'product' 
                  ? `/products/${item.product?._id}` 
                  : `/packs/${item.pack?._id}`;
                const maxStock = item.type === 'product' ? item.product?.stock : undefined;

                return (
                  <motion.div
                    key={`${item.type}-${itemId}`}
                    layout
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50, height: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white dark:bg-[#3a0f17] rounded-xl p-6 mb-4 shadow-sm border border-gray-200 dark:border-[#2d2838]"
                  >
                    <div className="flex gap-6">
                      {/* Image */}
                      <Link to={itemLink} className="flex-shrink-0">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-burgundy-700"
                        >
                          <img
                            src={itemImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                            alt={itemName}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <Link to={itemLink}>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate">
                              {itemName}
                              {item.type === 'pack' && (
                                <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded">
                                  {t('cart.pack')}
                                </span>
                              )}
                            </h3>
                          </Link>
                          <motion.button
                            onClick={() => removeFromCart(itemId || '', item.type)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-red-500 hover:text-red-600 dark:hover:text-red-400 p-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                          {itemDescription}
                        </p>

                        {item.type === 'pack' && item.pack && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            {item.pack.products.length} {item.pack.products.length === 1 ? t('cart.product') : t('cart.products')}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t('common.quantity')}:</span>
                            <div className="flex items-center border border-gray-300 dark:border-burgundy-600 rounded-lg">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleQuantityChange(itemId || '', -1, item.type)}
                                className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </motion.button>
                              <span className="px-4 py-1 font-medium min-w-[40px] text-center">
                                {item.quantity}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleQuantityChange(itemId || '', 1, item.type)}
                                className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                disabled={maxStock !== undefined && item.quantity >= maxStock}
                              >
                                <Plus className="w-4 h-4" />
                              </motion.button>
                            </div>
                            {maxStock !== undefined && item.quantity >= maxStock && (
                              <span className="text-xs text-orange-500">{t('cart.maxStock')}</span>
                            )}
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gradient">
                              {(itemPrice * item.quantity).toFixed(2)} TND
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {itemPrice.toFixed(2)} TND {t('common.each')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Clear Cart Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="outline"
                onClick={() => {
                  if (window.confirm(t('cart.clearCartConfirm'))) {
                    clearCart();
                  }
                }}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('cart.clearCart')}
              </Button>
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-[#3a0f17] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-[#2d2838] sticky top-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t('cart.orderSummary')}</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('common.subtotal')} ({items.length} {items.length === 1 ? t('cart.item') : t('cart.items')})</span>
                  <span className="font-medium text-[#510013] dark:text-white">{total.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('common.shipping')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {shippingCost === 0 ? (
                      <span className="text-green-600 dark:text-green-400">{t('cart.freeShipping')}</span>
                    ) : (
                      `${shippingCost.toFixed(2)} TND`
                    )}
                  </span>
                </div>

                {total < 150 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-indigo-50 dark:bg-[#3a0f17]/20 rounded-lg border border-indigo-200 dark:border-[#2d2838]"
                  >
                    <p className="text-sm text-indigo-800 dark:text-indigo-300">
                      {tWithParams('cart.freeShippingMessage', { amount: (150 - total).toFixed(2) })}
                    </p>
                  </motion.div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-[#2d2838]">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('common.total')}</span>
                    <span className="text-3xl font-bold text-[#510013] dark:text-white">{finalTotal.toFixed(2)} TND</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                className="w-full mb-4"
                size="lg"
              >
                {t('common.proceedToCheckout')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Link to="/products">
                <Button variant="outline" className="w-full">
                  {t('common.continueShopping')}
                </Button>
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-[#2d2838]">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{t('cart.secureCheckout')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{t('cart.returnPolicy')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{t('cart.buyerProtection')}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
