import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useOrders } from '@/hooks/useOrders';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Loader } from '@/components/ui/Loader';
import { Save, LogOut, Package, Calendar, DollarSign, ArrowRight, CheckCircle2, Truck, MapPin, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import getImageUrl from '@/utils/imageUtils';

export const Profile = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { t } = useTranslation();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      // API call would go here
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      // API call would go here
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const getStatusSteps = (status: string) => {
    const steps = [
      { key: 'Pending', label: t('orders.pending'), icon: Package },
      { key: 'Confirmed', label: t('orders.confirmed'), icon: CheckCircle2 },
      { key: 'Shipped', label: t('orders.shipped'), icon: Truck },
      { key: 'Delivered', label: t('orders.delivered'), icon: CheckCircle2 },
    ];

    const statusIndex = steps.findIndex((s) => s.key === status);
    return steps.map((step, index) => ({
      ...step,
      completed: index <= statusIndex,
      current: index === statusIndex,
    }));
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings</p>
        </motion.div>

        <div className="space-y-6">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#3a0f17] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-[#2d2838]"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        street: user?.address?.street || '',
                        city: user?.address?.city || '',
                        postalCode: user?.address?.postalCode || '',
                        country: user?.address?.country || '',
                      });
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {isEditing ? (
                <>
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Street Address"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Postal Code"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="sm:col-span-2"
                  />
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <p className="text-gray-900 dark:text-white">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <p className="text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <p className="text-gray-900 dark:text-white">{user.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <p className="text-gray-900 dark:text-white capitalize">{user.role}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {user.address?.street
                        ? `${user.address.street}, ${user.address.city}, ${user.address.postalCode}, ${user.address.country}`
                        : 'Not provided'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#3a0f17] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-[#2d2838]"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Change Password</h2>
            <form onSubmit={handleChangePassword}>
              <div className="grid grid-cols-1 gap-6 max-w-md">
                <Input
                  label="Current Password"
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <Button type="submit" className="w-full sm:w-auto">
                  Update Password
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Order Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[#3a0f17] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-[#2d2838]"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('profile.orders')}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {orders && orders.length > 0
                    ? `${orders.length} ${orders.length === 1 ? t('orders.item') : t('orders.items')}`
                    : t('orders.noOrders')}
                </p>
              </div>
              {orders && orders.length > 0 && (
                <Link to="/orders">
                  <Button variant="outline" size="sm">
                    {t('orders.viewAll')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>

            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <Loader size="md" />
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 dark:bg-[#3a0f17] rounded-full">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t('orders.noOrders')}</p>
                <Link to="/products">
                  <Button variant="outline" size="sm">
                    {t('common.continueShopping')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.slice(0, 5).map((order: any, index: number) => {
                  const getStatusVariant = (status: string) => {
                    switch (status.toLowerCase()) {
                      case 'pending':
                        return 'warning';
                      case 'confirmed':
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

                  const statusSteps = getStatusSteps(order.status);
                  const isExpanded = expandedOrder === order._id;

                  return (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="border border-gray-200 dark:border-[#2d2838] rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Order Header */}
                      <div className="p-4 bg-gray-50 dark:bg-[#3a0f17]/50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Package className="w-5 h-5 text-gray-400" />
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {t('orders.orderNumber')}{order._id?.slice(-8).toUpperCase()}
                              </span>
                              <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-semibold text-[#510013] dark:text-yellow-400">
                                  {order.total?.toFixed(2)} TND
                                </span>
                              </div>
                              <span>
                                {order.items?.length || 0} {order.items?.length === 1 ? t('orders.item') : t('orders.items')}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleOrderDetails(order._id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              {isExpanded ? t('common.cancel') : t('common.viewDetails')}
                            </Button>
                            <Link to="/orders">
                              <Button variant="outline" size="sm">
                                {t('common.viewDetails')}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Order Progress Tracking */}
                      {order.status !== 'Cancelled' && (
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-[#2d2838]">
                          <div className="flex items-center justify-between">
                            {statusSteps.map((step, stepIndex) => {
                              const StepIcon = step.icon;
                              return (
                                <div key={step.key} className="flex items-center flex-1">
                                  <div className="flex flex-col items-center flex-1">
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                        step.completed
                                          ? 'bg-green-500 text-white'
                                          : step.current
                                          ? 'bg-blue-500 text-white'
                                          : 'bg-gray-200 dark:bg-[#2d2838] text-gray-400'
                                      }`}
                                    >
                                      <StepIcon className="w-5 h-5" />
                                    </div>
                                    <span
                                      className={`text-xs mt-2 text-center ${
                                        step.completed || step.current
                                          ? 'text-gray-900 dark:text-white font-medium'
                                          : 'text-gray-500 dark:text-gray-400'
                                      }`}
                                    >
                                      {step.label}
                                    </span>
                                  </div>
                                  {stepIndex < statusSteps.length - 1 && (
                                    <div
                                      className={`h-0.5 flex-1 mx-2 -mt-6 ${
                                        step.completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-[#2d2838]'
                                      }`}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Expanded Order Details */}
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-gray-200 dark:border-[#2d2838] bg-white dark:bg-[#3a0f17]"
                        >
                          <div className="p-4 space-y-4">
                            {/* Order Items */}
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                {t('checkout.orderItems')}
                              </h4>
                              <div className="space-y-3">
                                {order.items?.map((item: any, itemIndex: number) => (
                                  <div
                                    key={itemIndex}
                                    className="flex gap-3 items-center p-2 bg-gray-50 dark:bg-[#2d2838] rounded-lg"
                                  >
                                    <img
                                      src={getImageUrl(item.image)}
                                      alt={item.name}
                                      className="w-12 h-12 rounded object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                        {item.name}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('common.quantity')}: {item.quantity} × {item.price?.toFixed(2)} TND
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-sm text-[#510013] dark:text-yellow-400">
                                        {(item.quantity * item.price)?.toFixed(2)} TND
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Shipping Address */}
                            {(order.user?.address || order.guestInfo?.address) && (
                              <div className="pt-3 border-t border-gray-200 dark:border-[#2d2838]">
                                <div className="flex items-start gap-2">
                                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                                      {t('checkout.shippingInfo')}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {order.user?.address
                                        ? `${order.user.address.street}, ${order.user.address.city}, ${order.user.address.postalCode}, ${order.user.address.country}`
                                        : order.guestInfo?.address
                                        ? `${order.guestInfo.address.street}, ${order.guestInfo.address.city}, ${order.guestInfo.address.postalCode}, ${order.guestInfo.address.country}`
                                        : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Order Summary */}
                            <div className="pt-3 border-t border-gray-200 dark:border-[#2d2838]">
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">{t('common.subtotal')}</span>
                                  <span className="text-[#510013] dark:text-white">{order.subtotal?.toFixed(2)} TND</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">{t('common.shipping')}</span>
                                  <span className="text-[#510013] dark:text-white">
                                    {order.shippingCost === 0 ? t('common.free') : `${order.shippingCost?.toFixed(2)} TND`}
                                  </span>
                                </div>
                                <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200 dark:border-[#2d2838]">
                                  <span className="text-gray-900 dark:text-white">{t('common.total')}</span>
                                  <span className="text-[#510013] dark:text-yellow-400 text-lg">
                                    {order.total?.toFixed(2)} TND
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
                {orders.length > 5 && (
                  <div className="text-center pt-2">
                    <Link to="/orders">
                      <Button variant="outline" className="w-full">
                        {t('orders.viewAllOrders', orders.length)}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Account Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-[#3a0f17] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-[#2d2838]"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Account Actions</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
