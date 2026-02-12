import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Layers, ChevronRight } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useTranslation } from '@/hooks/useTranslation';
import { Loader } from '@/components/ui/Loader';
import { useState } from 'react';
import getImageUrl from '@/utils/imageUtils';
import { useLocalizedText } from '@/utils/multilingual';

export const Categories = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useCategories(true); // Get categories with subcategories
  const { t } = useTranslation();
  const categories = data || [];
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Get main categories (no parent)
  const mainCategories = categories.filter((cat: any) => !cat.parent && !cat.isSubCategory);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

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
            {t('categories.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('categories.description')}
          </p>
        </motion.div>

        {/* Categories Grid */}
        {mainCategories.length === 0 ? (
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
            {mainCategories.map((category: any, index: number) => {
              const subcategories = categories.filter((cat: any) => cat.parent === category._id);
              const isExpanded = expandedCategories.has(category._id);

              return (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#3a0f17] shadow-lg hover:shadow-2xl transition-all duration-300">
                    {/* Image Container */}
                    <div className="relative h-64 overflow-hidden">
                      <motion.img
                        src={getImageUrl(category.image)}
                        alt={useLocalizedText(category.name)}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => navigate(`/products?category=${category._id}`)}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                      {/* Category Name on Image */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {useLocalizedText(category.name)}
                        </h3>
                        {subcategories.length > 0 && (
                          <p className="text-sm text-white/80">
                            {subcategories.length} {subcategories.length === 1 ? t('categories.subcategory') : t('categories.subcategories')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {category.description && (
                      <div className="p-6">
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                          {category.description}
                        </p>

                        {/* Subcategories */}
                        {subcategories.length > 0 && (
                          <div className="mb-4">
                            <button
                              onClick={() => toggleCategory(category._id)}
                              className="flex items-center justify-between w-full text-left text-sm font-medium text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors mb-2"
                            >
                              <span>
                                {isExpanded ? t('categories.hideSubcategories') : t('categories.showSubcategories')} ({subcategories.length})
                              </span>
                              <ChevronRight
                                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                              />
                            </button>

                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 pl-4 border-l-2 border-yellow-500 dark:border-yellow-400"
                              >
                                {subcategories.map((subcategory: any) => (
                                  <motion.div
                                    key={subcategory._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => navigate(`/products?category=${subcategory._id}`)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E0007] cursor-pointer transition-colors"
                                  >
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {subcategory.name}
                                    </p>
                                  </motion.div>
                                ))}
                              </motion.div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center text-yellow-600 dark:text-yellow-400 font-semibold group-hover:gap-2 transition-all">
                          <span
                            onClick={() => navigate(`/products?category=${category._id}`)}
                            className="cursor-pointer"
                          >
                            {t('home.exploreCategory')}
                          </span>
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
              );
            })}
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
              {t('categories.cantFind')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('categories.browseAll')}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/products')}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-600 hover:from-yellow-600 hover:via-yellow-700 hover:to-amber-700 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              {t('categories.viewAllProducts')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
