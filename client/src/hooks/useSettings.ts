import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export const useHeroImage = () => {
  return useQuery({
    queryKey: ['settings', 'heroImage'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; heroImages: string[]; heroImage: string }>('/settings/hero-image');
      // Return array of images, fallback to single image for backward compatibility
      return data.heroImages && data.heroImages.length > 0 ? data.heroImages : [data.heroImage || '/Untitled.png'];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; settings: Record<string, string> }>('/settings');
      return data.settings;
    },
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: string; description?: string }) => {
      const { data } = await api.put('/settings', { key, value, description });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      if (variables.key === 'heroImage') {
        queryClient.invalidateQueries({ queryKey: ['settings', 'heroImage'] });
      }
      toast.success('Setting updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUploadHeroImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('heroImage', file);
      
      const { data } = await api.post('/settings/upload-hero-image', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'heroImage'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Hero image uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload hero image');
    },
  });
};

export const useUploadHeroImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('heroImages', file);
      });
      
      const { data } = await api.post('/settings/upload-hero-images', formData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'heroImage'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success(`${variables.length} hero image(s) uploaded successfully`);
    },
    onError: (error: Error) => {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload hero images');
    },
  });
};

export const useDeleteHeroImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imagePath: string) => {
      const { data } = await api.post('/settings/delete-hero-image', { imagePath });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'heroImage'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Hero image deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete hero image');
    },
  });
};

