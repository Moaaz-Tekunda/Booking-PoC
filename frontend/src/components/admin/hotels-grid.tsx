'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Edit3, 
  Trash2, 
  Plus, 
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Clock,
  Wifi,
  Car,
  Dumbbell,
  Waves,
  Users,
  AlertCircle,
  Star,
  Eye,
  EyeOff
} from 'lucide-react';
import { Hotel } from '@/types/hotel';
import { useHotels, useDeleteHotel, useToggleHotelActive } from '@/hooks/use-hotels';
import { useAuth } from '@/hooks/use-auth';
import HotelModal from './hotel-modal';

interface HotelsGridProps {
  readOnly?: boolean;
}

export default function HotelsGrid({ readOnly = false }: HotelsGridProps) {
  const { user: currentUser } = useAuth();
  const { data: hotels = [], isLoading, error } = useHotels({ active_only: false }); // Get ALL hotels for admin management
  const deleteHotelMutation = useDeleteHotel();
  const toggleHotelActiveMutation = useToggleHotelActive();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    hotel?: Hotel;
  }>({
    isOpen: false,
    mode: 'create',
  });

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    // More robust status filtering - handle potential undefined/null values
    let matchesStatus = false;
    if (selectedStatus === 'all') {
      matchesStatus = true;
    } else if (selectedStatus === 'active') {
      matchesStatus = hotel.is_active === true;
    } else if (selectedStatus === 'inactive') {
      matchesStatus = hotel.is_active === false;
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (hotel: Hotel) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      hotel,
    });
  };

  const handleDelete = async (hotel: Hotel) => {
    if (window.confirm(`Are you sure you want to delete ${hotel.name}?`)) {
      await deleteHotelMutation.mutateAsync(hotel.id);
    }
  };

  const handleToggleActive = async (hotel: Hotel) => {
    await toggleHotelActiveMutation.mutateAsync({ 
      hotelId: hotel.id, 
      isActive: !hotel.is_active 
    });
  };

  const handleCreateHotel = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: 'create',
    });
  };

  const toggleCardExpansion = (hotelId: string) => {
    setExpandedCard(expandedCard === hotelId ? null : hotelId);
  };

  const canDeleteHotel = currentUser?.role === 'super_admin' || 
                        (currentUser?.role === 'admin_hotel' && currentUser.hotel_id);
  const canEditHotel = currentUser?.role === 'super_admin' || 
                      (currentUser?.role === 'admin_hotel' && currentUser.hotel_id);

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Error loading hotels</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Expanded Card Overlay */}
      {expandedCard && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={() => setExpandedCard(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            Hotels Management
          </h2>
          <p className="text-muted-foreground">Manage hotel properties and settings</p>
        </div>
        
        {!readOnly && (
          <Button 
            onClick={handleCreateHotel}
            className="bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Hotel
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search hotels by name, city, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted/30 rounded w-3/4"></div>
                <div className="h-3 bg-muted/30 rounded w-1/2"></div>
                <div className="h-10 bg-muted/30 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          filteredHotels.map((hotel) => {
            const isExpanded = expandedCard === hotel.id;
            
            return (
              <div
                key={hotel.id}
                onClick={() => toggleCardExpansion(hotel.id)}
                className={`bg-card backdrop-blur-sm border border-border rounded-2xl p-6 transition-all duration-300 group cursor-pointer ${
                  isExpanded 
                    ? 'relative z-50 shadow-2xl scale-105 bg-card/90 border-primary/50' 
                    : 'hover:bg-card/80 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] hover:border-primary/30'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
                      <Building2 className="h-6 w-6 text-primary group-hover:text-primary/90" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{hotel.name}</h3>
                      <p className="text-sm text-muted-foreground">{hotel.city}, {hotel.country}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      hotel.is_active 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {hotel.is_active ? 'Active' : 'Inactive'}
                    </div>
                    <button
                      className="p-1 rounded-lg hover:bg-primary/20 hover:scale-110 transition-all duration-200"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{hotel.contact_phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{hotel.contact_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Max capacity: {hotel.max_reservations_capacity}</span>
                  </div>
                </div>

                {/* Amenities Preview */}
                <div className="flex items-center gap-2 mb-4">
                  {hotel.has_wifi && <Wifi className="h-4 w-4 text-blue-500" />}
                  {hotel.has_parking && <Car className="h-4 w-4 text-green-500" />}
                  {hotel.has_gym && <Dumbbell className="h-4 w-4 text-orange-500" />}
                  {hotel.has_spa && <Waves className="h-4 w-4 text-purple-500" />}
                  {hotel.swimming_pools_count > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded">
                      <Waves className="h-3 w-3" />
                      {hotel.swimming_pools_count}
                    </div>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-6 animate-fade-in max-w-lg z-10">
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Address:</span>
                        <p className="font-medium text-foreground">{hotel.address}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tax Number:</span>
                        <p className="font-medium text-foreground">{hotel.tax_number}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-muted-foreground">Working Hours:</span>
                          <p className="font-medium text-foreground">
                            {hotel.working_hours_start} - {hotel.working_hours_end}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gallery:</span>
                          <p className="font-medium text-foreground">
                            {hotel.gallery.length} images
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p className="font-medium text-foreground">
                          {new Date(hotel.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Amenities Details */}
                    <div className="space-y-2">
                      <span className="text-muted-foreground text-sm">Amenities:</span>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Wifi className={`h-4 w-4 ${hotel.has_wifi ? 'text-blue-500' : 'text-muted-foreground'}`} />
                          <span className={hotel.has_wifi ? 'text-foreground' : 'text-muted-foreground'}>
                            WiFi
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className={`h-4 w-4 ${hotel.has_parking ? 'text-green-500' : 'text-muted-foreground'}`} />
                          <span className={hotel.has_parking ? 'text-foreground' : 'text-muted-foreground'}>
                            Parking
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dumbbell className={`h-4 w-4 ${hotel.has_gym ? 'text-orange-500' : 'text-muted-foreground'}`} />
                          <span className={hotel.has_gym ? 'text-foreground' : 'text-muted-foreground'}>
                            Gym
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Waves className={`h-4 w-4 ${hotel.has_spa ? 'text-purple-500' : 'text-muted-foreground'}`} />
                          <span className={hotel.has_spa ? 'text-foreground' : 'text-muted-foreground'}>
                            Spa
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {!readOnly && (
                      <div className="flex gap-2 pt-4">
                        {canEditHotel && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(hotel);
                            }}
                            className="flex-1"
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        )}
                        {canEditHotel && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(hotel);
                            }}
                            className="flex-1"
                          >
                            {hotel.is_active ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                            {hotel.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        )}
                        {canDeleteHotel && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(hotel);
                            }}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Status Indicator */}
                <div className="flex items-center justify-between mt-4">
                  <div className={`w-2 h-2 rounded-full ${hotel.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Empty State */}
      {!isLoading && filteredHotels.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No hotels found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Hotel Modal */}
      <HotelModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        hotel={modalState.hotel}
        mode={modalState.mode}
      />
    </div>
  );
}
