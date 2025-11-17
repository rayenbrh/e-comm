import { motion } from 'framer-motion';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const Loader = ({ size = 'md', text }: LoaderProps) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <motion.div
        className={`${sizes[size]} border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          {text}
        </p>
      )}
    </div>
  );
};

export const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" text="Loading..." />
    </div>
  );
};
