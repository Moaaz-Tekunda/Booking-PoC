import { useState, useEffect, useCallback } from 'react';
import { hotelService } from '@/services/hotel-service';
import { Hotel } from '@/types/hotel';

interface HotelPrice {
  hotelId: string;
  price: number | null;
  loading: boolean;
  lastFetched?: number;
}

// Cache prices for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const useHotelPrices = (hotels: Hotel[]) => {
  const [hotelPrices, setHotelPrices] = useState<Map<string, HotelPrice>>(new Map());

  const fetchPriceForHotel = useCallback(async (hotel: Hotel): Promise<HotelPrice> => {
    try {
      const price = await hotelService.getCheapestRoomPrice(hotel.id);
      return {
        hotelId: hotel.id,
        price,
        loading: false,
        lastFetched: Date.now()
      };
    } catch (error) {
      console.error(`Error fetching price for hotel ${hotel.id}:`, error);
      return {
        hotelId: hotel.id,
        price: null,
        loading: false,
        lastFetched: Date.now()
      };
    }
  }, []);

  useEffect(() => {
    if (hotels.length === 0) {
      setHotelPrices(new Map());
      return;
    }

    const fetchPrices = async () => {
      const now = Date.now();
      const updatedPrices = new Map(hotelPrices);

      // Determine which hotels need price fetching
      const hotelsToFetch = hotels.filter(hotel => {
        const existing = updatedPrices.get(hotel.id);
        return !existing || 
               existing.loading || 
               !existing.lastFetched || 
               (now - existing.lastFetched) > CACHE_DURATION;
      });

      if (hotelsToFetch.length === 0) {
        return; // All prices are fresh
      }

      // Set loading state for hotels that need fetching
      hotelsToFetch.forEach(hotel => {
        updatedPrices.set(hotel.id, {
          hotelId: hotel.id,
          price: updatedPrices.get(hotel.id)?.price || null,
          loading: true,
          lastFetched: updatedPrices.get(hotel.id)?.lastFetched
        });
      });
      setHotelPrices(new Map(updatedPrices));

      // Fetch prices in batches to avoid overwhelming the server
      const batchSize = 5;
      for (let i = 0; i < hotelsToFetch.length; i += batchSize) {
        const batch = hotelsToFetch.slice(i, i + batchSize);
        const batchPromises = batch.map(fetchPriceForHotel);
        
        try {
          const results = await Promise.allSettled(batchPromises);
          
          setHotelPrices(prev => {
            const newPrices = new Map(prev);
            results.forEach((result, index) => {
              if (result.status === 'fulfilled') {
                newPrices.set(result.value.hotelId, result.value);
              } else {
                // Handle rejected promises
                const hotel = batch[index];
                newPrices.set(hotel.id, {
                  hotelId: hotel.id,
                  price: null,
                  loading: false,
                  lastFetched: Date.now()
                });
              }
            });
            return newPrices;
          });
        } catch (error) {
          console.error('Error in batch fetching prices:', error);
        }

        // Small delay between batches to be nice to the server
        if (i + batchSize < hotelsToFetch.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    };

    fetchPrices();
  }, [hotels, fetchPriceForHotel]);

  const getHotelPrice = useCallback((hotelId: string): HotelPrice => {
    return hotelPrices.get(hotelId) || {
      hotelId,
      price: null,
      loading: true
    };
  }, [hotelPrices]);

  return {
    getHotelPrice,
    isLoading: Array.from(hotelPrices.values()).some(p => p.loading),
    hotelPrices
  };
};
