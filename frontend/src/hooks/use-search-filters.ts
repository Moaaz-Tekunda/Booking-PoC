import { useState, useEffect } from 'react';
import { Hotel } from '@/types/hotel';

interface SearchState {
  searchTerm: string;
  selectedCity: string;
  selectedCountry: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: number;
  showFilters: boolean;
}

interface UseSearchFiltersResult extends SearchState {
  setSearchTerm: (value: string) => void;
  setSelectedCity: (value: string) => void;
  setSelectedCountry: (value: string) => void;
  setCheckIn: (value: Date | undefined) => void;
  setCheckOut: (value: Date | undefined) => void;
  setGuests: (value: number) => void;
  setShowFilters: (value: boolean) => void;
  filteredHotels: Hotel[];
  cities: string[];
  countries: string[];
}

export function useSearchFilters(hotels: Hotel[]): UseSearchFiltersResult {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Set default dates (today and tomorrow)
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setCheckIn(today);
    setCheckOut(tomorrow);
  }, []);

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

  return {
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
  };
}
