import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useCreateOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreditCard, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import getImageUrl from '@/utils/imageUtils';
import { useLocalizedText } from '@/utils/multilingual';

export const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const total = getTotalPrice();
  const { user } = useAuthStore();
  const createOrder = useCreateOrder();

  const [formData, setFormData] = useState({
    // Contact Info
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',

    // Shipping Address
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order data
      const orderData = {
        items: items.filter(item => item.product).map((item) => ({
          product: item.product!._id,
          name: item.product!.name,
          quantity: item.quantity,
          price: item.product!.price,
          image: item.product!.images?.[0] || '',
        })),
        subtotal: total,
        shippingCost: total >= 150 ? 0 : 25,
        total: total + (total >= 150 ? 0 : 25),
        shippingAddress: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      };

      await createOrder.mutateAsync(orderData);

      setOrderSuccess(true);
      clearCart();

      // Redirect to home page after success
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to process order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !orderSuccess) {
    navigate('/cart');
    return null;
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-green-100 dark:bg-green-900/30 rounded-full"
          >
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Order Placed Successfully!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Thank you for your order! We will contact you shortly to confirm your delivery. Payment will be collected upon delivery.
          </p>
          <Button onClick={() => navigate('/')}>Continue Shopping</Button>
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
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Checkout</h1>
          <p className="text-gray-600 dark:text-gray-400">Complete your purchase</p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#3a0f17] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-[#2d2838]"
              >
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                  />
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@example.com"
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+1 234 567 8900"
                    className="sm:col-span-2"
                  />
                </div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-[#3a0f17] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-[#2d2838]"
              >
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Street Address"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                    placeholder="123 Main Street"
                    className="sm:col-span-2"
                  />
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="New York"
                  />
                  <Input
                    label="Postal Code"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    placeholder="10001"
                  />
                  <Input
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    placeholder="United States"
                    className="sm:col-span-2"
                  />
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-[#3a0f17] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-[#2d2838]"
              >
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="w-6 h-6 text-gray-900 dark:text-white" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Method</h2>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
                        Cash on Delivery
                      </h3>
                      <p className="text-green-700 dark:text-green-300 text-sm mb-3">
                        Pay with cash when your order is delivered to your doorstep. No online payment required!
                      </p>
                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Safe and convenient payment method</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white dark:bg-[#3a0f17] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-[#2d2838] sticky top-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Order Summary</h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.filter(item => item.product).map((item) => (
                    <div key={item.product!._id} className="flex gap-4">
                      <img
                        src={getImageUrl(item.product!.images?.[0])}
                        alt={useLocalizedText(item.product!.name)}
                        className="w-16 h-16 rounded-lg object-cover bg-gray-100 dark:bg-burgundy-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{useLocalizedText(item.product!.name)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-[#510013] dark:text-burgundy-500">
                          {(item.product!.price * item.quantity).toFixed(2)} TND
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-3 mb-6 pt-4 border-t border-gray-200 dark:border-[#2d2838]">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#510013] dark:text-white">{total.toFixed(2)} TND</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {shippingCost === 0 ? (
                        <span className="text-green-600 dark:text-green-400">FREE</span>
                      ) : (
                        `${shippingCost.toFixed(2)} TND`
                      )}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-[#2d2838]">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                      <span className="text-3xl font-bold text-[#510013] dark:text-white">{finalTotal.toFixed(2)} TND</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirm Order (Cash on Delivery)
                    </>
                  )}
                </Button>

                {/* Trust Info */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-[#2d2838]">
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Cash on delivery available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Easy returns & refunds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Customer support available</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
};
