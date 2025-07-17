import apiClient from '@/lib/api';
import { Room, RoomCreate, RoomUpdate, RoomResponse } from '@/types/room';

export const roomService = {
  // Get all rooms (public access)
  async getRooms(params?: { skip?: number; limit?: number; available_only?: boolean }): Promise<Room[]> {
    const response = await apiClient.get('/rooms/', { params });
    return response.data;
  },

  // Get a specific room by ID
  async getRoom(roomId: string): Promise<Room> {
    const response = await apiClient.get(`/rooms/${roomId}`);
    return response.data;
  },

  // Get rooms by hotel ID
  async getRoomsByHotel(hotelId: string, availableOnly: boolean = false): Promise<Room[]> {
    const response = await apiClient.get(`/rooms/hotel/${hotelId}`, { 
      params: { available_only: availableOnly } 
    });
    return response.data;
  },

  // Create a new room (admin access required)
  async createRoom(roomData: RoomCreate): Promise<Room> {
    const response = await apiClient.post('/rooms/', roomData);
    return response.data;
  },

  // Update a room (admin access required)
  async updateRoom(roomId: string, roomData: RoomUpdate): Promise<Room> {
    const response = await apiClient.put(`/rooms/${roomId}`, roomData);
    return response.data;
  },

  // Delete a room (admin access required)
  async deleteRoom(roomId: string): Promise<void> {
    await apiClient.delete(`/rooms/${roomId}`);
  },

  // Toggle room availability
  async toggleRoomAvailability(roomId: string, isAvailable: boolean): Promise<Room> {
    const response = await apiClient.put(`/rooms/${roomId}`, { is_available: isAvailable });
    return response.data;
  }
};
