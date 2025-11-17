import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useThemeStore } from './stores/themeStore';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Placeholder pages (to be built)
const ProductDetailPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Product Detail Page</h1>
      <p className="text-gray-600 dark:text-gray-400">To be implemented</p>
    </div>
  </div>
);

const CartPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Cart Page</h1>
      <p className="text-gray-600 dark:text-gray-400">To be implemented</p>
    </div>
  </div>
);

const CheckoutPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Checkout Page</h1>
      <p className="text-gray-600 dark:text-gray-400">To be implemented</p>
    </div>
  </div>
);

const ProfilePage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Profile Page</h1>
      <p className="text-gray-600 dark:text-gray-400">To be implemented</p>
    </div>
  </div>
);

const OrderHistoryPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Order History</h1>
      <p className="text-gray-600 dark:text-gray-400">To be implemented</p>
    </div>
  </div>
);

const AdminDashboardPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-400">To be implemented</p>
    </div>
  </div>
);

const CategoriesPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Categories</h1>
      <p className="text-gray-600 dark:text-gray-400">To be implemented</p>
    </div>
  </div>
);

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-8xl font-bold text-gradient mb-4">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400">Page not found</p>
    </div>
  </div>
);

function App() {
  const isDark = useThemeStore((state) => state.isDark);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#ffffff' : '#000000',
          },
        }}
      />

      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        <Navbar />

        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Routes */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/products" element={<AdminDashboardPage />} />
            <Route path="/admin/orders" element={<AdminDashboardPage />} />
            <Route path="/admin/categories" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminDashboardPage />} />

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
