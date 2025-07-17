'use client';

import { useState } from 'react';
import { useHotels } from '@/hooks/use-hotels';
import { useSearchFilters } from '@/hooks/use-search-filters';
import { Hotel } from '@/types/hotel';
import BookingModal from './booking-modal';
import { DashboardHeader } from './dashboard-header';
import { SearchFilters } from './search-filters';
import { HotelGrid } from './hotel-grid';
import { ViewerSidebar } from './viewer-sidebar';
import MyReservations from './my-reservations';
import { MyFavorites } from './my-favorites';

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
  const [currentView, setCurrentView] = useState('search');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  const renderMainContent = () => {
    switch (currentView) {
      case 'search':
        return (
          <>
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
                showOnlyAvailable={true}
              />
            </div>
          </>
        );

      case 'reservations':
        return (
          <div className="container mx-auto px-4 py-8">
            <MyReservations />
          </div>
        );

      case 'favorites':
        return (
          <div className="container mx-auto px-4 py-8">
            <MyFavorites 
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        );

      case 'profile':
        return (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
            <p className="text-muted-foreground">Profile management coming soon...</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <ViewerSidebar 
        currentView={currentView}
        onViewChange={setCurrentView}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isSidebarOpen ? 'ml-80' : 'ml-20'
      }`}>
        <DashboardHeader />
        
        <main className="flex-1 overflow-auto">
          {renderMainContent()}
        </main>
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
