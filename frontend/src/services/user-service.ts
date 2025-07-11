import apiClient from '@/lib/api';
import { User, UserCreate, UserUpdate, UserResponse } from '@/types/user';

export const userService = {
  // Get all users (admin access required)
  async getUsers(params?: { skip?: number; limit?: number }): Promise<User[]> {
    const response = await apiClient.get('/users/', { params });
    return response.data;
  },

  // Get a specific user by ID
  async getUser(userId: string): Promise<User> {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  // Create a new user (public access for registration)
  async createUser(userData: UserCreate): Promise<User> {
    const response = await apiClient.post('/users/', userData);
    return response.data;
  },

  // Update a user
  async updateUser(userId: string, userData: UserUpdate): Promise<User> {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Delete a user (super admin only)
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}`);
  },

  // Get users by hotel (admin access required)
  async getUsersByHotel(hotelId: string, params?: { skip?: number; limit?: number }): Promise<User[]> {
    const response = await apiClient.get(`/users/hotel/${hotelId}`, { params });
    return response.data;
  },

  // Toggle user active status
  async toggleUserActive(userId: string, isActive: boolean): Promise<User> {
    const response = await apiClient.put(`/users/${userId}`, { is_active: isActive });
    return response.data;
  }
};
