import { ProductCard } from './ProductCard';
import { Product } from '@/types';
import { motion } from 'framer-motion';

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid = ({ products }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          No products found
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </motion.div>
  );
};
