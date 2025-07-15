'use client';

import { Reservation as BaseReservation } from '@/types/booking';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Users, 
  CreditCard, 
  Clock,
  Phone,
  Star,
  ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { BookingService } from '@/services/booking-service';

interface ReservationWithDetails extends BaseReservation {
  hotel?: {
    name: string;
    location: string;
    image_url: string;
    rating: number;
    contact_info: {
      phone: string;
      email: string;
    };
  };
  room?: {
    type: string;
    price_per_night: number;
    amenities: string[];
  };
  guests?: number;
  payment_status?: 'pending' | 'paid' | 'refunded';
}

export default function MyReservations() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchReservations();
  }, [user]);

  const fetchReservations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const reservations = await BookingService.getUserReservations(user.id);
      setReservations(reservations);
    } catch (err) {
      setError('An error occurred while fetching reservations');
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const success = await BookingService.cancelReservation(reservationId);
      if (success) {
        setReservations(prev => 
          prev.map(res => {
            const resId = res._id || res.id;
            return resId === reservationId 
              ? { ...res, status: 'cancelled' }
              : res;
          })
        );
      } else {
        setError('Failed to cancel reservation');
      }
    } catch (err) {
      setError('An error occurred while canceling reservation');
      console.error('Error canceling reservation:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'refunded':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Reservations</h1>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Reservations</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button 
                onClick={fetchReservations} 
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Reservations</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Calendar className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">No reservations yet</h3>
              <p>Your hotel reservations will appear here once you make a booking.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Reservations</h1>
      
      <div className="grid gap-6">
        {reservations.map((reservation) => {
          const checkInDate = reservation.check_in_date || reservation.start_date;
          const checkOutDate = reservation.check_out_date || reservation.end_date;
          const reservationId = reservation._id || reservation.id;
          const nights = checkInDate && checkOutDate ? calculateNights(checkInDate, checkOutDate) : 1;
          
          return (
            <Card key={reservationId} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">
                      {reservation.hotel?.name || 'Hotel Name'}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {reservation.hotel?.location || 'Location not available'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                      {reservation.hotel?.rating || 'N/A'}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge variant={getStatusColor(reservation.status || 'pending')}>
                      {reservation.status ? 
                        reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1) : 
                        'Pending'
                      }
                    </Badge>
                    {reservation.payment_status && (
                      <Badge variant={getPaymentStatusColor(reservation.payment_status)}>
                        {reservation.payment_status.charAt(0).toUpperCase() + reservation.payment_status.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Check-in</p>
                        <p className="text-sm text-gray-600">
                          {checkInDate ? formatDate(checkInDate) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Check-out</p>
                        <p className="text-sm text-gray-600">
                          {checkOutDate ? formatDate(checkOutDate) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-sm text-gray-600">{nights} {nights === 1 ? 'night' : 'nights'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Guests</p>
                        <p className="text-sm text-gray-600">{reservation.guests || 1} {(reservation.guests || 1) === 1 ? 'guest' : 'guests'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Total Price</p>
                        <p className="text-sm text-gray-600">${reservation.total_price || 0}</p>
                      </div>
                    </div>
                    
                    {reservation.hotel?.contact_info?.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Hotel Contact</p>
                          <p className="text-sm text-gray-600">{reservation.hotel.contact_info.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {reservation.room && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm mb-2">Room Details</h4>
                    <p className="text-sm text-gray-600">
                      {reservation.room.type} - ${reservation.room.price_per_night} per night
                    </p>
                    {reservation.room.amenities && reservation.room.amenities.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Amenities: {reservation.room.amenities.join(', ')}
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2 pt-4 border-t">
                  {(reservation.status === 'confirmed' || reservation.status === 'pending') && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelReservation(reservationId)}
                    >
                      Cancel Reservation
                    </Button>
                  )}
                  
                  {reservation.hotel?.contact_info?.phone && (
                    <Button variant="outline" size="sm">
                      Contact Hotel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
