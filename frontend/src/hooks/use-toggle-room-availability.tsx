import { useState } from 'react';
import { roomService } from '@/services/room-service';
import { Room } from '@/types/room';
import { toast } from 'sonner';

export const useToggleRoomAvailability = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleRoomAvailability = async (roomId: string, isAvailable: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedRoom = await roomService.toggleRoomAvailability(roomId, isAvailable);
      
      toast.success(`Room ${isAvailable ? 'made available' : 'made unavailable'} successfully`);
      return updatedRoom;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update room availability';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    toggleRoomAvailability, 
    isLoading, 
    error 
  };
};
