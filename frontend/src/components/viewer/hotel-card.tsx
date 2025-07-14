'use client';

import { Button } from '@/components/ui/button';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { 
  MapPin, 
  Users, 
  Wifi, 
  Car, 
  Dumbbell, 
  Waves,
  Star,
  Heart,
  Share2,
  Clock,
  Phone,
} from 'lucide-react';
import { Hotel } from '@/types/hotel';
import Image from 'next/image';

interface HotelCardProps {
  hotel: Hotel;
  hotelImages: string[];
  rating: number;
  pricePerNight: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onBookNow: () => void;
}

export function HotelCard({ 
  hotel, 
  hotelImages, 
  rating, 
  pricePerNight, 
  isFavorite, 
  onToggleFavorite, 
  onBookNow 
}: HotelCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] transition-all duration-300">
      {/* Image Gallery */}
      <div className="relative h-64 overflow-hidden">
        {hotelImages.length > 0 ? (
          <Carousel className="w-full h-full">
            <CarouselContent className="h-full">
              {hotelImages.map((image, index) => (
                <CarouselItem key={index} className="h-full">
                  <div className="relative h-64">
                    <Image
                      src={image}
                      alt={`${hotel.name} - Image ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {hotelImages.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-black/80 border-none text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-black/80 border-none text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="w-full h-full bg-muted/30 flex items-center justify-center">
            <span className="text-muted-foreground">No Images</span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
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
          onClick={onBookNow}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200"
        >
          Book Now
        </Button>
      </div>
    </div>
  );
}
