import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const Products = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useProducts({
    search,
    category: selectedCategory,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort: sortBy as any,
    page,
    limit: 12,
  });

  const { data: categories } = useCategories();

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            All Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover our full collection of amazing products
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
                  Filters
                </h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Search
                  </label>
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search products..."
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
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition"
                  >
                    <option value="">All Categories</option>
                    {categories?.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition"
                  >
                    <option value="">Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest</option>
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
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {/* Results Info */}
            {data && (
              <div className="mb-6 text-gray-600 dark:text-gray-400">
                Showing {data.products.length} of {data.pagination.total} products
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <Loader text="Loading products..." />
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
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {[...Array(data.pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        page === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
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
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
