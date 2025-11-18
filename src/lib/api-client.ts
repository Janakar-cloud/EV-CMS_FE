import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '@/config/constants';

class ApiClient {
  private instance: AxiosInstance;

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
      (config) => {
        // Get token from localStorage
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: AxiosError) {
    if (!error.response) {
      // Network error
      toast.error('Network Error', {
        description: ERROR_MESSAGES.NETWORK_ERROR,
      });
      return;
    }

    const status = error.response.status;
    const data = error.response.data as any;

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
          window.location.href = '/login';
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
