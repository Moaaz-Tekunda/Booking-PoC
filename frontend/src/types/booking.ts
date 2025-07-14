export enum ReservationType {
  BED_BREAKFAST = "bed_breakfast",
  ALL_INCLUSIVE = "all_inclusive",
  ROOM_ONLY = "room_only"
}

export enum ReservationStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CHECKED_IN = "checked_in",
  CHECKED_OUT = "checked_out",
  CANCELLED = "cancelled"
}

export interface ReservationBase {
  hotel_id: string;
  room_id: string;
  visitor_id: string;
  start_date: string; // Date in ISO format
  end_date: string;   // Date in ISO format
  type: ReservationType;
  status: ReservationStatus;
  total_price: number;
}

export interface ReservationCreate extends ReservationBase {}

export interface ReservationUpdate {
  start_date?: string;
  end_date?: string;
  type?: ReservationType;
  status?: ReservationStatus;
  total_price?: number;
}

export interface Reservation extends ReservationBase {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ReservationResponse extends Reservation {}

// For booking flow
export interface BookingDetails {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType?: string;
}

export interface BookingFormData extends BookingDetails {
  reservationType: ReservationType;
  specialRequests?: string;
}
