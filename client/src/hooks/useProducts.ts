import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { ProductsResponse, Product } from '@/types';
import toast from 'react-hot-toast';

interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: 'price-asc' | 'price-desc' | 'rating' | 'newest';
  page?: number;
  limit?: number;
  featured?: boolean;
}

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
      const { data } = await api.get<ProductsResponse>(`/products?${params}`);
      return data;
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; product: Product }>(`/products/${id}`);
      return data.product;
    },
    enabled: !!id,
  });
};

export const useRelatedProducts = (id: string) => {
  return useQuery({
    queryKey: ['products', 'related', id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; products: Product[] }>(
        `/products/${id}/related`
      );
      return data.products;
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      const { data } = await api.post('/products', productData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const response = await api.put(`/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
