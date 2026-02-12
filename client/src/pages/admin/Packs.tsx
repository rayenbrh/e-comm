import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAllPacks, useCreatePack, useUpdatePack, useDeletePack, useTogglePackActive } from '@/hooks/usePacks';
import { useProducts } from '@/hooks/useProducts';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import getImageUrl from '@/utils/imageUtils';
import { getLocalizedText } from '@/utils/multilingual';
import { useLanguageStore } from '@/stores/languageStore';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Package, Plus, Edit, Trash2, Search, X, Power, Upload } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';
import type { Pack } from '@/hooks/usePacks';

export const AdminPacks = () => {
  const { data: packs, isLoading } = useAllPacks();
  const { data: productsData } = useProducts();
  const createPack = useCreatePack();
  const updatePack = useUpdatePack();
  const deletePack = useDeletePack();
  const toggleActive = useTogglePackActive();
  const { t } = useTranslation();
  
  // Subscribe to language changes to trigger re-render when language changes
  // This ensures the component re-renders when language changes, even though we use getLocalizedText in the map
  useLanguageStore((state) => state.language);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const products = productsData?.products || [];

  const [formData, setFormData] = useState({
    name_fr: '',
    name_ar: '',
    description_fr: '',
    description_ar: '',
    products: [] as Array<{ product: string; quantity: number }>,
    originalPrice: '',
    discountPrice: '',
    discountPercentage: '',
    image: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    featured: false,
  });

  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const calculateDiscountPercentage = (original: number, discount: number) => {
    if (!original || original === 0) return 0;
    return Math.round(((original - discount) / original) * 100);
  };

  const handlePriceChange = (field: 'originalPrice' | 'discountPrice', value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === 'originalPrice' && prev.discountPrice) {
        newData.discountPercentage = calculateDiscountPercentage(numValue, parseFloat(prev.discountPrice)).toString();
      } else if (field === 'discountPrice' && prev.originalPrice) {
        newData.discountPercentage = calculateDiscountPercentage(parseFloat(prev.originalPrice), numValue).toString();
      }
      return newData;
    });
  };

  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const product = products.find((p) => p._id === selectedProductId);
    if (!product) return;

    if (formData.products.find((p) => p.product === selectedProductId)) {
      toast.error('Product already added to pack');
      return;
    }

    setFormData({
      ...formData,
      products: [...formData.products, { product: selectedProductId, quantity: selectedQuantity }],
    });
    setSelectedProductId('');
    setSelectedQuantity(1);
  };

  const handleRemoveProduct = (index: number) => {
    setFormData({
      ...formData,
      products: formData.products.filter((_, i) => i !== index),
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleOpenModal = (pack?: Pack) => {
    if (pack) {
      setEditingPack(pack);
      // Extract multilingual values
      const nameObj = typeof pack.name === 'object' ? pack.name : { fr: pack.name || '', ar: pack.name || '' };
      const descObj = typeof pack.description === 'object' ? pack.description : { fr: pack.description || '', ar: pack.description || '' };
      
      setFormData({
        name_fr: nameObj.fr || '',
        name_ar: nameObj.ar || '',
        description_fr: descObj.fr || '',
        description_ar: descObj.ar || '',
        products: pack.products.map((p) => ({ product: p.product._id, quantity: p.quantity })),
        originalPrice: pack.originalPrice.toString(),
        discountPrice: pack.discountPrice.toString(),
        discountPercentage: pack.discountPercentage.toString(),
        image: pack.image || '',
        startDate: pack.startDate ? new Date(pack.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: pack.endDate ? new Date(pack.endDate).toISOString().split('T')[0] : '',
        featured: pack.featured,
      });
      setImagePreview(pack.image || null);
      setSelectedImage(null);
    } else {
      setEditingPack(null);
      setFormData({
        name_fr: '',
        name_ar: '',
        description_fr: '',
        description_ar: '',
        products: [],
        originalPrice: '',
        discountPrice: '',
        discountPercentage: '',
        image: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        featured: false,
      });
      setImagePreview(null);
      setSelectedImage(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPack(null);
    setFormData({
      name_fr: '',
      name_ar: '',
      description_fr: '',
      description_ar: '',
      products: [],
      originalPrice: '',
      discountPrice: '',
      discountPercentage: '',
      image: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      featured: false,
    });
    setSelectedProductId('');
    setSelectedQuantity(1);
    setSelectedImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('pack-image-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.products.length === 0) {
      toast.error('Please add at least one product to the pack');
      return;
    }

    if (!formData.originalPrice || !formData.discountPrice) {
      toast.error('Please enter both original and discount prices');
      return;
    }

    // Create FormData if image is selected, otherwise use regular object
    const formDataToSend = new FormData();
    
    // Create multilingual objects
    const nameObj = { fr: formData.name_fr, ar: formData.name_ar };
    const descObj = { fr: formData.description_fr, ar: formData.description_ar };
    
    formDataToSend.append('name', JSON.stringify(nameObj));
    formDataToSend.append('description', JSON.stringify(descObj));
    formDataToSend.append('products', JSON.stringify(formData.products));
    formDataToSend.append('originalPrice', formData.originalPrice);
    formDataToSend.append('discountPrice', formData.discountPrice);
    formDataToSend.append('discountPercentage', formData.discountPercentage);
    formDataToSend.append('startDate', formData.startDate);
    if (formData.endDate) {
      formDataToSend.append('endDate', formData.endDate);
    }
    formDataToSend.append('featured', formData.featured.toString());
    
    // Add image if selected, otherwise use existing image URL
    if (selectedImage) {
      formDataToSend.append('packImage', selectedImage);
    } else if (formData.image && !editingPack) {
      // Only use URL if creating new pack and no image selected
      formDataToSend.append('image', formData.image);
    } else if (editingPack) {
      // When editing: if no preview and no image in formData, send empty string to delete
      if (!imagePreview && !formData.image) {
        formDataToSend.append('image', '');
      } else if (formData.image && !selectedImage) {
        // Keep existing image URL if editing and no new image selected
        formDataToSend.append('image', formData.image);
      }
    }

    try {
      if (editingPack) {
        await updatePack.mutateAsync({ id: editingPack._id, data: formDataToSend });
      } else {
        await createPack.mutateAsync(formDataToSend);
      }
      handleCloseModal();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('adminPacks.confirmDelete'))) {
      await deletePack.mutateAsync(id);
    }
  };

  const filteredPacks = packs?.filter((pack) => {
    const packName = typeof pack.name === 'string' ? pack.name : pack.name.fr || pack.name.ar || '';
    return packName.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

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
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">{t('adminPacks.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('adminPacks.description')}</p>
          </div>
          <Button onClick={() => handleOpenModal()} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            {t('adminPacks.createPack')}
          </Button>
        </motion.div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder={t('adminPacks.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPacks.map((pack) => (
            <motion.div
              key={pack._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#3a0f17] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-[#2d2838]"
            >
              {pack.image && (
                <img
                  src={getImageUrl(pack.image)}
                  alt={getLocalizedText(pack.name)}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{getLocalizedText(pack.name)}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    pack.active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {pack.active ? t('adminPacks.active') : t('adminPacks.inactive')}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{getLocalizedText(pack.description)}</p>
              
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  {pack.discountPrice !== undefined && pack.discountPrice !== null ? (
                    <>
                  <span className="text-2xl font-bold text-[#510013] dark:text-white">
                    {pack.discountPrice.toFixed(2)} TND
                  </span>
                      {pack.originalPrice !== undefined && pack.originalPrice !== null && (
                  <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                    {pack.originalPrice.toFixed(2)} TND
                  </span>
                      )}
                      {pack.discountPercentage !== undefined && pack.discountPercentage !== null && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{pack.discountPercentage}%
                  </span>
                      )}
                    </>
                  ) : (
                    <span className="text-lg text-gray-500 dark:text-gray-400">-</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {pack.products.length} {pack.products.length === 1 ? t('adminPacks.product') : t('adminPacks.products')}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenModal(pack)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {t('common.edit')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive.mutate(pack._id)}
                  className={pack.active ? 'text-orange-600' : 'text-green-600'}
                >
                  <Power className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(pack._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredPacks.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">{t('adminPacks.noPacks')}</p>
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPack ? t('adminPacks.editPack') : t('adminPacks.createPack')}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('adminPacks.packNameFr')}
              name="name_fr"
              value={formData.name_fr}
              onChange={handleInputChange}
              required
            />

            <Input
              label={t('adminPacks.packNameAr')}
              name="name_ar"
              value={formData.name_ar}
              onChange={handleInputChange}
              required
            />

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                {t('adminPacks.descriptionFr')}
              </label>
              <textarea
                name="description_fr"
                value={formData.description_fr}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-burgundy-600 rounded-lg bg-white dark:bg-[#3a0f17] text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                {t('adminPacks.descriptionAr')}
              </label>
              <textarea
                name="description_ar"
                value={formData.description_ar}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-burgundy-600 rounded-lg bg-white dark:bg-[#3a0f17] text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Add Products */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                {t('adminPacks.addProducts')}
              </label>
              <div className="flex gap-2 mb-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-burgundy-600 rounded-lg bg-white dark:bg-[#3a0f17] text-gray-900 dark:text-white"
                >
                  <option value="">{t('adminPacks.selectProduct')}</option>
                  {products.map((product) => {
                    // Handle products with variants
                    const hasVariants = product.hasVariants && product.variants && product.variants.length > 0;
                    let displayPrice: number | undefined;
                    
                    if (hasVariants && product.variants) {
                      const prices = product.variants
                        .map(v => v.promoPrice && v.promoPrice > 0 ? v.promoPrice : v.price)
                        .filter(p => p > 0);
                      displayPrice = prices.length > 0 ? Math.min(...prices) : undefined;
                    } else {
                      displayPrice = product.promoPrice && product.promoPrice > 0 
                        ? product.promoPrice 
                        : product.price;
                    }
                    
                    const priceText = displayPrice !== undefined && displayPrice !== null
                      ? `${hasVariants ? `${t('product.from')} ` : ''}${displayPrice.toFixed(2)} TND`
                      : t('product.selectVariant');
                    
                    return (
                    <option key={product._id} value={product._id}>
                        {getLocalizedText(product.name)} - {priceText}
                    </option>
                    );
                  })}
                </select>
                <Input
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                  className="w-24"
                  placeholder="Qty"
                />
                <Button type="button" onClick={handleAddProduct} disabled={!selectedProductId}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Selected Products */}
              {formData.products.length > 0 && (
                <div className="space-y-2 mt-2">
                  {formData.products.map((item, index) => {
                    const product = products.find((p) => p._id === item.product);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#1E0007] rounded"
                      >
                        <span className="text-sm text-gray-900 dark:text-white">
                          {getLocalizedText(product?.name)} x {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('adminPacks.originalPrice')}
                name="originalPrice"
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => handlePriceChange('originalPrice', e.target.value)}
                required
              />
              <Input
                label={t('adminPacks.discountPrice')}
                name="discountPrice"
                type="number"
                step="0.01"
                value={formData.discountPrice}
                onChange={(e) => handlePriceChange('discountPrice', e.target.value)}
                required
              />
            </div>

            <Input
              label={t('adminPacks.discountPercentage')}
              name="discountPercentage"
              type="number"
              value={formData.discountPercentage}
              onChange={handleInputChange}
              readOnly
            />

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                {t('adminPacks.packImage')}
              </label>
              <div className="space-y-4">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-burgundy-600">
                    <img
                      src={imagePreview}
                      alt="Pack preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedImage(null);
                        // Clear the file input
                        const fileInput = document.getElementById('pack-image-input') as HTMLInputElement;
                        if (fileInput) {
                          fileInput.value = '';
                        }
                        // If editing, clear the image field
                        if (editingPack) {
                          setFormData({ ...formData, image: '' });
                        }
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* File Input */}
                <label
                  htmlFor="pack-image-input"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-burgundy-600 rounded-lg cursor-pointer hover:border-yellow-500 dark:hover:border-yellow-500 transition-colors"
                >
                  <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {imagePreview ? t('adminPacks.changeImage') : t('adminPacks.uploadImage')}
                  </span>
                </label>
                <input
                  id="pack-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('adminPacks.imageHint')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('adminPacks.startDate')}
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
              <Input
                label={t('adminPacks.endDate')}
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm text-gray-900 dark:text-white">{t('adminPacks.featured')}</label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" loading={createPack.isPending || updatePack.isPending}>
                {editingPack ? t('common.update') : t('common.create')}
              </Button>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

