import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export interface PackProduct {
  product: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
    stock: number;
  };
  quantity: number;
}

export interface Pack {
  _id: string;
  name: string;
  description: string;
  products: PackProduct[];
  originalPrice: number;
  discountPrice: number;
  discountPercentage: number;
  image?: string;
  active: boolean;
  startDate: string;
  endDate?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PacksResponse {
  success: boolean;
  packs: Pack[];
}

interface PackResponse {
  success: boolean;
  pack: Pack;
}

export const usePacks = (featured?: boolean) => {
  return useQuery({
    queryKey: ['packs', featured],
    queryFn: async () => {
      const params = featured ? '?featured=true' : '';
      const { data } = await api.get<PacksResponse>(`/packs${params}`);
      return data.packs;
    },
  });
};

export const usePack = (id: string) => {
  return useQuery({
    queryKey: ['pack', id],
    queryFn: async () => {
      const { data } = await api.get<PackResponse>(`/packs/${id}`);
      return data.pack;
    },
    enabled: !!id,
  });
};

export const useAllPacks = () => {
  return useQuery({
    queryKey: ['packs', 'admin'],
    queryFn: async () => {
      const { data } = await api.get<PacksResponse>('/packs/admin/all');
      return data.packs;
    },
  });
};

export const useCreatePack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (packData: Partial<Pack> | FormData) => {
      const { data } = await api.post<PackResponse>('/packs', packData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
      toast.success('Pack created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create pack');
    },
  });
};

export const useUpdatePack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Pack> | FormData }) => {
      const { data: response } = await api.put<PackResponse>(`/packs/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
      toast.success('Pack updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update pack');
    },
  });
};

export const useDeletePack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/packs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
      toast.success('Pack deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete pack');
    },
  });
};

export const useTogglePackActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put<PackResponse>(`/packs/${id}/toggle-active`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle pack status');
    },
  });
};

