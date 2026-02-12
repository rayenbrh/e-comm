import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePacks } from '@/hooks/usePacks';
import { Loader } from '@/components/ui/Loader';
import { useTranslation } from '@/hooks/useTranslation';
import getImageUrl from '@/utils/imageUtils';
import { Gift, ArrowRight } from 'lucide-react';

export const Packs = () => {
  const { data: packs, isLoading } = usePacks();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1E0007]">
        <Loader size="lg" />
      </div>
    );
  }

  const activePacks = packs?.filter(pack => pack.active) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1E0007] py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
              {t('packs.title')}
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('packs.description')}
          </p>
        </motion.div>

        {/* Packs Grid */}
        {activePacks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Gift className="w-24 h-24 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('packs.noPacks')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('packs.noPacksDescription')}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activePacks.map((pack, index) => (
              <Link key={pack._id} to={`/packs/${pack._id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white dark:bg-[#3a0f17] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-[#2d2838] group h-full flex flex-col"
                >
                  {pack.image && (
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={getImageUrl(pack.image)}
                        alt={pack.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {pack.featured && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {t('packs.featured')}
                        </div>
                      )}
                      {pack.discountPercentage && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                          -{pack.discountPercentage}%
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition">
                      {pack.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                      {pack.description}
                    </p>
                    
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        {pack.discountPrice !== undefined && pack.discountPrice !== null ? (
                          <>
                            <span className="text-2xl font-bold text-[#510013] dark:text-yellow-400">
                              {pack.discountPrice.toFixed(2)} TND
                            </span>
                            {pack.originalPrice !== undefined && pack.originalPrice !== null && (
                              <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                                {pack.originalPrice.toFixed(2)} TND
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-lg text-gray-500 dark:text-gray-400">-</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {pack.products.length} {pack.products.length === 1 ? t('packs.product') : t('packs.products')}
                      </p>
                    </div>

                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-semibold mt-auto"
                    >
                      <span>{t('packs.viewDetails')}</span>
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

