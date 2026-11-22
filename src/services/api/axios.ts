import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

// Centralized API Base URL from environment
const baseURL = typeof window !== 'undefined'
  ? '/api/proxy'
  : (process.env.API_BASE_URL || 'https://allohbackend.onrender.com/api/v1');

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Errors thrown by apiClient: the backend message plus the HTTP status and body. */
export interface ApiError extends Error {
  status?: number;
  data?: unknown;
  code?: string;
}

const forceLogout = () => {
  useAuthStore.getState().clearCredentials();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

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
    const normalizedError: ApiError = new Error(normalizedMessage);
    normalizedError.status = error.response?.status;
    normalizedError.data = errorData;
    normalizedError.code = error.code;

    // Only an authenticated request can fail because the session expired. A 401 from an
    // /auth/* endpoint (wrong password, bad OTP, logout) or from a request sent without a
    // token (e.g. one still in flight after logout) is a normal error, not a reason to
    // refresh or bounce the user to /login.
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');
    const sentWithToken = Boolean(originalRequest?.headers?.Authorization);

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint && sentWithToken) {
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

      const refreshToken = useAuthStore.getState().refreshToken;

      // Checked before taking the refresh lock, so the lock can't be left held.
      if (!refreshToken) {
        forceLogout();
        return Promise.reject(normalizedError);
      }

      originalRequest._retry = true;
      isRefreshing = true;

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
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh failed, clear session and force login
        forceLogout();

        return Promise.reject(normalizedError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizedError);
  }
);
