import { useState, useEffect } from 'react';
import { hotelService } from '@/services/hotel-service';
import { Hotel } from '@/types/hotel';

export const useMyHotels = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoadingHotels, setIsLoadingHotels] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHotels = async () => {
    try {
      setIsLoadingHotels(true);
      setError(null);
      const data = await hotelService.getMyHotels();
      setHotels(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load hotels');
    } finally {
      setIsLoadingHotels(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  return { 
    data: hotels, 
    isLoading: isLoadingHotels, 
    error, 
    refetch: fetchHotels 
  };
};