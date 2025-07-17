import { useState } from 'react';
import { hotelService } from '@/services/hotel-service';
import { toast } from 'sonner';

export const useDeleteHotel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteHotel = async (hotelId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await hotelService.deleteHotel(hotelId);
      
      toast.success('Hotel deleted successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete hotel';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    deleteHotel, 
    isLoading, 
    error 
  };
};
