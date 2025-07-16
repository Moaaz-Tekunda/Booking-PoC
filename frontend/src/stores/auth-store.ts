import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthTokens, AuthState, LoginRequest, RegisterRequest } from '@/types/auth';
import apiClient from '@/lib/api';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// storing refresh tokens seperately
const tokenStorage = {
  get: (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  set: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  remove: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<AuthTokens | null>;
  getCurrentUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  
  // Helpers
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  canAccess: (resource: string) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      // Login action
      login: async (email: string, password: string): Promise<boolean> => {
        try {
          set({ isLoading: true, error: null });

          console.log('Attempting login for:', email);

          const response = await apiClient.post('/auth/login', {
            email,
            password,
          });

          const tokens: AuthTokens = response.data;
          console.log('Login successful, tokens received');

          // Store refresh token securely
          tokenStorage.set('refresh_token', tokens.refresh_token);

          set({
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Get user info immediately after login
          await get().getCurrentUser();

          return true;
        } catch (error: any) {
          console.error('Login failed:', error);
          const errorMessage = error.response?.data?.detail || 'Login failed';
          
          set({ 
            user: null, 
            tokens: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: errorMessage
          });
          return false;
        }
      },

      // Register action
      register: async (userData: RegisterRequest): Promise<boolean> => {
        try {
          set({ isLoading: true, error: null });

          console.log('Attempting registration for:', userData.email);

          // Create user account
          const response = await apiClient.post('/users/', userData);
          console.log('Registration successful');
          
          // Auto-login after registration
          const loginSuccess = await get().login(userData.email, userData.password);
          
          return loginSuccess;
        } catch (error: any) {
          console.error('Registration failed:', error);
          const errorMessage = error.response?.data?.detail || 'Registration failed';
          
          set({ 
            isLoading: false,
            error: errorMessage 
          });
          return false;
        }
      },

      // Logout action
      logout: async (): Promise<void> => {
        try {
          const { tokens } = get();
          
          if (tokens?.refresh_token) {
            console.log('Logging out...');
            
            // Call backend logout endpoint
            await apiClient.post('/auth/logout', {
              refresh_token: tokens.refresh_token,
            });
            
            console.log('Server logout successful');
          }
        } catch (error) {
          console.error('Logout API call failed:', error);
          // Continue with local logout even if server call fails
        } finally {
          // Clear all local state and storage
          tokenStorage.remove('refresh_token');
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          
          console.log('Local state cleared');
        }
      },

      // Refresh token action
      refreshToken: async (): Promise<AuthTokens | null> => {
        try {
          const { tokens } = get();
          const storedRefreshToken = tokenStorage.get('refresh_token') || tokens?.refresh_token;

          if (!storedRefreshToken) {
            throw new Error('No refresh token available');
          }

          console.log('Refreshing access token...');

          const response = await apiClient.post('/auth/refresh', {
            refresh_token: storedRefreshToken,
          });

          const newTokens: AuthTokens = response.data;
          console.log('Token refresh successful');

          // Update stored tokens
          tokenStorage.set('refresh_token', newTokens.refresh_token);

          set({ tokens: newTokens, error: null });

          return newTokens;
        } catch (error) {
          console.error('Token refresh failed:', error);
          // If refresh fails, logout the user
          await get().logout();
          return null;
        }
      },

      // Get current user info
      getCurrentUser: async (): Promise<void> => {
        try {
          console.log('Fetching current user...');
          
          const response = await apiClient.get('/auth/me');
          const user: User = response.data;
          
          console.log('User data fetched:', user.email, user.role);
          
          set({ user, isLoading: false, error: null });
        } catch (error: any) {
          console.error('Failed to get current user:', error);
          set({ 
            isLoading: false,
            error: error.response?.data?.detail || 'Failed to fetch user data'
          });
        }
      },

      // Update user data locally
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      // Clear error state
      clearError: () => {
        set({ error: null });
      },

      // Helper: Check if user has specific role
      hasRole: (role: string): boolean => {
        const { user } = get();
        return user?.role === role;
      },

      // Helper: Check if user is admin (any admin role)
      isAdmin: (): boolean => {
        const { user } = get();
        return user?.role === 'admin_hotel' || user?.role === 'super_admin';
      },

      // Helper: Check if user is super admin
      isSuperAdmin: (): boolean => {
        const { user } = get();
        return user?.role === 'super_admin';
      },

      // Helper: Check if user can access resource
      canAccess: (resource: string): boolean => {
        const { user, isAuthenticated } = get();
        
        if (!isAuthenticated || !user) return false;

        switch (resource) {
          case 'admin':
            return user.role === 'admin_hotel' || user.role === 'super_admin';
          case 'super_admin':
            return user.role === 'super_admin';
          case 'user':
            return true; // Any authenticated user
          default:
            return false;
        }
      },
    }),
    {
      name: 'auth-storage', // LocalStorage key
      // Only persist essential data (not loading states)
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Setup API interceptors after store is created (to avoid circular dependency)
let isRefreshing = false;
let refreshPromise: Promise<AuthTokens | null> | null = null;

// Request interceptor - adds auth header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = useAuthStore.getState().tokens;
    if (tokens?.access_token) {
      config.headers.Authorization = `Bearer ${tokens.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Prevent multiple refresh attempts
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = useAuthStore.getState().refreshToken();
      }

      try {
        const newTokens = await refreshPromise;
        
        if (newTokens) {
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, user will be logged out by the refreshToken method
        console.error('Token refresh failed, redirecting to login');
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  }
);
