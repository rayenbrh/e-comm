import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, TrendingUp, Shield, Zap } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { Hero3D } from '@/components/3d/Hero3D';
import { Suspense } from 'react';

export const Home = () => {
  const { data: featuredData, isLoading: loadingFeatured } = useProducts({ featured: true, limit: 8 });
  const { data: categories, isLoading: loadingCategories } = useCategories();

  const features = [
    {
      icon: ShoppingBag,
      title: 'Wide Selection',
      description: 'Thousands of products across multiple categories',
    },
    {
      icon: TrendingUp,
      title: 'Best Prices',
      description: 'Competitive pricing with regular discounts',
    },
    {
      icon: Shield,
      title: 'Secure Shopping',
      description: 'Your data is protected with industry-standard security',
    },
    {
      icon: Zap,
      title: 'Fast Shipping',
      description: 'Quick delivery to your doorstep',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Shop the
                <span className="text-gradient block mt-2">Future Today</span>
              </motion.h1>

              <motion.p
                className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Discover amazing products with modern shopping experience. Quality, variety, and affordability all in one place.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link to="/products">
                  <Button size="lg">
                    Shop Now <ArrowRight size={20} />
                  </Button>
                </Link>
                <Link to="/products?featured=true">
                  <Button variant="outline" size="lg">
                    View Featured
                  </Button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-3 gap-6 mt-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div>
                  <h3 className="text-3xl font-bold text-gradient">1000+</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Products</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gradient">50k+</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Customers</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gradient">99%</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Satisfaction</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - 3D Element */}
            <motion.div
              className="relative h-[400px] lg:h-[600px]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <Suspense fallback={<Loader />}>
                <Hero3D />
              </Suspense>

              {/* Floating shapes */}
              <motion.div
                className="absolute top-10 right-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"
                animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-10 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"
                animate={{ y: [0, 20, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-white dark:fill-gray-900"
            />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Find exactly what you're looking for
            </p>
          </motion.div>

          {loadingCategories ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {categories?.slice(0, 5).map((category, index) => (
                <Link key={category._id} to={`/products?category=${category._id}`}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="card p-6 text-center cursor-pointer"
                  >
                    {category.image && (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Check out our handpicked selection
            </p>
          </motion.div>

          {loadingFeatured ? (
            <Loader />
          ) : (
            <>
              <ProductGrid products={featuredData?.products || []} />

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <Link to="/products">
                  <Button size="lg">
                    View All Products <ArrowRight size={20} />
                  </Button>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};
