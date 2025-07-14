'use client';

import { useState } from 'react';
import { useHotels } from '@/hooks/use-hotels';
import { useSearchFilters } from '@/hooks/use-search-filters';
import { Hotel } from '@/types/hotel';
import BookingModal from './booking-modal';
import { DashboardHeader } from './dashboard-header';
import { SearchFilters } from './search-filters';
import { HotelGrid } from './hotel-grid';

export default function ViewerDashboard() {
  const { data: hotels = [], isLoading } = useHotels({ active_only: true });
  const {
    searchTerm,
    setSearchTerm,
    selectedCity,
    setSelectedCity,
    selectedCountry,
    setSelectedCountry,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    showFilters,
    setShowFilters,
    filteredHotels,
    cities,
    countries,
  } = useSearchFilters(hotels);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const toggleFavorite = (hotelId: string) => {
    setFavorites(prev => 
      prev.includes(hotelId) 
        ? prev.filter(id => id !== hotelId)
        : [...prev, hotelId]
    );
  };

  const handleBookNow = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedHotel(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        checkIn={checkIn}
        setCheckIn={setCheckIn}
        checkOut={checkOut}
        setCheckOut={setCheckOut}
        guests={guests}
        setGuests={setGuests}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        cities={cities}
        countries={countries}
        resultsCount={filteredHotels.length}
      />

      <div className="container mx-auto px-4 py-8">
        <HotelGrid
          hotels={filteredHotels}
          isLoading={isLoading}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onBookNow={handleBookNow}
        />
      </div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        hotel={selectedHotel}
        initialBookingData={{
          checkIn: checkIn?.toISOString().split('T')[0] || '',
          checkOut: checkOut?.toISOString().split('T')[0] || '',
          guests
        }}
      />
    </div>
  );
}
