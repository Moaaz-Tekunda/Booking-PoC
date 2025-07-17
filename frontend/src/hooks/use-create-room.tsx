import { useState } from 'react';
import { roomService } from '@/services/room-service';
import { RoomCreate, Room } from '@/types/room';
import { toast } from 'sonner';

export const useCreateRoom = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = async (roomData: RoomCreate): Promise<Room | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newRoom = await roomService.createRoom(roomData);
      
      toast.success('Room created successfully');
      return newRoom;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create room';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    createRoom, 
    isLoading, 
    error 
  };
};
