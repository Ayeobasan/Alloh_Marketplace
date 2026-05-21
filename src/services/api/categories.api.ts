import { apiClient } from './axios';
import { Category } from '@/types';

export const categoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get('/meta/categories');
    return response.data.data || response.data || [];
  },
};
