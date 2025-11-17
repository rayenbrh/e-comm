import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useCreateOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
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

    // Payment Info (demo only)
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
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
        items: items.map((item) => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.images?.[0] || '',
        })),
        subtotal: total,
        shippingCost: total >= 50 ? 0 : 9.99,
        total: total + (total >= 50 ? 0 : 9.99),
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

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setOrderSuccess(true);
      clearCart();

      // Redirect to orders page after success
      setTimeout(() => {
        navigate('/orders');
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
            Thank you for your purchase. You will receive an email confirmation shortly.
          </p>
          <Button onClick={() => navigate('/orders')}>View Your Orders</Button>
        </motion.div>
      </div>
    );
  }

  const shippingCost = total >= 50 ? 0 : 9.99;
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
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
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
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
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

              {/* Payment Information */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="w-6 h-6 text-gray-900 dark:text-white" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Information</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Card Number"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="4242 4242 4242 4242"
                    className="sm:col-span-2"
                    maxLength={19}
                  />
                  <Input
                    label="Cardholder Name"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                    className="sm:col-span-2"
                  />
                  <Input
                    label="Expiry Date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    required
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                  <Input
                    label="CVV"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    required
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Lock className="w-4 h-4" />
                  <span>Your payment information is secure and encrypted</span>
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
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 sticky top-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Order Summary</h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item._id} className="flex gap-4">
                      <img
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-3 mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {shippingCost === 0 ? (
                        <span className="text-green-600 dark:text-green-400">FREE</span>
                      ) : (
                        `$${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                      <span className="text-3xl font-bold text-gradient">${finalTotal.toFixed(2)}</span>
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
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                {/* Trust Info */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Secure SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Money-back guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>24/7 customer support</span>
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
