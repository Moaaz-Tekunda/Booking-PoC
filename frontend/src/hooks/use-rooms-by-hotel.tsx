import { useState, useEffect } from 'react';
import { roomService } from '@/services/room-service';
import { Room } from '@/types/room';

export const useRoomsByHotel = (hotelId: string) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    if (!hotelId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await roomService.getRoomsByHotel(hotelId, false); // Get all rooms, not just available
      setRooms(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  return { 
    data: rooms, 
    isLoading, 
    error, 
    refetch: fetchRooms 
  };
};
