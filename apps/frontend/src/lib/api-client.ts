import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { config } from '../config';
import { clearAllData, getSessionData, saveSessionData } from './storage';

interface ApiError {
  message: string;
  statusCode: number;
  errors?: any;
}

class ApiClient {
  private client: AxiosInstance;
  private activeOrganizationId: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiBaseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Enable cookies for JWT
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (this.activeOrganizationId) {
          config.headers['X-Organization-Id'] = this.activeOrganizationId;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor - handle errors globally
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        if (error.response) {
          // Handle 401 Unauthorized - only redirect when there is an active
          // session token. Pre-auth flows (registration TOTP, enrollment TOTP)
          // also receive 401 on bad codes; those must NOT wipe local data or
          // redirect to login, they just propagate as a normal error.
          if (error.response.status === 401 && this.cachedToken !== null) {
            this.handleUnauthorized();
          }
        }

        return Promise.reject(this.normalizeError(error));
      },
    );
  }

  private getAuthToken(): string | null {
    // Note: This is synchronous, but token is cached in memory
    // See setAuthToken for how token is stored in IndexedDB
    return this.cachedToken;
  }

  private cachedToken: string | null = null;

  private async handleUnauthorized() {
    // Clear auth data from IndexedDB
    await clearAllData();

    // Clear cached token
    this.cachedToken = null;
    this.activeOrganizationId = null;

    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  private normalizeError(error: AxiosError): ApiError {
    console.error(error, error.response?.data, error.response?.status);
    if (error.response) {
      return {
        message: (error.response.data as any)?.message || 'An error occurred',
        statusCode: error.response.status,
        errors: (error.response.data as any)?.errors,
      };
    } else if (error.request) {
      return {
        message: 'No response from server. Please check your connection.',
        statusCode: 0,
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred',
        statusCode: 0,
      };
    }
  }

  // HTTP Methods
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  // Helper method to set auth token
  async setAuthToken(token: string) {
    await saveSessionData('jwt_token', token);
    this.cachedToken = token;
  }

  // Helper method to clear auth token
  async clearAuthToken() {
    await clearAllData();
    this.cachedToken = null;
    this.activeOrganizationId = null;
  }

  // Helper method to initialize token from storage on app load
  async initializeAuth() {
    const token = await getSessionData('jwt_token');
    if (typeof token === 'string') {
      this.cachedToken = token;
    }
  }

  setOrganizationId(organizationId: string | null) {
    this.activeOrganizationId = organizationId;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
