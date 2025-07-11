import apiClient from '@/lib/api';
import { DashboardStats } from '@/types/dashboard';

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },
};
