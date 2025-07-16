import apiClient from '@/lib/api';
import { DashboardStats, HotelAdminStats } from '@/types/dashboard';

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },
};


export const hotelAdminService = {
  getStats: async (): Promise<HotelAdminStats> => {
    const response = await apiClient.get<HotelAdminStats>(`/dashboard/hotel-admin`);
    return response.data;
  },
};