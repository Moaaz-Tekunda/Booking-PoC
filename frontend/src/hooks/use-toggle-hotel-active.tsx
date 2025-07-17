import { useState } from 'react';
import { hotelService } from '@/services/hotel-service';
import { Hotel } from '@/types/hotel';
import { toast } from 'sonner';

export const useToggleHotelActive = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleHotelActive = async (hotelId: string, isActive: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedHotel = await hotelService.toggleHotelActive(hotelId, isActive);
      
      toast.success(`Hotel ${isActive ? 'activated' : 'deactivated'} successfully`);
      return updatedHotel;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update hotel status';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    toggleHotelActive, 
    isLoading, 
    error 
  };
};
