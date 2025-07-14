export enum RoomType {
  SINGLE = "single",
  DOUBLE = "double", 
  SUITE = "suite",
  FAMILY = "family"
}

export interface RoomBase {
  room_number: string;
  hotel_id: string;
  price_per_night: number;
  description?: string;
  type: RoomType;
  max_occupancy: number;
  is_available: boolean;
}

export interface RoomCreate extends RoomBase {}

export interface RoomUpdate {
  room_number?: string;
  price_per_night?: number;
  description?: string;
  type?: RoomType;
  max_occupancy?: number;
  is_available?: boolean;
}

export interface Room extends RoomBase {
  id: string;
  created_at: string;
}

export interface RoomResponse extends Room {}

export interface RoomSearchParams {
  hotel_id?: string;
  type?: RoomType;
  min_price?: number;
  max_price?: number;
  max_occupancy?: number;
  available_only?: boolean;
}
