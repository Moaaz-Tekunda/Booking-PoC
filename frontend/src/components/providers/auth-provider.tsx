'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider - Initializes authentication state on app start
 * 
 * This component:
 * 1. Checks for existing tokens on app startup
 * 2. Attempts to fetch current user if tokens exist
 * 3. Sets loading to false when initialization is complete
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { getCurrentUser, tokens, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on app startup
    const initializeAuth = async () => {
      console.log('Initializing authentication...');

      if (tokens?.access_token && isAuthenticated) {
        console.log('Found existing tokens, fetching user data...');
        // We have tokens, try to get current user
        await getCurrentUser();
      } else {
        console.log('No tokens found, user not authenticated');
        // No tokens, mark as not loading
        useAuthStore.setState({ isLoading: false });
      }
    };

    initializeAuth();
  }, []); // Run only once on mount

  return <>{children}</>;
}
