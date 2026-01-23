import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useCategories';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Layers, Plus, Edit, Trash2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';

export const AdminCategories = () => {
  const { data: categories, isLoading } = useCategories(true); // Get categories with subcategories
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [selectedParentCategory, setSelectedParentCategory] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    parent: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Get main categories (no parent) for parent selection
  const mainCategories = categories?.filter((cat: any) => !cat.parent && !cat.isSubCategory) || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (category?: any, isSubCategory?: boolean, parentCategory?: any) => {
    if (isSubCategory && parentCategory) {
      setSelectedParentCategory(parentCategory);
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        parent: parentCategory._id,
      });
      setImagePreview('');
      setSelectedImage(null);
      setIsSubCategoryModalOpen(true);
    } else if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        image: category.image || '',
        parent: category.parent || '',
      });
      setImagePreview(category.image || '');
      setSelectedImage(null);
      setIsModalOpen(true);
    } else {
      setEditingCategory(null);
      setSelectedParentCategory(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        parent: '',
      });
      setImagePreview('');
      setSelectedImage(null);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSubCategoryModalOpen(false);
    setEditingCategory(null);
    setSelectedParentCategory(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      parent: '',
    });
    setImagePreview('');
    setSelectedImage(null);
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
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (editingCategory && editingCategory.image) {
      setImagePreview(editingCategory.image);
    } else {
      setImagePreview('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      
      // Add parent if selected
      if (formData.parent) {
        formDataToSend.append('parent', formData.parent);
      }
      
      // Add image if uploaded, otherwise keep existing image
      if (selectedImage) {
        formDataToSend.append('categoryImage', selectedImage);
      } else if (formData.image && !editingCategory) {
        // Only send image URL if creating new category and no file uploaded
        formDataToSend.append('image', formData.image);
      } else if (editingCategory && editingCategory.image && !selectedImage) {
        // Keep existing image when editing
        formDataToSend.append('image', editingCategory.image);
      }

      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success(formData.parent ? 'Subcategory updated successfully' : 'Category updated successfully');
      } else {
        await api.post('/categories', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success(formData.parent ? 'Subcategory created successfully' : 'Category created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Category deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete category');
      }
    }
  };

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
              <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Manage Categories</h1>
              <p className="text-gray-600 dark:text-gray-400">{categories?.length || 0} total categories</p>
            </div>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="w-5 h-5 mr-2" />
              Add Category
            </Button>
          </div>
        </motion.div>

        {!categories || categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white dark:bg-[#3a0f17] rounded-xl"
          >
            <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">No categories yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first category to organize products</p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="w-5 h-5 mr-2" />
              Add Category
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category: any, index: number) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-[#3a0f17] rounded-xl shadow-sm border border-gray-200 dark:border-[#2d2838] overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gray-100 dark:bg-burgundy-700 overflow-hidden">
                  <img
                    src={category.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{category.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {category.description || 'No description'}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleOpenModal(category)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(category._id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Category Modal */}
        <Modal
          isOpen={isModalOpen || isSubCategoryModalOpen}
          onClose={handleCloseModal}
          title={
            isSubCategoryModalOpen
              ? `Add Subcategory to ${selectedParentCategory?.name || ''}`
              : editingCategory
              ? 'Edit Category'
              : 'Add Category'
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Parent Category Selector (only for new categories, not subcategories) */}
            {!isSubCategoryModalOpen && !editingCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Parent Category (Optional - leave empty for main category)
                </label>
                <select
                  name="parent"
                  value={formData.parent}
                  onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-burgundy-600 rounded-lg bg-white dark:bg-burgundy-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">None (Main Category)</option>
                  {mainCategories.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isSubCategoryModalOpen && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Creating subcategory under: <strong>{selectedParentCategory?.name}</strong>
                </p>
              </div>
            )}

            <Input
              label="Category Name"
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
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-burgundy-600 rounded-lg bg-white dark:bg-burgundy-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category Image
              </label>
              <div className="flex items-center gap-4 mb-2">
                <label
                  htmlFor="category-image-input"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg cursor-pointer hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span>Choose Image</span>
                </label>
                <input
                  id="category-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {selectedImage && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedImage.name}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Select an image file (JPEG, PNG, GIF, or WebP).
              </p>
              {imagePreview && (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Category preview"
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-300 dark:border-burgundy-600"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                {editingCategory ? 'Update Category' : isSubCategoryModalOpen ? 'Create Subcategory' : 'Create Category'}
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
