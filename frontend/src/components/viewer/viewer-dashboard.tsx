'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Wifi, 
  Car, 
  Dumbbell, 
  Waves,
  Star,
  Filter,
  SlidersHorizontal,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Phone,
  Mail
} from 'lucide-react';
import { Hotel } from '@/types/hotel';
import { useHotels, useSearchHotels } from '@/hooks/use-hotels';
import { useAuth } from '@/hooks/use-auth';
import BookingModal from './booking-modal';
import { generateHotelImages, generateHotelRating, generateHotelPrice } from '@/utils/hotel-utils';
import Image from 'next/image';

export default function ViewerDashboard() {
  const { user } = useAuth();
  const { data: hotels = [], isLoading } = useHotels({ active_only: true });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hoveredHotel, setHoveredHotel] = useState<string | null>(null);
  const [imageIndexes, setImageIndexes] = useState<{[key: string]: number}>({});
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Filter hotels based on search criteria
  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = searchTerm === '' || 
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = selectedCity === '' || hotel.city.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesCountry = selectedCountry === '' || hotel.country.toLowerCase().includes(selectedCountry.toLowerCase());
    
    return matchesSearch && matchesCity && matchesCountry;
  });

  // Get unique cities and countries for filter options
  const cities = [...new Set(hotels.map(hotel => hotel.city))];
  const countries = [...new Set(hotels.map(hotel => hotel.country))];

  const toggleFavorite = (hotelId: string) => {
    setFavorites(prev => 
      prev.includes(hotelId) 
        ? prev.filter(id => id !== hotelId)
        : [...prev, hotelId]
    );
  };

  const nextImage = (hotelId: string, galleryLength: number) => {
    setImageIndexes(prev => ({
      ...prev,
      [hotelId]: ((prev[hotelId] || 0) + 1) % galleryLength
    }));
  };

  const prevImage = (hotelId: string, galleryLength: number) => {
    setImageIndexes(prev => ({
      ...prev,
      [hotelId]: ((prev[hotelId] || 0) - 1 + galleryLength) % galleryLength
    }));
  };

  const handleBookNow = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setIsBookingModalOpen(true);
  };

  // Set default dates (today and tomorrow)
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setCheckIn(today.toISOString().split('T')[0]);
    setCheckOut(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Auto-slide images on hover
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (hoveredHotel) {
      const hotel = filteredHotels.find(h => h.id === hoveredHotel);
      if (hotel) {
        const hotelImages = hotel.gallery.length > 0 ? hotel.gallery : generateHotelImages(hotel.id, hotel.name);
        if (hotelImages.length > 1) {
          interval = setInterval(() => {
            setImageIndexes(prev => ({
              ...prev,
              [hoveredHotel]: ((prev[hoveredHotel] || 0) + 1) % hotelImages.length
            }));
          }, 2000); // Change image every 2 seconds
        }
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [hoveredHotel, filteredHotels]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Find Your Perfect Stay</h1>
              <p className="text-muted-foreground">Discover amazing hotels worldwide</p>
            </div>
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">Welcome back!</p>
                  <p className="text-xs text-muted-foreground">{user.name}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="container mx-auto px-4 py-8">
          {/* Main Search Bar */}
          <div className="bg-card rounded-2xl p-6 shadow-lg border border-border max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              {/* Location Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Where to?</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search destination, hotel name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Check-in Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  />
                </div>
              </div>

              {/* Check-out Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  />
                </div>
              </div>

              {/* Guests */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Guests</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              
              <div className="text-sm text-muted-foreground">
                {filteredHotels.length} hotel{filteredHotels.length !== 1 ? 's' : ''} found
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  >
                    <option value="">All Cities</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  >
                    <option value="">All Countries</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="h-64 bg-muted/30 animate-pulse"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-muted/30 rounded animate-pulse"></div>
                  <div className="h-4 bg-muted/30 rounded w-2/3 animate-pulse"></div>
                  <div className="h-10 bg-muted/30 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-card rounded-2xl p-8 max-w-md mx-auto border border-border">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No hotels found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map((hotel) => {
              const currentImageIndex = imageIndexes[hotel.id] || 0;
              const isFavorite = favorites.includes(hotel.id);
              const isHovered = hoveredHotel === hotel.id;
              
              // Get images (use gallery if available, otherwise generate placeholder images)
              const hotelImages = hotel.gallery.length > 0 ? hotel.gallery : generateHotelImages(hotel.id, hotel.name);
              const rating = generateHotelRating(hotel.id);
              const pricePerNight = generateHotelPrice(hotel.id, hotel.city);

              return (
                <div
                  key={hotel.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] transition-all duration-300"
                  onMouseEnter={() => setHoveredHotel(hotel.id)}
                  onMouseLeave={() => setHoveredHotel(null)}
                >
                  {/* Image Gallery */}
                  <div className="relative h-64 overflow-hidden">
                    {hotelImages.length > 0 ? (
                      <>
                        {/* Multiple images with sliding effect */}
                        <div className="relative w-full h-full">
                          {hotelImages.map((image, index) => (
                            <div
                              key={index}
                              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                                index === currentImageIndex 
                                  ? 'translate-x-0' 
                                  : index < currentImageIndex 
                                    ? '-translate-x-full' 
                                    : 'translate-x-full'
                              }`}
                            >
                              <Image
                                src={image}
                                alt={`${hotel.name} - Image ${index + 1}`}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            </div>
                          ))}
                        </div>
                        
                        {/* Manual Navigation Buttons */}
                        {hotelImages.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                prevImage(hotel.id, hotelImages.length);
                              }}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                nextImage(hotel.id, hotelImages.length);
                              }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        {/* Image Indicators */}
                        {hotelImages.length > 1 && (
                          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10">
                            {hotelImages.map((_, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setImageIndexes(prev => ({
                                    ...prev,
                                    [hotel.id]: index
                                  }));
                                }}
                                className={`w-2 h-2 rounded-full transition-all duration-200 ${ 
                                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        )}

                        {/* Image Counter */}
                        {hotelImages.length > 1 && (
                          <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
                            {currentImageIndex + 1} / {hotelImages.length}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                        <span className="text-muted-foreground">No Images</span>
                      </div>
                    )}

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(hotel.id);
                      }}
                      className="absolute top-3 right-3 w-9 h-9 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-200 z-20"
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement share functionality
                        console.log('Share hotel:', hotel.id);
                      }}
                      className="absolute top-3 right-14 w-9 h-9 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 z-20"
                    >
                      <Share2 className="h-4 w-4 text-white" />
                    </button>
                  </div>

                  {/* Hotel Info */}
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
                          {hotel.name}
                        </h3>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{hotel.city}, {hotel.country}</span>
                        </div>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-lg text-sm font-medium">
                        <Star className="h-4 w-4 fill-current" />
                        <span>{rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="flex items-center gap-3 mb-4">
                      {hotel.has_wifi && <Wifi className="h-4 w-4 text-blue-500" />}
                      {hotel.has_parking && <Car className="h-4 w-4 text-green-500" />}
                      {hotel.has_gym && <Dumbbell className="h-4 w-4 text-orange-500" />}
                      {hotel.has_spa && <Waves className="h-4 w-4 text-purple-500" />}
                      {hotel.swimming_pools_count > 0 && (
                        <div className="flex items-center gap-1 text-blue-500">
                          <Waves className="h-4 w-4" />
                          <span className="text-xs">{hotel.swimming_pools_count}</span>
                        </div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{hotel.contact_phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{hotel.working_hours_start} - {hotel.working_hours_end}</span>
                      </div>
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Max {hotel.max_reservations_capacity} guests</span>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">From</p>
                        <p className="text-lg font-bold text-foreground">${pricePerNight}<span className="text-sm font-normal">/night</span></p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleBookNow(hotel)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedHotel(null);
        }}
        hotel={selectedHotel}
        initialBookingData={{
          checkIn,
          checkOut,
          guests
        }}
      />
    </div>
  );
}
