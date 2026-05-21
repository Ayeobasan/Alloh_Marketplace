import { apiClient } from './axios';

export interface CreateReportData {
  postId: string;
  reason: string;
}

export const reportsApi = {
  createReport: async ({ postId, reason }: CreateReportData): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/reports/demands/${postId}`, { reason });
    return response.data.data || response.data;
  },
};
