import { apiClient } from '@/lib/api';
import { ReservationCreate, ReservationResponse, Reservation } from '@/types/booking';

export interface Room {
  id: string;
  room_number: string;
  hotel_id: string;
  price_per_night: number;
  description?: string;
  type: string;
  max_occupancy: number;
  is_available: boolean;
  created_at: string;
}

export class BookingService {
  static async getRoomsByHotel(hotelId: string): Promise<Room[]> {
    try {
      const response = await apiClient.get(`/rooms/hotel/${hotelId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }
  }

  static async createReservation(reservationData: ReservationCreate): Promise<ReservationResponse | null> {
    try {
      const response = await apiClient.post('/reservations/', reservationData);
      return response.data;
    } catch (error) {
      console.error('Error creating reservation:', error);
      return null;
    }
  }

  static async getUserReservations(userId: string): Promise<Reservation[]> {
    try {
      const response = await apiClient.get(`/reservations/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user reservations:', error);
      return [];
    }
  }

  static async cancelReservation(reservationId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/reservations/${reservationId}`);
      return true;
    } catch (error) {
      console.error('Error canceling reservation:', error);
      return false;
    }
  }

  static async getReservation(reservationId: string): Promise<Reservation | null> {
    try {
      const response = await apiClient.get(`/reservations/${reservationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reservation:', error);
      return null;
    }
  }

  // Placeholder payment processing - always accepts
  static async processPayment(paymentData: {
    amount: number;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    name: string;
  }): Promise<{ success: boolean; transactionId?: string }> {
    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      }, 1500); // Simulate API delay
    });
  }
}
