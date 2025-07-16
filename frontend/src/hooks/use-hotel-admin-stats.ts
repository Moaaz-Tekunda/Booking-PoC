import { useState, useEffect } from 'react';
import { hotelAdminService } from '@/services/dashboard-service';
import { HotelAdminStats } from '@/types/dashboard';

export const useHotelAdminStats = () => {
  const [stats, setStats] = useState<HotelAdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await hotelAdminService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []); // No dependency on user needed

  return { stats, isLoading, error, refetch: fetchStats };
};