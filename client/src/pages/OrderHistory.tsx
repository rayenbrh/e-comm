import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useOrders } from '@/hooks/useOrders';
import { Loader } from '@/components/ui/Loader';
import { Badge } from '@/components/ui/Badge';
import { Package, Calendar, DollarSign, MapPin } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';

export const OrderHistory = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: orders, isLoading } = useOrders();

  if (!user) {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'primary';
      case 'shipped':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Order History</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {orders?.length || 0} {orders?.length === 1 ? 'order' : 'orders'} found
          </p>
        </motion.div>

        {!orders || orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-gray-100 dark:bg-[#3a0f17] rounded-full">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">No orders yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Start shopping to see your orders here!
            </p>
            <Link to="/products">
              <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all">
                Browse Products
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any, index: number) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-[#3a0f17] rounded-xl shadow-sm border border-gray-200 dark:border-[#2d2838] overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="p-6 bg-gray-50 dark:bg-[#3a0f17]/50 border-b border-gray-200 dark:border-[#2d2838]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Order Number</p>
                      <p className="font-semibold text-gray-900 dark:text-white">#{order._id?.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total</p>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <p className="font-semibold text-[#510013] dark:text-white">${order.total?.toFixed(2)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                      <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items?.map((item: any, itemIndex: number) => (
                      <motion.div
                        key={itemIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: itemIndex * 0.05 }}
                        className="flex gap-4 items-center"
                      >
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover bg-gray-100 dark:bg-burgundy-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Quantity: {item.quantity} × ${item.price?.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#510013] dark:text-white">
                            ${(item.quantity * item.price)?.toFixed(2)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-[#2d2838]">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Shipping Address</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.shippingAddress.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.shippingAddress.street}, {order.shippingAddress.city}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-[#2d2838]">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                        <span className="text-[#510013] dark:text-white">${order.subtotal?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                        <span className="text-[#510013] dark:text-white">
                          {order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost?.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200 dark:border-[#2d2838]">
                        <span className="text-gray-900 dark:text-white">Total</span>
                        <span className="text-[#510013] dark:text-white text-lg">${order.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
