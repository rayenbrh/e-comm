import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { Loader } from '@/components/ui/Loader';

export const Categories = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useCategories();
  const categories = data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1E0007] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#1E0007]">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Layers className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Shop by Category
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our diverse range of products organized by categories. Find exactly what you're looking for.
          </p>
        </motion.div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Layers className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No Categories Available
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Categories will appear here once they're added.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/products?category=${category._id}`)}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#3a0f17] shadow-lg hover:shadow-2xl transition-all duration-300">
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    <motion.img
                      src={category.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500'}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Category Name on Image */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {category.name}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  {category.description && (
                    <div className="p-6">
                      <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                        {category.description}
                      </p>
                      <div className="mt-4 flex items-center text-yellow-600 dark:text-yellow-400 font-semibold group-hover:gap-2 transition-all">
                        <span>Browse Products</span>
                        <motion.span
                          initial={{ x: 0 }}
                          whileHover={{ x: 5 }}
                          className="inline-block"
                        >
                          →
                        </motion.span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Featured Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="bg-white dark:bg-[#3a0f17] rounded-2xl p-8 shadow-lg max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Browse all our products or use the search feature to find exactly what you need.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/products')}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-600 hover:from-yellow-600 hover:via-yellow-700 hover:to-amber-700 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              View All Products
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
