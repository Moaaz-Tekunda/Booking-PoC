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

  static async getAvailableRooms(hotelId: string, startDate: string, endDate: string): Promise<Room[]> {
    try {
      const response = await apiClient.get(`/reservations/available-rooms/${hotelId}`, {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available rooms:', error);
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

  static async getUserReservations(userId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/reservations/my-reservations`);
      const reservations = response.data;
      
      // Enhance reservations with hotel and room details
      const enhancedReservations = await Promise.all(
        reservations.map(async (reservation: any) => {
          try {
            // Fetch hotel details
            const hotelResponse = await apiClient.get(`/hotels/${reservation.hotel_id}`);
            const hotel = hotelResponse.data;
            
            // Fetch room details
            const roomResponse = await apiClient.get(`/rooms/${reservation.room_id}`);
            const room = roomResponse.data;
            
            return {
              ...reservation,
              hotel: {
                name: hotel.name,
                location: `${hotel.city}, ${hotel.country}`,
                address: hotel.address,
                contact_phone: hotel.contact_phone,
                contact_email: hotel.contact_email,
                has_wifi: hotel.has_wifi,
                has_parking: hotel.has_parking,
                has_gym: hotel.has_gym,
                has_spa: hotel.has_spa
              },
              room: {
                room_number: room.room_number,
                type: room.type,
                price_per_night: room.price_per_night,
                max_occupancy: room.max_occupancy,
                description: room.description
              }
            };
          } catch (error) {
            console.error(`Error fetching details for reservation ${reservation.id}:`, error);
            // Return reservation with fallback data if fetch fails
            return {
              ...reservation,
              hotel: {
                name: 'Hotel Information Unavailable',
                location: 'Location Unknown'
              },
              room: {
                type: 'Room Information Unavailable',
                price_per_night: 0
              }
            };
          }
        })
      );
      
      return enhancedReservations;
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
