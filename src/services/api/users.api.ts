import { apiClient } from './axios';
import { User } from '@/types';

export const usersApi = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/users/me');
    return response.data.data || response.data;
  },

  updateProfile: async (data: Partial<User> | FormData): Promise<User> => {
    const headers = data instanceof FormData
      ? { 'Content-Type': 'multipart/form-data' }
      : {};

    const response = await apiClient.patch('/users/me', data, { headers });
    return response.data.data || response.data;
  },

  setupSellerProfile: async (formData: FormData): Promise<User> => {
    const response = await apiClient.post('/users/me/seller-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data || response.data;
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data || response.data;
  },
};
