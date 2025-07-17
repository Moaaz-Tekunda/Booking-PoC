import apiClient from '@/lib/api';
import { Hotel, HotelCreate, HotelUpdate, HotelResponse } from '@/types/hotel';

export const hotelService = {
  // Get all hotels (public access)
  async getHotels(params?: { skip?: number; limit?: number; active_only?: boolean }): Promise<Hotel[]> {
    const response = await apiClient.get('/hotels/', { params });
    return response.data;
  },

  // Get a specific hotel by ID
  async getHotel(hotelId: string): Promise<Hotel> {
    const response = await apiClient.get(`/hotels/${hotelId}`);
    return response.data;
  },

  // Create a new hotel (admin access required)
  async createHotel(hotelData: HotelCreate): Promise<Hotel> {
    const response = await apiClient.post('/hotels/', hotelData);
    return response.data;
  },

  // Update a hotel (admin access required)
  async updateHotel(hotelId: string, hotelData: HotelUpdate): Promise<Hotel> {
    const response = await apiClient.put(`/hotels/${hotelId}`, hotelData);
    return response.data;
  },

  // Delete a hotel (admin access required)
  async deleteHotel(hotelId: string): Promise<void> {
    await apiClient.delete(`/hotels/${hotelId}`);
  },

  // Search hotels by city or country
  async searchHotels(params?: { city?: string; country?: string }): Promise<Hotel[]> {
    const response = await apiClient.get('/hotels/search/', { params });
    return response.data;
  },

  // Toggle hotel active status
  async toggleHotelActive(hotelId: string, isActive: boolean): Promise<Hotel> {
    const response = await apiClient.put(`/hotels/${hotelId}`, { is_active: isActive });
    return response.data;
  },

  async getMyHotels()  {
    const response = await apiClient.get('/hotels/myHotels');
    return response.data;
  },

  // Get cheapest room price for a hotel
  async getCheapestRoomPrice(hotelId: string): Promise<number | null> {
    try {
      const response = await apiClient.get(`/rooms/hotel/${hotelId}`);
      const rooms = response.data;
      
      if (!Array.isArray(rooms) || rooms.length === 0) {
        return null;
      }
      
      // Find the minimum price from available rooms
      const prices = rooms
        .filter((room: any) => {
          return room && 
                 typeof room.price_per_night === 'number' && 
                 room.price_per_night > 0;
        })
        .map((room: any) => room.price_per_night);
      
      return prices.length > 0 ? Math.min(...prices) : null;
    } catch (error) {
      console.error(`Error fetching cheapest room price for hotel ${hotelId}:`, error);
      return null;
    }
  }
};



