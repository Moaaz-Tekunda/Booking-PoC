import { useState } from 'react';
import { roomService } from '@/services/room-service';
import { toast } from 'sonner';

export const useDeleteRoom = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRoom = async (roomId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await roomService.deleteRoom(roomId);
      
      toast.success('Room deleted successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete room';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    deleteRoom, 
    isLoading, 
    error 
  };
};
