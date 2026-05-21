import { apiClient } from './axios';
import { DemandPost } from '@/types';

export interface GetDemandsParams {
  search?: string;
  state?: string;
  urgency?: string;
  quantity?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedDemands {
  demands: DemandPost[];
  total: number;
  page: number;
  totalPages: number;
}

export const demandsApi = {
  getDemands: async (params?: GetDemandsParams): Promise<PaginatedDemands> => {
    const response = await apiClient.get('/demands', { params });
    // Normalize response formats (in case the API wraps it under data or direct array)
    const result = response.data.data || response.data;
    if (Array.isArray(result)) {
      return {
        demands: result,
        total: result.length,
        page: 1,
        totalPages: 1,
      };
    }
    return {
      demands: result.data || result.demands || [],
      total: result.total || 0,
      page: result.page || 1,
      totalPages: result.pages || result.totalPages || 1,
    };
  },

  getMyPosts: async (): Promise<DemandPost[]> => {
    const response = await apiClient.get('/demands/my');
    const result = response.data.data || response.data;
    if (Array.isArray(result)) {
      return result;
    }
    return result.data || result.demands || [];
  },

  getDemandById: async (id: string): Promise<DemandPost> => {
    const response = await apiClient.get(`/demands/${id}`);
    return response.data.data || response.data;
  },

  createDemand: async (data: FormData | Partial<DemandPost>): Promise<DemandPost> => {
    const headers = data instanceof FormData
      ? { 'Content-Type': 'multipart/form-data' }
      : {};
    const response = await apiClient.post('/demands', data, { headers });
    return response.data.data || response.data;
  },

  updateDemand: async (id: string, data: FormData | Partial<DemandPost>): Promise<DemandPost> => {
    const headers = data instanceof FormData
      ? { 'Content-Type': 'multipart/form-data' }
      : {};
    const response = await apiClient.put(`/demands/${id}`, data, { headers });
    return response.data.data || response.data;
  },

  deleteDemand: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/demands/${id}`);
    return response.data.data || response.data;
  },
};
