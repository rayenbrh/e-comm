import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useCategories } from '@/hooks/useCategories';
import { useHeroImage, useUploadHeroImages, useDeleteHeroImage } from '@/hooks/useSettings';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import {
  Package,
  Users,
  DollarSign,
  ShoppingCart,
  Layers,
  ArrowRight,
  Image as ImageIcon,
  Upload,
  Trash2,
  Gift,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: heroImages = [] } = useHeroImage();
  const uploadHeroImages = useUploadHeroImages();
  const deleteHeroImage = useDeleteHeroImage();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  // Update previews when heroImages changes
  useEffect(() => {
    if (heroImages && heroImages.length > 0) {
      setPreviews(heroImages);
    }
  }, [heroImages]);

  // Handle file selection (multiple files)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate all files
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} - not an image file`);
        return;
      }
      
      
      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      toast.error(`Invalid files:\n${invalidFiles.join('\n')}`);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      
      // Create previews for new files
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image file');
      return;
    }
    
    try {
      await uploadHeroImages.mutateAsync(selectedFiles);
      setSelectedFiles([]);
      // Reset file input
      const fileInput = document.getElementById('hero-images-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      // Previews will be updated automatically when heroImages query refetches
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // Handle delete image
  const handleDeleteImage = (imagePath: string, index: number) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      deleteHeroImage.mutate(imagePath, {
        onSuccess: () => {
          // Remove from local previews if it's a new file
          if (index >= (heroImages?.length || 0)) {
            setPreviews(prev => prev.filter((_, i) => i !== index));
            setSelectedFiles(prev => prev.filter((_, i) => i !== (index - (heroImages?.length || 0))));
          }
        },
      });
    }
  };

  // Remove selected file before upload
  const handleRemoveSelectedFile = (index: number) => {
    const adjustedIndex = index - (heroImages?.length || 0);
    setSelectedFiles(prev => prev.filter((_, i) => i !== adjustedIndex));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  if (productsLoading || ordersLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const products = productsData?.products || [];
  const totalProducts = products.length;
  const totalOrders = orders?.length || 0;
  const totalCategories = categories?.length || 0;

  // Calculate revenue
  const totalRevenue = orders?.reduce((sum: number, order: any) => sum + (order.total || 0), 0) || 0;

  // Recent orders
  const recentOrders = orders?.slice(0, 5) || [];

  // Low stock products
  const lowStockProducts = products.filter((p: any) => p.stock < 10);

  const stats = [
    {
      label: 'Total Revenue',
      value: `${totalRevenue.toFixed(2)} TND`,
      icon: DollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'bg-burgundy-500',
      textColor: 'text-burgundy-600 dark:text-burgundy-400',
      bgColor: 'bg-burgundy-100 dark:bg-[#3a0f17]/30',
    },
    {
      label: 'Products',
      value: totalProducts,
      icon: Package,
      color: 'bg-burgundy-500',
      textColor: 'text-burgundy-600 dark:text-burgundy-400',
      bgColor: 'bg-burgundy-100 dark:bg-[#3a0f17]/30',
    },
    {
      label: 'Categories',
      value: totalCategories,
      icon: Layers,
      color: 'bg-orange-500',
      textColor: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor your e-commerce platform</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-[#3a0f17] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-[#2d2838]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[#3a0f17] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-[#2d2838]"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Orders</h2>
              <Link
                to="/admin/orders"
                className="text-burgundy-600 dark:text-burgundy-400 hover:text-burgundy-700 dark:hover:text-burgundy-300 flex items-center gap-1 text-sm font-medium"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No orders yet</p>
              ) : (
                recentOrders.map((order: any) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1E0007]/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Order #{order._id?.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {order.items?.length || 0} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">{order.total?.toFixed(2)} TND</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'Delivered'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : order.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-burgundy-100 text-burgundy-800 dark:bg-[#3a0f17]/30 dark:text-burgundy-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Low Stock Products */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-[#3a0f17] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-[#2d2838]"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Low Stock Alert</h2>
              <Link
                to="/admin/products"
                className="text-burgundy-600 dark:text-burgundy-400 hover:text-burgundy-700 dark:hover:text-burgundy-300 flex items-center gap-1 text-sm font-medium"
              >
                Manage
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {lowStockProducts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">All products well stocked!</p>
              ) : (
                lowStockProducts.slice(0, 5).map((product: any) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1E0007]/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          product.stock === 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-orange-600 dark:text-orange-400'
                        }`}
                      >
                        {product.stock} left
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link
              to="/admin/products"
              className="p-6 bg-white dark:bg-[#3a0f17] rounded-xl shadow-sm border border-gray-200 dark:border-[#2d2838] hover:border-yellow-500 dark:hover:border-yellow-500 transition-colors group"
            >
              <Package className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Manage Products</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add, edit, or remove products</p>
            </Link>
            <Link
              to="/admin/orders"
              className="p-6 bg-white dark:bg-[#3a0f17] rounded-xl shadow-sm border border-gray-200 dark:border-[#2d2838] hover:border-yellow-500 dark:hover:border-yellow-500 transition-colors group"
            >
              <ShoppingCart className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">View Orders</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Process and manage orders</p>
            </Link>
            <Link
              to="/admin/categories"
              className="p-6 bg-white dark:bg-[#3a0f17] rounded-xl shadow-sm border border-gray-200 dark:border-[#2d2838] hover:border-yellow-500 dark:hover:border-yellow-500 transition-colors group"
            >
              <Layers className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Categories</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Organize product categories</p>
            </Link>
            <Link
              to="/admin/packs"
              className="p-6 bg-white dark:bg-[#3a0f17] rounded-xl shadow-sm border border-gray-200 dark:border-[#2d2838] hover:border-yellow-500 dark:hover:border-yellow-500 transition-colors group"
            >
              <Gift className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Manage Packs</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create and manage special offers</p>
            </Link>
            <Link
              to="/admin/users"
              className="p-6 bg-white dark:bg-[#3a0f17] rounded-xl shadow-sm border border-gray-200 dark:border-[#2d2838] hover:border-yellow-500 dark:hover:border-yellow-500 transition-colors group"
            >
              <Users className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Manage Users</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View and manage users</p>
            </Link>
          </div>
        </motion.div>

        {/* Hero Image Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white dark:bg-[#3a0f17] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-[#2d2838]"
        >
          <div className="flex items-center gap-3 mb-6">
            <ImageIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hero Image Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Hero Images (Multiple)
              </label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="hero-images-input"
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 dark:bg-yellow-500 text-white rounded-lg cursor-pointer hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span>Choose Files</span>
                </label>
                <input
                  id="hero-images-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                {selectedFiles.length > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedFiles.length} file(s) selected
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Select one or more image files to upload (JPEG, PNG, GIF, or WebP). Maximum 10 files.
              </p>
            </div>
            
            {/* Images Grid */}
            {previews.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hero Images ({previews.length} total)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {previews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative group bg-gray-100 dark:bg-[#1E0007] rounded-lg overflow-hidden border-2 border-gray-300 dark:border-burgundy-600 aspect-square"
                    >
                      <img
                        src={preview}
                        alt={`Hero image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/Untitled.png';
                        }}
                      />
                      <button
                        onClick={() => {
                          if (index < (heroImages?.length || 0)) {
                            handleDeleteImage(heroImages[index], index);
                          } else {
                            handleRemoveSelectedFile(index);
                          }
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                        title="Delete image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {index < (heroImages?.length || 0) && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                          Saved
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Button
              onClick={handleUpload}
              disabled={uploadHeroImages.isPending || selectedFiles.length === 0}
              loading={uploadHeroImages.isPending}
            >
              {uploadHeroImages.isPending ? 'Uploading...' : `Upload ${selectedFiles.length > 0 ? `${selectedFiles.length} ` : ''}Image(s)`}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
