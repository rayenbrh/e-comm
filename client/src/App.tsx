import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useThemeStore } from './stores/themeStore';
import { useLanguageStore } from './stores/languageStore';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { useTranslation } from './hooks/useTranslation';
import { AdminRoute } from './components/auth/AdminRoute';

// Pages
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Categories as CategoriesPage } from './pages/Categories';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProductDetail } from './pages/ProductDetail';
import { PackDetail } from './pages/PackDetail';
import { Cart } from './pages/Cart';
import { About } from './pages/About';
import { Wishlist } from './pages/Wishlist';
import { Checkout } from './pages/Checkout';
import { Profile } from './pages/Profile';
import { OrderHistory } from './pages/OrderHistory';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminOrders } from './pages/admin/Orders';
import { AdminProducts } from './pages/admin/Products';
import { AdminCategories } from './pages/admin/Categories';
import { AdminUsers } from './pages/admin/Users';
import { AdminPacks } from './pages/admin/Packs';

// Placeholder pages
const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-gradient mb-4">{t('notFound.title')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">{t('notFound.message')}</p>
      </div>
    </div>
  );
};

function App() {
  const isDark = useThemeStore((state) => state.isDark);
  const language = useLanguageStore((state) => state.language);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
    
    // Initialize language direction
    if (language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'fr');
    }
  }, [isDark, language]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? '#1E0007' : '#ffffff',
            color: isDark ? '#ffffff' : '#000000',
          },
        }}
      />

      <div className="min-h-screen bg-white dark:bg-[#1E0007] text-gray-900 dark:text-white transition-colors duration-300">
        <Navbar />

        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/packs/:id" element={<PackDetail />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Routes */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<OrderHistory />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <AdminRoute>
                  <AdminCategories />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/packs"
              element={
                <AdminRoute>
                  <AdminPacks />
                </AdminRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
