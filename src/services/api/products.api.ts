import { apiClient } from './axios';
import { Product, PaginatedProducts } from '@/types';

export interface GetProductsParams {
  search?: string;
  state?: string;
  category_id?: string;
  status?: string;
  sort?: string;
  order?: string;
  page?: number;
  limit?: number;
}

export const productsApi = {
  getProducts: async (params?: GetProductsParams): Promise<PaginatedProducts> => {
    const response = await apiClient.get('/products', { params });
    const result = response.data.data || response.data;
    
    // Normalize in case of direct array vs paginated shape
    if (Array.isArray(result)) {
      return {
        data: result,
        total: result.length,
        page: 1,
        limit: result.length,
        pages: 1,
      };
    }
    
    return {
      data: result.data || result.products || [],
      total: result.total || 0,
      page: result.page || 1,
      limit: result.limit || 10,
      pages: result.pages || result.totalPages || 1,
    };
  },

  getMyProducts: async (params?: { page?: number; limit?: number }): Promise<PaginatedProducts> => {
    const response = await apiClient.get('/products/my', { params });
    const result = response.data.data || response.data;

    if (Array.isArray(result)) {
      return {
        data: result,
        total: result.length,
        page: 1,
        limit: result.length,
        pages: 1,
      };
    }

    return {
      data: result.data || result.products || [],
      total: result.total || 0,
      page: result.page || 1,
      limit: result.limit || 10,
      pages: result.pages || result.totalPages || 1,
    };
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.data || response.data;
  },

  createProduct: async (formData: FormData): Promise<Product> => {
    const response = await apiClient.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data || response.data;
  },

  updateProduct: async (id: string, formData: FormData): Promise<Product> => {
    const response = await apiClient.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data || response.data;
  },

  deleteProduct: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data.data || response.data;
  },
};
