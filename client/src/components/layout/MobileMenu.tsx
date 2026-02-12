import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Home, ShoppingBag, Grid, User, LogIn, UserPlus, LogOut, LayoutDashboard, Heart, ShoppingCart, Info, Gift } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from '@/hooks/useTranslation';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const wishlistItems = useWishlistStore((state) => state.getTotalItems());
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const menuItems = [
    { path: '/', label: t('nav.home'), icon: Home },
    { path: '/products', label: t('nav.products'), icon: ShoppingBag },
    { path: '/packs', label: t('nav.packs'), icon: Gift },
    { path: '/categories', label: t('nav.categories'), icon: Grid },
    { path: '/about', label: t('nav.about'), icon: Info },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-80 max-w-full bg-white dark:bg-[#1E0007] shadow-2xl z-50 md:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2d2838]">
              <h2 className="text-xl font-bold text-gradient">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-burgundy-800 transition"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* User Info */}
            {isAuthenticated && user && (
              <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm opacity-90">{user.email}</p>
                    {user.role === 'admin' && (
                      <span className="text-xs bg-white/20 px-2 py-1 rounded mt-1 inline-block">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <div className="p-4">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
                    >
                      <Icon size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
                >
                  <Heart size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition flex-1">
                    {t('nav.wishlist')}
                  </span>
                  {wishlistItems > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {wishlistItems}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
                >
                  <ShoppingCart size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition flex-1">
                    {t('nav.cart')}
                  </span>
                  {cartItems > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartItems}
                    </span>
                  )}
                </Link>

                {/* Auth-specific Items */}
                {isAuthenticated ? (
                  <>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
                      >
                        <LayoutDashboard size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
                        <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {t('nav.admin')}
                        </span>
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
                    >
                      <User size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {t('nav.profile')}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition group"
                    >
                      <LogOut size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                        {t('nav.logout')}
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
                    >
                      <LogIn size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {t('nav.login')}
                      </span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition"
                    >
                      <UserPlus size={20} />
                      <span className="font-medium">{t('nav.signUp')}</span>
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
