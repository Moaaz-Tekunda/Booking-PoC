export interface HotelBase {
  name: string;
  tax_number: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  country: string;
  working_hours_start: string;
  working_hours_end: string;
  gallery: string[];
  has_gym: boolean;
  has_spa: boolean;
  has_wifi: boolean;
  has_parking: boolean;
  swimming_pools_count: number;
  max_reservations_capacity: number;
  is_active: boolean;
}

export interface HotelCreate extends HotelBase {}

export interface HotelUpdate {
  name?: string;
  tax_number?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  country?: string;
  working_hours_start?: string;
  working_hours_end?: string;
  gallery?: string[];
  has_gym?: boolean;
  has_spa?: boolean;
  has_wifi?: boolean;
  has_parking?: boolean;
  swimming_pools_count?: number;
  max_reservations_capacity?: number;
  is_active?: boolean;
}

export interface Hotel extends HotelBase {
  id: string;
  created_at: string;
}

export interface HotelResponse extends Hotel {}

export interface HotelsListResponse {
  hotels: Hotel[];
  total: number;
  skip: number;
  limit: number;
}
