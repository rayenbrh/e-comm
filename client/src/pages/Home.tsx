import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Package } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useHeroImage } from '@/hooks/useSettings';
import { usePacks } from '@/hooks/usePacks';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useCartStore } from '@/stores/cartStore';
import toast from 'react-hot-toast';

export const Home = () => {
  const { data: featuredData, isLoading: loadingFeatured } = useProducts({ featured: true, limit: 8 });
  const { data: categories, isLoading: loadingCategories } = useCategories(true); // Get categories with subcategories
  const { data: heroImages = [], isLoading: loadingHeroImage } = useHeroImage();
  const { data: packs = [], isLoading: loadingPacks } = usePacks();
  const { addPackToCart } = useCartStore();
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-rotate through hero images
  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-[#1E0007] dark:via-yellow-900/20 dark:to-amber-900/20">
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
                {t('home.heroTitle')}
                <span className="text-gradient block mt-2">{t('home.heroTitleHighlight')}</span>
              </motion.h1>

              <motion.p
                className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {t('home.heroDescription')}
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link to="/products">
                  <Button size="lg">
                    {t('home.shopNow')} <ArrowRight size={20} />
                  </Button>
                </Link>
                <Link to="/products?featured=true">
                  <Button variant="outline" size="lg">
                    {t('home.viewFeatured')}
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
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{t('home.stats.products')}</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gradient">50k+</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{t('home.stats.customers')}</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gradient">99%</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{t('home.stats.satisfaction')}</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Floating Hero Image */}
            <motion.div
              className="relative h-[400px] lg:h-[600px] flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {/* Animated Blurred Circles */}
              <motion.div
                className="absolute top-20 right-20 w-32 h-32 bg-yellow-400/30 rounded-full blur-2xl"
                animate={{ 
                  x: [0, 30, 0],
                  y: [0, -30, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute bottom-20 left-20 w-40 h-40 bg-amber-500/25 rounded-full blur-3xl"
                animate={{ 
                  x: [0, -40, 0],
                  y: [0, 40, 0],
                  scale: [1, 1.3, 1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute top-1/3 left-1/4 w-24 h-24 bg-yellow-600/20 rounded-full blur-xl"
                animate={{ 
                  x: [0, 20, -20, 0],
                  y: [0, -20, 20, 0],
                  scale: [1, 1.1, 0.9, 1]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute bottom-1/3 right-1/4 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl"
                animate={{ 
                  x: [0, -30, 30, 0],
                  y: [0, 30, -30, 0],
                  scale: [1, 1.2, 0.8, 1]
                }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-yellow-500/15 via-amber-500/15 to-yellow-600/15 rounded-full blur-3xl"
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute top-10 right-1/3 w-28 h-28 bg-yellow-700/15 rounded-full blur-xl"
                animate={{ 
                  x: [0, 25, 0],
                  y: [0, -25, 0],
                  scale: [1, 1.15, 1]
                }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute bottom-10 left-1/3 w-32 h-32 bg-amber-600/20 rounded-full blur-2xl"
                animate={{ 
                  x: [0, -35, 0],
                  y: [0, 35, 0],
                  scale: [1, 1.25, 1]
                }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Main Hero Image - 3D Flip Animation */}
              <div className="relative z-10 perspective-1000">
                <AnimatePresence mode="wait">
                  {!loadingHeroImage && heroImages.length > 0 && (
                    <motion.div
                      key={currentImageIndex}
                      className="relative"
                      initial={{ 
                        rotateY: -90,
                        opacity: 0,
                        scale: 0.8,
                        x: -100
                      }}
                      animate={{ 
                        rotateY: 0,
                        opacity: 1,
                        scale: 1,
                        x: 0
                      }}
                      exit={{ 
                        rotateY: 90,
                        opacity: 0,
                        scale: 0.8,
                        x: 100
                      }}
                      transition={{
                        duration: 0.8,
                        ease: [0.4, 0, 0.2, 1],
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }}
                      style={{
                        transformStyle: 'preserve-3d',
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      <motion.img
                        src={heroImages[currentImageIndex] || "/Untitled.png"}
                        alt={`Hero Product ${currentImageIndex + 1}`}
                        className="w-[300px] h-[300px] lg:w-[450px] lg:h-[450px] object-contain drop-shadow-2xl"
                        style={{
                          filter: 'drop-shadow(0 25px 50px rgba(255, 215, 0, 0.4))',
                          transformStyle: 'preserve-3d',
                        }}
                        animate={{
                          y: [0, -15, 0],
                          rotateY: [0, 3, -3, 0],
                          rotateZ: [0, 1.5, -1.5, 0]
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.3
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/Untitled.png';
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Image indicators */}
                {heroImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {heroImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-yellow-500 w-6'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Circular glow effect behind image */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] lg:w-[550px] lg:h-[550px] rounded-full bg-gradient-to-br from-yellow-500/20 via-amber-500/20 to-yellow-600/20 blur-2xl -z-10"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-white dark:fill-[#1E0007]"
            />
          </svg>
        </div>
      </section>

      {/* Packs Section */}
      <section className="py-20 bg-white dark:bg-[#1E0007]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('home.specialOffers')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('home.exclusivePacks')}
            </p>
          </motion.div>

          {loadingPacks ? (
            <Loader />
          ) : packs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packs.map((pack, index) => (
                <Link key={pack._id} to={`/packs/${pack._id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="bg-white dark:bg-[#3a0f17] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-[#2d2838] group"
                  >
                    {pack.image && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={pack.image}
                          alt={pack.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {pack.featured && (
                          <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            {t('home.featured')}
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                          -{pack.discountPercentage}%
                        </div>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                        {pack.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {pack.description}
                      </p>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {pack.products.length} {pack.products.length === 1 ? t('home.product') : t('home.products')}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-bold text-[#510013] dark:text-white">
                            {pack.discountPrice.toFixed(2)} TND
                          </span>
                          <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                            {pack.originalPrice.toFixed(2)} TND
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          addPackToCart(pack);
                          toast.success(t('home.packAddedToCart'));
                        }}
                        className="w-full"
                        size="lg"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {t('home.addPackToCart')}
                      </Button>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{t('home.noPacksAvailable')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gray-50 dark:bg-[#1E0007]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('home.shopByCategory')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('home.findExactly')}
            </p>
          </motion.div>

          {loadingCategories ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {categories?.filter((cat: any) => !cat.parent && !cat.isSubCategory).slice(0, 5).map((category: any, index: number) => (
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
                    {category.subcategories && category.subcategories.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {category.subcategories.length} {category.subcategories.length === 1 ? t('categories.subcategory') : t('categories.subcategories')}
                      </p>
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white dark:bg-[#1E0007]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('home.featuredProducts')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('home.handpickedSelection')}
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
                    {t('home.viewAllProducts')} <ArrowRight size={20} />
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
