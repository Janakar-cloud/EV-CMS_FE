import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '@/config/constants';
import { captureException, addBreadcrumb } from './error-tracking';

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      config => {
        // Get token from localStorage
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        addBreadcrumb(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => this.handleResponseError(error)
    );
  }

  private async handleResponseError(error: AxiosError) {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If we got a 401, try a single refresh-then-retry flow
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Do not try to refresh if the failing request is the refresh endpoint itself
      const url = originalRequest.url || '';
      if (url.includes('/auth/refresh-token')) {
        this.handleError(error);
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const newToken = await this.getOrRefreshToken();

        if (newToken) {
          // Update auth header and retry original request once
          originalRequest.headers = originalRequest.headers || {};
          (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
          return this.instance(originalRequest);
        }
      } catch (refreshError) {
        // Fall through to standard 401 handling below
        console.error('Token refresh failed:', refreshError);
      }
    }

    this.handleError(error);
    return Promise.reject(error);
  }

  private async getOrRefreshToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.refreshAccessToken();

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (typeof window === 'undefined') {
      return null;
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return null;
    }

    try {
      // Use a bare axios call to avoid interceptor recursion
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/auth/refresh-token`,
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data: any = response.data;
      const newToken: string | undefined =
        data?.token ?? data?.data?.accessToken ?? data?.data?.token;
      const newRefreshToken: string | undefined = data?.refreshToken ?? data?.data?.refreshToken;

      if (newToken) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        return newToken;
      }

      return null;
    } catch (error) {
      // On refresh failure, clear auth and let caller handle redirect
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      localStorage.removeItem('refreshToken');
      return null;
    }
  }

  private handleError(error: AxiosError) {
    if (!error.response) {
      // Network error
      captureException(new Error('Network error: ' + error.message), {
        type: 'network_error',
      });
      toast.error('Network Error', {
        description: ERROR_MESSAGES.NETWORK_ERROR,
      });
      return;
    }

    const status = error.response.status;
    const data = error.response.data as any;

    // Track all errors in Sentry
    captureException(error, {
      status,
      url: error.config?.url,
      message: data?.message,
    });

    switch (status) {
      case 400:
        toast.error('Bad Request', {
          description: data?.message || 'Invalid request. Please check your input.',
        });
        break;

      case 401:
        toast.error('Unauthorized', {
          description: ERROR_MESSAGES.UNAUTHORIZED,
        });
        // Clear auth data and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
          try {
            window.location.href = '/login';
          } catch {
            // In test environments (jsdom), full navigation may not be implemented.
            // Swallow navigation errors while still clearing auth state.
          }
        }
        break;

      case 403:
        toast.error('Forbidden', {
          description: ERROR_MESSAGES.FORBIDDEN,
        });
        break;

      case 404:
        toast.error('Not Found', {
          description: data?.message || ERROR_MESSAGES.NOT_FOUND,
        });
        break;

      case 422:
        toast.error('Validation Error', {
          description: data?.message || ERROR_MESSAGES.VALIDATION_ERROR,
        });
        break;

      case 429:
        toast.error('Too Many Requests', {
          description: 'Please slow down and try again later.',
        });
        break;

      case 500:
        toast.error('Server Error', {
          description: 'An internal server error occurred. Please try again later.',
        });
        break;

      case 503:
        toast.error('Service Unavailable', {
          description: 'The server is temporarily unavailable. Please try again later.',
        });
        break;

      default:
        toast.error('Error', {
          description: data?.message || 'An unexpected error occurred.',
        });
    }
  }

  // HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;

// Re-export AxiosError type so other modules can use it without
// importing axios directly. This supports the "single API client"
// rule while preserving error typing where needed.
export type { AxiosError };
