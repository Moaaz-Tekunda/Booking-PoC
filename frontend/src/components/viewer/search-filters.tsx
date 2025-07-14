import { Button } from '@/components/ui/button';
import { 
  Search, 
  Users, 
  SlidersHorizontal,
} from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  checkIn: Date | undefined;
  setCheckIn: (value: Date | undefined) => void;
  checkOut: Date | undefined;
  setCheckOut: (value: Date | undefined) => void;
  guests: number;
  setGuests: (value: number) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  selectedCity: string;
  setSelectedCity: (value: string) => void;
  selectedCountry: string;
  setSelectedCountry: (value: string) => void;
  cities: string[];
  countries: string[];
  resultsCount: number;
}

export function SearchFilters({
  searchTerm,
  setSearchTerm,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  guests,
  setGuests,
  showFilters,
  setShowFilters,
  selectedCity,
  setSelectedCity,
  selectedCountry,
  setSelectedCountry,
  cities,
  countries,
  resultsCount,
}: SearchFiltersProps) {
  return (
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
              <DatePicker
                date={checkIn}
                onDateChange={setCheckIn}
                placeholder="Select check-in date"
                minDate={new Date()}
              />
            </div>

            {/* Check-out Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Check-out</label>
              <DatePicker
                date={checkOut}
                onDateChange={setCheckOut}
                placeholder="Select check-out date"
                minDate={checkIn || new Date()}
              />
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
              {resultsCount} hotel{resultsCount !== 1 ? 's' : ''} found
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
  );
}
