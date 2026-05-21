import { apiClient } from './axios';

export const statesApi = {
  getStates: async (): Promise<string[]> => {
    const response = await apiClient.get('/meta/states');
    return response.data.data || response.data || [];
  },
};
