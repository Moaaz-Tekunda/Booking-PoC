import { Search } from 'lucide-react';
import { HotelCard } from './hotel-card';
import { Hotel } from '@/types/hotel';
import { generateHotelImages, generateHotelRating } from '@/utils/hotel-utils';
import { useHotelPrices } from '@/hooks/use-hotel-prices';

interface HotelGridProps {
  hotels: Hotel[];
  isLoading: boolean;
  favorites: string[];
  onToggleFavorite: (hotelId: string) => void;
  onBookNow: (hotel: Hotel) => void;
  showOnlyAvailable?: boolean;
}

export function HotelGrid({ 
  hotels, 
  isLoading, 
  favorites, 
  onToggleFavorite, 
  onBookNow,
  showOnlyAvailable = false
}: HotelGridProps) {
  const { getHotelPrice } = useHotelPrices(hotels);

  // Filter hotels based on room availability if requested
  const filteredHotels = showOnlyAvailable 
    ? hotels.filter(hotel => {
        const hotelPrice = getHotelPrice(hotel.id);
        // Only show hotels where we have confirmed available rooms (price > 0)
        // Exclude hotels that are still loading or have no available rooms
        return !hotelPrice.loading && hotelPrice.price !== null && hotelPrice.price > 0;
      })
    : hotels;

  if (isLoading) {
    return (
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
    );
  }

  if (filteredHotels.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="bg-card rounded-2xl p-8 max-w-md mx-auto border border-border">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {showOnlyAvailable ? 'No hotels with available rooms found' : 'No hotels found'}
          </h3>
          <p className="text-muted-foreground">
            {showOnlyAvailable 
              ? 'Try adjusting your search criteria or check back later for availability'
              : 'Try adjusting your search criteria or filters'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredHotels.map((hotel) => {
        const isFavorite = favorites.includes(hotel.id);
        const hotelImages = hotel.gallery.length > 0 ? hotel.gallery : generateHotelImages(hotel.id, hotel.name);
        const rating = generateHotelRating(hotel.id);
        const hotelPrice = getHotelPrice(hotel.id);
        
        // Use real room price if available, otherwise show placeholder
        const pricePerNight = hotelPrice.price || 0;

        return (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            hotelImages={hotelImages}
            rating={rating}
            pricePerNight={pricePerNight}
            isFavorite={isFavorite}
            onToggleFavorite={() => onToggleFavorite(hotel.id)}
            onBookNow={() => onBookNow(hotel)}
            isPriceLoading={hotelPrice.loading}
          />
        );
      })}
    </div>
  );
}
