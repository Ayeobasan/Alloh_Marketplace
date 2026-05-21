import { apiClient } from './axios';
import { User } from '@/types';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  registerBuyer: async (data: any) => {
    const response = await apiClient.post('/auth/signup/buyer', data);
    return response.data;
  },

  registerSeller: async (data: any) => {
    // Standard register seller data
    const response = await apiClient.post('/auth/signup/seller', data);
    return response.data;
  },

  verifyEmail: async (email: string, otpCode: string) => {
    const response = await apiClient.post('/auth/verify-email', { email, code: otpCode, otp: otpCode });
    return response.data;
  },

  resendOtp: async (email: string) => {
    const response = await apiClient.post('/auth/resend-otp', { email });
    return response.data;
  },

  login: async (credentials: any): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    // Standardize backend response wrapping
    return response.data.data || response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data: any) => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },
};
