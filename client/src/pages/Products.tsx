import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/hooks/useTranslation';

export const Products = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const { t, tWithParams } = useTranslation();

  // Read category from URL on mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  const { data, isLoading } = useProducts({
    search,
    category: selectedCategory,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort: sortBy as any,
    page,
    limit: 12,
  });

  const { data: categories } = useCategories(true); // Get categories with subcategories

  // Flatten categories for dropdown (main categories + subcategories with indentation)
  const flattenedCategories = categories?.reduce((acc: any[], category: any) => {
    // Add main category
    acc.push(category);
    // Add subcategories if they exist
    if (category.subcategories && category.subcategories.length > 0) {
      category.subcategories.forEach((sub: any) => {
        acc.push({ ...sub, displayName: `  └─ ${sub.name}` });
      });
    }
    return acc;
  }, []) || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1E0007] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {t('products.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('products.description')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:block ${showFilters ? 'block' : 'hidden'}`}
          >
            <div className="card p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('products.filters')}
                </h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-yellow-600 dark:text-yellow-400 hover:underline"
                >
                  {t('products.reset')}
                </button>
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t('common.search')}
                  </label>
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder={t('products.searchPlaceholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <Search size={20} className="text-gray-400" />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t('nav.categories')}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-burgundy-600 bg-white dark:bg-[#3a0f17] text-gray-900 dark:text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-900 outline-none transition"
                  >
                    <option value="">{t('products.allCategories')}</option>
                    {categories?.map((category: any) => (
                      <optgroup key={category._id} label={category.name}>
                        <option value={category._id}>{category.name}</option>
                        {category.subcategories?.map((sub: any) => (
                          <option key={sub._id} value={sub._id}>
                            &nbsp;&nbsp;└─ {sub.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t('products.priceRange')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder={t('products.min')}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder={t('products.max')}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t('products.sortBy')}
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-burgundy-600 bg-white dark:bg-[#3a0f17] text-gray-900 dark:text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-900 outline-none transition"
                  >
                    <option value="">{t('products.default')}</option>
                    <option value="price-asc">{t('products.priceLowToHigh')}</option>
                    <option value="price-desc">{t('products.priceHighToLow')}</option>
                    <option value="rating">{t('products.highestRated')}</option>
                    <option value="newest">{t('products.newest')}</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Products */}
          <div className="lg:col-span-3">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                fullWidth
              >
                <SlidersHorizontal size={20} />
                {showFilters ? t('products.hideFilters') : t('products.showFilters')}
              </Button>
            </div>

            {/* Results Info */}
            {data && (
              <div className="mb-6 text-gray-600 dark:text-gray-400">
                {t('products.showing')} {data.products.length} {t('products.of')} {data.pagination.total} {t('products.products')}
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <Loader text={t('products.loadingProducts')} />
            ) : (
              <ProductGrid products={data?.products || []} />
            )}

            {/* Pagination */}
            {data && data.pagination.pages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant="outline"
                >
                  {t('products.previous')}
                </Button>

                <div className="flex items-center gap-2">
                  {[...Array(data.pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        page === i + 1
                          ? 'bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-600 text-white'
                          : 'bg-white dark:bg-[#3a0f17] text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-burgundy-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                  disabled={page === data.pagination.pages}
                  variant="outline"
                >
                  {t('products.next')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
