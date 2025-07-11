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
  }
};
