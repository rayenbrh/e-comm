import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { CategoriesResponse, Category } from '@/types';

export const useCategories = (includeSubcategories?: boolean) => {
  return useQuery({
    queryKey: ['categories', includeSubcategories],
    queryFn: async () => {
      const params = includeSubcategories ? '?includeSubcategories=true' : '';
      const { data } = await api.get<CategoriesResponse>(`/categories${params}`);
      return data.categories;
    },
  });
};
