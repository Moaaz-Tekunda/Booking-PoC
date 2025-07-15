'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  Wifi, 
  Car, 
  Dumbbell, 
  Waves,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Hotel } from '@/types/hotel';
import { ReservationType, BookingFormData, ReservationCreate, ReservationStatus } from '@/types/booking';
import { useAuth } from '@/hooks/use-auth';
import { BookingService, Room } from '@/services/booking-service';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: Hotel | null;
  initialBookingData?: Partial<BookingFormData>;
}

export default function BookingModal({ isOpen, onClose, hotel, initialBookingData }: BookingModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'details' | 'rooms' | 'payment' | 'confirmation'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<BookingFormData>({
    hotelId: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    reservationType: ReservationType.ROOM_ONLY,
    specialRequests: ''
  });

  // Load rooms when hotel is selected and dates are available
  useEffect(() => {
    const loadRooms = async () => {
      if (hotel && formData.checkIn && formData.checkOut && step === 'rooms') {
        setLoadingRooms(true);
        try {
          const hotelRooms = await BookingService.getRoomsByHotel(hotel.id);
          console.log('Loaded rooms:', hotelRooms); // Debug log
          setRooms(hotelRooms);
        } catch (error) {
          console.error('Error loading rooms:', error);
          setRooms([]);
        } finally {
          setLoadingRooms(false);
        }
      }
    };

    loadRooms();
  }, [hotel, formData.checkIn, formData.checkOut, step]);

  useEffect(() => {
    if (hotel && isOpen) {
      setFormData(prev => ({
        ...prev,
        hotelId: hotel.id,
        ...initialBookingData
      }));
    }
  }, [hotel, isOpen, initialBookingData]);

  useEffect(() => {
    if (!isOpen) {
      setStep('details');
      setIsSubmitting(false);
      setSelectedRoom(null);
      setRooms([]);
      setBookingError(null);
      setReservationId(null);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = () => {
    const nights = calculateNights();
    const basePrice = selectedRoom?.price_per_night || 120; // Use correct field name
    let multiplier = 1;
    
    switch (formData.reservationType) {
      case ReservationType.BED_BREAKFAST:
        multiplier = 1.2;
        break;
      case ReservationType.ALL_INCLUSIVE:
        multiplier = 1.8;
        break;
      default:
        multiplier = 1;
    }
    
    return Math.round(nights * basePrice * multiplier * formData.guests);
  };

  const handleNext = () => {
    setBookingError(null);
    if (step === 'details') {
      // Validate required fields
      if (!formData.checkIn || !formData.checkOut || !formData.guests) {
        setBookingError('Please fill in all required fields');
        return;
      }
      setStep('rooms');
    } else if (step === 'rooms') {
      if (!selectedRoom) {
        setBookingError('Please select a room');
        return;
      }
      setStep('payment');
    } else if (step === 'payment') {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedRoom || !hotel) {
      setBookingError('Missing required information');
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);
    
    try {
      // Step 1: Process payment (placeholder - always succeeds)
      const paymentResult = await BookingService.processPayment({
        amount: calculateTotalPrice(),
        cardNumber: '4532015112830366', // Placeholder
        expiryDate: '12/25',
        cvv: '123',
        name: user.name || 'Guest'
      });

      if (!paymentResult.success) {
        throw new Error('Payment processing failed');
      }

      // Step 2: Create reservation
      const reservationData: ReservationCreate = {
        hotel_id: hotel.id,
        room_id: selectedRoom.id,
        visitor_id: user.id,
        start_date: formData.checkIn, // Already in YYYY-MM-DD format
        end_date: formData.checkOut,   // Already in YYYY-MM-DD format
        type: formData.reservationType,
        status: ReservationStatus.CONFIRMED,
        total_price: calculateTotalPrice()
      };

      const reservation = await BookingService.createReservation(reservationData);
      
      if (!reservation) {
        throw new Error('Failed to create reservation. The room may no longer be available.');
      }

      setReservationId(reservation.id);
      setStep('confirmation');
    } catch (error) {
      console.error('Booking failed:', error);
      setBookingError(error instanceof Error ? error.message : 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !hotel) return null;

  const nights = calculateNights();
  const totalPrice = calculateTotalPrice();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide bg-card backdrop-blur-xl border border-border rounded-2xl shadow-2xl animate-modal-in">
        
        {/* Header */}
        <div className="sticky top-0 bg-card backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {step === 'details' && 'Booking Details'}
              {step === 'rooms' && 'Select Room'}
              {step === 'payment' && 'Payment Information'}
              {step === 'confirmation' && 'Booking Confirmed!'}
            </h2>
            <p className="text-sm text-muted-foreground">{hotel.name} - {hotel.city}, {hotel.country}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6">
          {step === 'details' && (
            <div className="space-y-6">
              {/* Hotel Summary */}
              <div className="bg-background/50 rounded-xl p-4 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-primary/20 rounded-xl flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{hotel.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{hotel.address}</p>
                    <div className="flex items-center gap-3">
                      {hotel.has_wifi && <Wifi className="h-4 w-4 text-blue-500" />}
                      {hotel.has_parking && <Car className="h-4 w-4 text-green-500" />}
                      {hotel.has_gym && <Dumbbell className="h-4 w-4 text-orange-500" />}
                      {hotel.has_spa && <Waves className="h-4 w-4 text-purple-500" />}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      <span>{hotel.working_hours_start} - {hotel.working_hours_end}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Check-in */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Check-in Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="date"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                    />
                  </div>
                </div>

                {/* Check-out */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Check-out Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="date"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleInputChange}
                      required
                      min={formData.checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Number of Guests *</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                    >
                      {Array.from({ length: Math.min(hotel.max_reservations_capacity, 8) }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Reservation Type */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Reservation Type *</label>
                  <select
                    name="reservationType"
                    value={formData.reservationType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  >
                    <option value={ReservationType.ROOM_ONLY}>Room Only</option>
                    <option value={ReservationType.BED_BREAKFAST}>Bed & Breakfast (+20%)</option>
                    <option value={ReservationType.ALL_INCLUSIVE}>All Inclusive (+80%)</option>
                  </select>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Special Requests</label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any special requirements or requests..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground resize-none"
                />
              </div>

              {/* Price Summary */}
              {nights > 0 && (
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <h4 className="font-medium text-foreground mb-3">Price Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{nights} night{nights > 1 ? 's' : ''} × {formData.guests} guest{formData.guests > 1 ? 's' : ''}</span>
                      <span className="text-foreground">${(nights * (selectedRoom?.price_per_night || 120) * formData.guests).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reservation type</span>
                      <span className="text-foreground">{formData.reservationType.replace('_', ' ')}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between font-medium">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary text-lg">${totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'rooms' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Available Rooms</h3>
                {loadingRooms ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-muted-foreground">Loading available rooms...</span>
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No rooms available for the selected dates.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {rooms.map((room) => {
                      const roomPrice = room.price_per_night || 0;
                      const isValidRoom = roomPrice > 0 && room.max_occupancy > 0;
                      
                      return (
                        <div
                          key={room.id}
                          className={`border rounded-xl p-4 cursor-pointer transition-all ${
                            selectedRoom?.id === room.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          } ${!isValidRoom ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => isValidRoom && setSelectedRoom(room)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground mb-1">
                                Room {room.room_number} - {room.type}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                Max {room.max_occupancy} guest{room.max_occupancy > 1 ? 's' : ''}
                              </p>
                              {room.description && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  {room.description}
                                </p>
                              )}
                              {!isValidRoom && (
                                <p className="text-xs text-red-500">
                                  Room information incomplete
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">
                                ${roomPrice > 0 ? roomPrice : '---'}/night
                              </div>
                              {roomPrice > 0 && (
                                <div className="text-sm text-muted-foreground">
                                  Total: ${(roomPrice * calculateNights()).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                          {formData.guests > room.max_occupancy && (
                            <div className="mt-2 text-sm text-red-500">
                              This room can accommodate maximum {room.max_occupancy} guest{room.max_occupancy > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Updated Price Summary */}
              {selectedRoom && nights > 0 && (
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <h4 className="font-medium text-foreground mb-3">Price Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room {selectedRoom.room_number} × {nights} night{nights > 1 ? 's' : ''}</span>
                      <span className="text-foreground">${(nights * selectedRoom.price_per_night).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Guests: {formData.guests}</span>
                      <span className="text-foreground">×{formData.guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reservation type</span>
                      <span className="text-foreground">{formData.reservationType.replace('_', ' ')}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between font-medium">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary text-lg">${calculateTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              {/* Guest Information */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Guest Information</h3>
                <div className="bg-background/50 rounded-xl p-4 border border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue={user?.name || ''}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={user?.email || ''}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                      <input
                        type="tel"
                        defaultValue={user?.mobile_number || ''}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Payment Information</h3>
                <div className="bg-background/50 rounded-xl p-4 border border-border">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Card Number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-3 bg-green-500/10 text-green-500 p-4 rounded-xl border border-green-500/20">
                <Shield className="h-5 w-5 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Secure Payment</p>
                  <p className="text-green-500/80">Your payment information is encrypted and secure. We never store your card details.</p>
                </div>
              </div>

              {/* Final Price */}
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-foreground">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">${totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h3>
                <p className="text-muted-foreground">Your reservation has been successfully created.</p>
              </div>

              <div className="bg-background/50 rounded-xl p-6 border border-border text-left">
                <h4 className="font-medium text-foreground mb-4">Booking Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hotel:</span>
                    <span className="text-foreground">{hotel.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in:</span>
                    <span className="text-foreground">{new Date(formData.checkIn).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out:</span>
                    <span className="text-foreground">{new Date(formData.checkOut).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests:</span>
                    <span className="text-foreground">{formData.guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room:</span>
                    <span className="text-foreground">Room {selectedRoom?.room_number} - {selectedRoom?.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking ID:</span>
                    <span className="text-foreground font-mono">{reservationId || `BKG-${Date.now().toString().slice(-6)}`}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-medium">
                    <span className="text-foreground">Total Paid:</span>
                    <span className="text-primary">${totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 text-blue-500 p-4 rounded-xl border border-blue-500/20 text-left">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Important Information</p>
                    <p className="text-blue-500/80">A confirmation email has been sent to your email address. Please present your booking ID at check-in.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {bookingError && (
            <div className="bg-red-500/10 text-red-500 p-4 rounded-xl border border-red-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Booking Error</p>
                  <p className="text-red-500/80">{bookingError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-border">
            {step === 'details' && (
              <>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleNext} 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={!formData.checkIn || !formData.checkOut || nights <= 0}
                >
                  Select Room
                </Button>
              </>
            )}

            {step === 'rooms' && (
              <>
                <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={!selectedRoom || (selectedRoom && formData.guests > selectedRoom.max_occupancy)}
                >
                  Continue to Payment
                </Button>
              </>
            )}
            
            {step === 'payment' && (
              <>
                <Button variant="outline" onClick={() => setStep('rooms')} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </div>
                  ) : (
                    `Pay $${totalPrice.toLocaleString()}`
                  )}
                </Button>
              </>
            )}

            {step === 'confirmation' && (
              <Button onClick={onClose} className="w-full bg-primary hover:bg-primary/90">
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
