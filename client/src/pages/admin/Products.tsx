import { useState } from 'react';
import { motion } from 'framer-motion';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Package, Plus, Edit, Trash2, Search, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import getImageUrl from '@/utils/imageUtils';
import type { ProductVariant, VariantAttribute } from '@/types';

export const AdminProducts = () => {
  const { data: productsData, isLoading } = useProducts();
  const { data: categories } = useCategories(true); // Get categories with subcategories
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    promoPrice: '',
    stock: '',
    category: '',
    sku: '',
    images: '',
    tags: '',
    featured: false,
    hasVariants: false,
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [variantAttributes, setVariantAttributes] = useState<VariantAttribute[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantImages, setVariantImages] = useState<Map<number, File>>(new Map());

  const products = productsData?.products || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price?.toString() || '',
        promoPrice: product.promoPrice?.toString() || '',
        stock: product.stock?.toString() || '',
        category: product.category?._id || product.category || '',
        sku: product.sku || '',
        images: product.images?.join(', ') || '',
        tags: product.tags?.join(', ') || '',
        featured: product.featured || false,
        hasVariants: product.hasVariants || false,
      });
      setImagePreviews(product.images || []);
      setSelectedImages([]);
      setVariantAttributes(product.variantAttributes || []);
      setVariants(product.variants || []);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        promoPrice: '',
        stock: '',
        category: '',
        sku: '',
        images: '',
        tags: '',
        featured: false,
        hasVariants: false,
      });
      setImagePreviews([]);
      setSelectedImages([]);
      setVariantAttributes([]);
      setVariants([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      promoPrice: '',
      stock: '',
      category: '',
      sku: '',
      images: '',
      tags: '',
      featured: false,
      hasVariants: false,
    });
    setImagePreviews([]);
    setSelectedImages([]);
    setVariantAttributes([]);
    setVariants([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setSelectedImages(prev => [...prev, ...validFiles]);
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const existingImagesCount = editingProduct?.images?.length || 0;
    const isNewImage = index >= existingImagesCount;
    
    if (isNewImage) {
      // Remove from selectedImages (new files)
      const adjustedIndex = index - existingImagesCount;
      setSelectedImages(prev => prev.filter((_, i) => i !== adjustedIndex));
    }
    // Remove from imagePreviews (both existing and new)
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for variants
    if (formData.hasVariants) {
      if (variantAttributes.length === 0) {
        toast.error('Please add at least one variant attribute (e.g., Color, Size)');
        return;
      }
      if (variants.length === 0) {
        toast.error('Please add at least one variant');
        return;
      }
    } else {
      if (!formData.price || !formData.stock) {
        toast.error('Price and stock are required for products without variants');
        return;
      }
    }

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('tags', formData.tags);
    formDataToSend.append('featured', formData.featured.toString());
    formDataToSend.append('hasVariants', formData.hasVariants.toString());

    if (formData.hasVariants) {
      // Product with variants
      formDataToSend.append('variantAttributes', JSON.stringify(variantAttributes));
      formDataToSend.append('variants', JSON.stringify(variants));
      // Price and stock are optional for products with variants
      if (formData.price) formDataToSend.append('price', formData.price);
      if (formData.promoPrice) formDataToSend.append('promoPrice', formData.promoPrice);
      if (formData.stock) formDataToSend.append('stock', formData.stock);
    } else {
      // Product without variants
      formDataToSend.append('price', formData.price);
      if (formData.promoPrice) formDataToSend.append('promoPrice', formData.promoPrice);
      formDataToSend.append('stock', formData.stock);
    }

    if (formData.sku) formDataToSend.append('sku', formData.sku);

    // Collect all final images: existing images that are still in previews + new uploaded images
    if (editingProduct) {
      // Filter existing images that are still in previews
      // Existing images are URLs (not data URLs), and they must be in the original product images
      const existingImagesInPreviews = imagePreviews.filter(preview => {
        // Check if it's an existing image (URL, not data URL) and still in original images
        const isExistingImage = !preview.startsWith('data:') && 
                                editingProduct.images && 
                                editingProduct.images.includes(preview);
        return isExistingImage;
      });
      
      // Send all final images (existing kept + new ones will be added by backend)
      formDataToSend.append('images', JSON.stringify(existingImagesInPreviews));
    }

    // Add new uploaded images
    selectedImages.forEach(file => {
      formDataToSend.append('productImages', file);
    });

    // Add variant images
    variantImages.forEach((file, index) => {
      formDataToSend.append(`variantImage_${index}`, file);
    });

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct._id, formData: formDataToSend });
      } else {
        await createProduct.mutateAsync(formDataToSend);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting product');
      }
    }
  };

  const filteredProducts = products.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Manage Products</h1>
              <p className="text-gray-600 dark:text-gray-400">{products.length} total products</p>
            </div>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="w-5 h-5 mr-2" />
              Add Product
            </Button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-burgundy-600 rounded-lg bg-white dark:bg-[#3a0f17] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#3a0f17] rounded-xl shadow-sm border border-gray-200 dark:border-[#2d2838] overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-burgundy-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Promo Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Category</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No products found</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product: any) => (
                    <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(product.images?.[0])}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                            {product.featured && (
                              <span className="text-xs text-indigo-600 dark:text-indigo-400">Featured</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{product.sku}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{product.price.toFixed(2)} TND</td>
                      <td className="px-6 py-4">
                        {product.promoPrice && product.promoPrice > 0 ? (
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {product.promoPrice.toFixed(2)} TND
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.stock === 0
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : product.stock < 10
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {product.category?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-[#1E0007]/30 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Add/Edit Product Modal */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? 'Edit Product' : 'Add Product'} size="xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-burgundy-600 rounded-lg bg-white dark:bg-burgundy-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-burgundy-600 rounded-lg bg-white dark:bg-burgundy-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Images
              </label>
              <div className="flex items-center gap-4 mb-2">
                <label
                  htmlFor="product-images-input"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg cursor-pointer hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span>Choose Images</span>
                </label>
                <input
                  id="product-images-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                {selectedImages.length > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedImages.length} file(s) selected
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Select one or more image files (JPEG, PNG, GIF, or WebP).
              </p>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group bg-gray-100 dark:bg-[#1E0007] rounded-lg overflow-hidden">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-300 dark:border-burgundy-600"
                        onError={(e) => {
                          // Show placeholder if image fails to load
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage not found%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Input
              label="Tags (comma-separated)"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="tag1, tag2, tag3"
            />
            
            {/* Variants Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="hasVariants"
                checked={formData.hasVariants}
                onChange={(e) => {
                  setFormData({ ...formData, hasVariants: e.target.checked });
                  if (!e.target.checked) {
                    setVariantAttributes([]);
                    setVariants([]);
                  }
                }}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                This product has variants (Color, Size, etc.)
              </label>
            </div>

            {/* Variants Configuration */}
            {formData.hasVariants && (
              <div className="space-y-4 p-4 border border-gray-300 dark:border-burgundy-600 rounded-lg bg-gray-50 dark:bg-[#1E0007]">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Variant Attributes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Define the attributes for variants (e.g., Color, Size)
                </p>
                
                {/* Add Variant Attribute */}
                <div className="space-y-2">
                  {variantAttributes.map((attr, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-burgundy-700 rounded">
                      <span className="font-medium text-gray-900 dark:text-white">{attr.name}:</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {attr.values.join(', ')}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setVariantAttributes(variantAttributes.filter((_, i) => i !== index));
                          // Remove variants that use this attribute
                          setVariants(variants.filter(v => !v.attributes[attr.name]));
                        }}
                        className="ml-auto p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <AddVariantAttributeForm
                    onAdd={(name, values) => {
                      if (variantAttributes.some(a => a.name.toLowerCase() === name.toLowerCase())) {
                        toast.error('This attribute already exists');
                        return;
                      }
                      setVariantAttributes([...variantAttributes, { name, values }]);
                    }}
                  />
                </div>

                {/* Variants List */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Variants</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Add variants with their specific attributes, images, prices, and stock
                  </p>
                  
                  <div className="space-y-4">
                    {variants.map((variant, index) => (
                      <VariantForm
                        key={index}
                        variant={variant}
                        variantAttributes={variantAttributes}
                        onUpdate={(updatedVariant, imageFile) => {
                          const newVariants = [...variants];
                          newVariants[index] = updatedVariant;
                          setVariants(newVariants);
                          if (imageFile) {
                            setVariantImages(new Map(variantImages.set(index, imageFile)));
                          }
                        }}
                        onRemove={() => {
                          setVariants(variants.filter((_, i) => i !== index));
                          const newMap = new Map(variantImages);
                          newMap.delete(index);
                          setVariantImages(newMap);
                        }}
                      />
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (variantAttributes.length === 0) {
                          toast.error('Please add variant attributes first');
                          return;
                        }
                        setVariants([...variants, {
                          attributes: {},
                          price: 0,
                          stock: 0,
                        }]);
                      }}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Variant
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Price and Stock - only show if no variants */}
            {!formData.hasVariants && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price (TND)"
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    label="Promo Price (TND) - Optional"
                    type="number"
                    step="0.01"
                    name="promoPrice"
                    value={formData.promoPrice}
                    onChange={handleInputChange}
                    placeholder="Discounted price"
                  />
                </div>
                <Input
                  label="Stock"
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
              </>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Featured Product
              </label>
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

// Component for adding variant attributes
const AddVariantAttributeForm = ({ onAdd }: { onAdd: (name: string, values: string[]) => void }) => {
  const [name, setName] = useState('');
  const [values, setValues] = useState('');

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!name.trim()) {
      toast.error('Attribute name is required');
      return;
    }
    const valuesArray = values.split(',').map(v => v.trim()).filter(v => v);
    if (valuesArray.length === 0) {
      toast.error('Please add at least one value');
      return;
    }
    onAdd(name.trim(), valuesArray);
    setName('');
    setValues('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleAdd(e as any);
    }
  };

  return (
    <div className="flex gap-2" onKeyDown={handleKeyPress}>
      <Input
        placeholder="Attribute name (e.g., Color)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1"
      />
      <Input
        placeholder="Values (comma-separated, e.g., Red, Blue, Green)"
        value={values}
        onChange={(e) => setValues(e.target.value)}
        className="flex-1"
      />
      <Button type="button" onClick={handleAdd} size="sm">
        <Plus className="w-4 h-4 mr-1" />
        Add
      </Button>
    </div>
  );
};

// Component for editing a variant
const VariantForm = ({ 
  variant, 
  variantAttributes, 
  onUpdate, 
  onRemove 
}: { 
  variant: ProductVariant;
  variantAttributes: VariantAttribute[];
  onUpdate: (variant: ProductVariant, imageFile?: File) => void;
  onRemove: () => void;
}) => {
  const [localVariant, setLocalVariant] = useState<ProductVariant>(variant);
  const [variantImage, setVariantImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(variant.image || '');

  const handleAttributeChange = (attrName: string, value: string) => {
    setLocalVariant({
      ...localVariant,
      attributes: {
        ...localVariant.attributes,
        [attrName]: value,
      },
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setVariantImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = () => {
    // Validate that all attributes are selected
    for (const attr of variantAttributes) {
      if (!localVariant.attributes[attr.name]) {
        toast.error(`Please select a value for ${attr.name}`);
        return;
      }
    }
    // If image preview is a data URL, it means a new file was selected
    const imageFile = imagePreview && imagePreview.startsWith('data:') ? variantImage : undefined;
    onUpdate(localVariant, imageFile || undefined);
  };

  return (
    <div className="p-4 border border-gray-300 dark:border-burgundy-600 rounded-lg bg-white dark:bg-burgundy-700">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-white">Variant</h4>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Attribute Selection */}
        {variantAttributes.map((attr) => (
          <div key={attr.name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {attr.name}
            </label>
            <select
              value={localVariant.attributes[attr.name] || ''}
              onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-burgundy-600 rounded-lg bg-white dark:bg-burgundy-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select {attr.name}</option>
              {attr.values.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Variant Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Variant Image (Optional)
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg cursor-pointer hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors">
              <Upload className="w-4 h-4" />
              <span>Choose Image</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Variant preview"
                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300 dark:border-burgundy-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setVariantImage(null);
                    setLocalVariant({ ...localVariant, image: undefined });
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Price, Promo Price, Stock */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Price (TND)"
            type="number"
            step="0.01"
            value={localVariant.price.toString()}
            onChange={(e) => setLocalVariant({ ...localVariant, price: parseFloat(e.target.value) || 0 })}
            required
          />
          <Input
            label="Promo Price (TND)"
            type="number"
            step="0.01"
            value={localVariant.promoPrice?.toString() || ''}
            onChange={(e) => setLocalVariant({ 
              ...localVariant, 
              promoPrice: e.target.value ? parseFloat(e.target.value) : null 
            })}
            placeholder="Optional"
          />
          <Input
            label="Stock"
            type="number"
            value={localVariant.stock.toString()}
            onChange={(e) => setLocalVariant({ ...localVariant, stock: parseInt(e.target.value) || 0 })}
            required
          />
        </div>

        {/* SKU */}
        <Input
          label="SKU (Optional)"
          value={localVariant.sku || ''}
          onChange={(e) => setLocalVariant({ ...localVariant, sku: e.target.value })}
          placeholder="SKU code"
        />

        <Button type="button" onClick={handleUpdate} className="w-full">
          Update Variant
        </Button>
      </div>
    </div>
  );
};
