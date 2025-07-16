export interface DashboardStats {
  total_users: number;
  total_hotels: number;
  total_bookings: number;
  total_revenue: number;
  active_hotels: number;
  pending_bookings: number;
  recent_activity: RecentActivity[];
}

export interface RecentActivity {
  type: 'user_registration' | 'hotel_added' | 'booking_created';
  title: string;
  description: string;
  time: string;
  icon: 'users' | 'building' | 'calendar';
}

export interface DashboardFilters {
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  hotelId?: string;
}

export interface HotelAdminStats {
  my_hotels: number;
  total_reservations: number;
  recent_activity: RecentActivity[];
}