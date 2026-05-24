import { apiClient } from './axios';

export interface CreateReportData {
  contentId: string;
  contentType: 'demand' | 'product';
  reason: string;
}

export const reportsApi = {
  createReport: async ({ contentId, contentType, reason }: CreateReportData): Promise<{ success: boolean }> => {
    const url = contentType === 'demand'
      ? `/reports/demand_post/${contentId}`
      : `/reports/product/${contentId}`;
    const response = await apiClient.post(url, { reason });
    return response.data.data || response.data;
  },
};
