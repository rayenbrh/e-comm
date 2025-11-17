import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { Loader } from '@/components/ui/Loader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Package, Calendar, DollarSign, Eye, Edit } from 'lucide-react';
import { format } from 'date-fns';

export const AdminOrders = () => {
  const { data: orders, isLoading } = useOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');

  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status });
      setSelectedOrder(null);
      setNewStatus('');
    } catch (error) {
      console.error('Failed to update status');
    }
  };

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
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Manage Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {orders?.length || 0} total {orders?.length === 1 ? 'order' : 'orders'}
          </p>
        </motion.div>

        {!orders || orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl"
          >
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">No orders yet</h2>
            <p className="text-gray-600 dark:text-gray-400">Orders will appear here once customers start purchasing</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any, index: number) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Order #{order._id?.slice(-8).toUpperCase()}
                        </h3>
                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${order.total?.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {selectedOrder?._id === order._id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newStatus || order.status}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order._id, newStatus || order.status)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(null);
                              setNewStatus('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Update Status
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Items:</h4>
                    {order.items?.map((item: any, itemIndex: number) => (
                      <div key={itemIndex} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Qty: {item.quantity} × ${item.price?.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ${(item.quantity * item.price)?.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Customer & Shipping Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Customer Information</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{order.shippingAddress?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{order.shippingAddress?.email}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{order.shippingAddress?.phone}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Shipping Address</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{order.shippingAddress?.street}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{order.shippingAddress?.country}</p>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-end">
                      <div className="w-full md:w-1/2 space-y-2">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>Subtotal:</span>
                          <span>${order.subtotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>Shipping:</span>
                          <span>{order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost?.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span>Total:</span>
                          <span className="text-gradient">${order.total?.toFixed(2)}</span>
                        </div>
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
