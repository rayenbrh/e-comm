import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { CategoriesResponse } from '@/types';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<CategoriesResponse>('/categories');
      return data.categories;
    },
  });
};
