"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Calendar, MapPin, User, DollarSign } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ReservationResponse, ReservationStatus } from '@/types/booking';

interface EnhancedReservation extends ReservationResponse {
  hotel?: {
    name: string;
    city: string;
    country: string;
  };
  user?: {
    name: string;
    email: string;
  };
  room?: {
    room_number: string;
    type: string;
  };
}

export default function HotelReservations() {
  const [reservations, setReservations] = useState<EnhancedReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/reservations/');
      const reservationData = response.data;

      // Enhance reservations with hotel, user, and room details
      const enhanced = await Promise.all(
        reservationData.map(async (reservation: ReservationResponse) => {
          try {
            const [hotelRes, userRes, roomRes] = await Promise.all([
              apiClient.get(`/hotels/${reservation.hotel_id}`).catch(() => null),
              apiClient.get(`/users/${reservation.visitor_id}`).catch(() => null),
              apiClient.get(`/rooms/${reservation.room_id}`).catch(() => null)
            ]);

            return {
              ...reservation,
              hotel: hotelRes?.data ? {
                name: hotelRes.data.name,
                city: hotelRes.data.city,
                country: hotelRes.data.country
              } : undefined,
              user: userRes?.data ? {
                name: userRes.data.name,
                email: userRes.data.email
              } : undefined,
              room: roomRes?.data ? {
                room_number: roomRes.data.room_number,
                type: roomRes.data.type
              } : undefined
            };
          } catch (error) {
            console.error('Error enhancing reservation:', error);
            return reservation;
          }
        })
      );

      setReservations(enhanced);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.CONFIRMED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case ReservationStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case ReservationStatus.CHECKED_IN:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case ReservationStatus.CHECKED_OUT:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case ReservationStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      (reservation.hotel?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reservation.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reservation.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reservation.room?.room_number?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground mt-1">
            Manage all reservations for your hotels ({filteredReservations.length} total)
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by hotel, guest name, email, or room..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as ReservationStatus | 'all')}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value={ReservationStatus.CONFIRMED}>Confirmed</option>
              <option value={ReservationStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No reservations found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search filters.' 
                : 'No reservations have been made yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReservations.map((reservation) => (
            <Card key={reservation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Guest Info */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-medium text-sm">
                          {reservation.user?.name || 'Unknown Guest'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {reservation.user?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hotel & Room Info */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-medium text-sm">
                          {reservation.hotel?.name || 'Unknown Hotel'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Room {reservation.room?.room_number || 'N/A'} ({reservation.room?.type || 'Standard'})
                        </p>
                        {reservation.hotel && (
                          <p className="text-xs text-muted-foreground">
                            {reservation.hotel.city}, {reservation.hotel.country}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-medium text-sm">
                          {formatDate(reservation.start_date)} - {formatDate(reservation.end_date)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.ceil((new Date(reservation.end_date).getTime() - new Date(reservation.start_date).getTime()) / (1000 * 3600 * 24))} nights
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price & Status */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div>
                        <p className="font-medium text-sm">${reservation.total_price}</p>
                        <Badge className={getStatusColor(reservation.status)}>
                          {reservation.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Created Date */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Booked on {formatDate(reservation.created_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
