import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard-service';
import { DashboardStats } from '@/types/dashboard';

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats(): UseQueryResult<DashboardStats, Error> {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
    staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    retry: 2,
  });
}
