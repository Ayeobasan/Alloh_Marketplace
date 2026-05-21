import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

// Centralized API Base URL from environment
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://allohbackend.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | PromiseLike<string>) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Automatic injection of accessToken
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Silent Refresh & Automatic Logout & Error Normalization
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Centralized Error normalization
    const errorData: any = error.response?.data;
    let normalizedMessage = errorData?.message || errorData?.error || error.message || 'An unexpected error occurred';
    
    if (errorData?.errors && Array.isArray(errorData.errors)) {
      normalizedMessage = errorData.errors.join('. ');
    } else if (errorData?.errors && typeof errorData.errors === 'object') {
      normalizedMessage = Object.values(errorData.errors).flat().join('. ');
    }
    
    // Create custom error object to throw
    const normalizedError = new Error(normalizedMessage);
    (normalizedError as any).status = error.response?.status;
    (normalizedError as any).data = errorData;
    (normalizedError as any).code = error.code;

    // Check if unauthorized and not retrying yet
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/refresh-token')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      
      if (!refreshToken) {
        useAuthStore.getState().clearCredentials();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(normalizedError);
      }

      try {
        // Fetch new token
        const refreshResponse = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data.data || refreshResponse.data;

        // Update auth store with new tokens
        useAuthStore.setState({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken || refreshToken, // fallback if new refresh token isn't returned
        });

        processQueue(null, newAccessToken);
        
        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        
        // Refresh failed, clear session and force login
        useAuthStore.getState().clearCredentials();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(normalizedError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizedError);
  }
);
