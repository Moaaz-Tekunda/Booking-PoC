import { useAuthStore } from '@/stores/auth-store';

/**
 * Custom hook to access authentication state and actions
 * 
 * This hook provides a clean interface to the auth store and
 * makes it easy to use authentication throughout the app
 */
export function useAuth() {
  const store = useAuthStore();
  
  return {
    // State
    user: store.user,
    tokens: store.tokens,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    
    // Actions
    login: store.login,
    register: store.register,
    logout: store.logout,
    refreshToken: store.refreshToken,
    getCurrentUser: store.getCurrentUser,
    updateUser: store.updateUser,
    clearError: store.clearError,
    
    // Helpers
    hasRole: store.hasRole,
    isAdmin: store.isAdmin,
    isSuperAdmin: store.isSuperAdmin,
    canAccess: store.canAccess,
  };
}
