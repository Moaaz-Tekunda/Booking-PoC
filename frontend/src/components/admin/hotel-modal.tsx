'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Camera, 
  Wifi, 
  Car, 
  Dumbbell, 
  Waves, 
  Zap,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react';
import { Hotel, HotelCreate, HotelUpdate } from '@/types/hotel';
import { useCreateHotel, useUpdateHotel } from '@/hooks/use-hotels';

interface HotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel?: Hotel;
  mode: 'create' | 'edit';
}

export default function HotelModal({ isOpen, onClose, hotel, mode }: HotelModalProps) {
  const createHotelMutation = useCreateHotel();
  const updateHotelMutation = useUpdateHotel();
  
  const [formData, setFormData] = useState({
    name: '',
    tax_number: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    country: '',
    working_hours_start: '00:00:00',
    working_hours_end: '23:59:59',
    gallery: [] as string[],
    has_gym: false,
    has_spa: false,
    has_wifi: true,
    has_parking: false,
    swimming_pools_count: 0,
    max_reservations_capacity: 100,
    is_active: true,
  });
  
  const [newGalleryItem, setNewGalleryItem] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && hotel) {
      setFormData({
        name: hotel.name,
        tax_number: hotel.tax_number,
        contact_email: hotel.contact_email,
        contact_phone: hotel.contact_phone,
        address: hotel.address,
        city: hotel.city,
        country: hotel.country,
        working_hours_start: hotel.working_hours_start,
        working_hours_end: hotel.working_hours_end,
        gallery: hotel.gallery,
        has_gym: hotel.has_gym,
        has_spa: hotel.has_spa,
        has_wifi: hotel.has_wifi,
        has_parking: hotel.has_parking,
        swimming_pools_count: hotel.swimming_pools_count,
        max_reservations_capacity: hotel.max_reservations_capacity,
        is_active: hotel.is_active,
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        tax_number: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        city: '',
        country: '',
        working_hours_start: '00:00:00',
        working_hours_end: '23:59:59',
        gallery: [],
        has_gym: false,
        has_spa: false,
        has_wifi: true,
        has_parking: false,
        swimming_pools_count: 0,
        max_reservations_capacity: 100,
        is_active: true,
      });
    }
  }, [mode, hotel, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        await createHotelMutation.mutateAsync(formData);
      } else if (mode === 'edit' && hotel) {
        await updateHotelMutation.mutateAsync({ hotelId: hotel.id, hotelData: formData });
      }
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              value
    }));
  };

  const addGalleryItem = () => {
    if (newGalleryItem.trim()) {
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, newGalleryItem.trim()]
      }));
      setNewGalleryItem('');
    }
  };

  const removeGalleryItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mode === 'create' ? (
              <Plus className="h-6 w-6 text-primary" />
            ) : (
              <Edit3 className="h-6 w-6 text-primary" />
            )}
            <h2 className="text-xl font-semibold text-foreground">
              {mode === 'create' ? 'Create New Hotel' : 'Edit Hotel'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Hotel Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  placeholder="Enter hotel name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tax Number *
                </label>
                <input
                  type="text"
                  name="tax_number"
                  value={formData.tax_number}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  placeholder="Enter tax number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Contact Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                    placeholder="Enter contact email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Contact Phone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                    placeholder="Enter contact phone"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground resize-none"
                  placeholder="Enter full address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Working Hours
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="working_hours_start"
                  value={formData.working_hours_start}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  name="working_hours_end"
                  value={formData.working_hours_end}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Gallery
            </h3>
            
            <div className="flex gap-2">
              <input
                type="url"
                value={newGalleryItem}
                onChange={(e) => setNewGalleryItem(e.target.value)}
                placeholder="Enter image URL"
                className="flex-1 px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
              />
              <Button
                type="button"
                onClick={addGalleryItem}
                variant="outline"
                className="px-4 py-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.gallery.length > 0 && (
              <div className="space-y-2">
                {formData.gallery.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-background/30 rounded-lg">
                    <span className="flex-1 text-sm text-foreground truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => removeGalleryItem(index)}
                      className="p-1 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Amenities
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="has_wifi"
                  checked={formData.has_wifi}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary/50 focus:ring-2"
                />
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  WiFi
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="has_parking"
                  checked={formData.has_parking}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary/50 focus:ring-2"
                />
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Parking
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="has_gym"
                  checked={formData.has_gym}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary/50 focus:ring-2"
                />
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Dumbbell className="h-4 w-4" />
                  Gym
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="has_spa"
                  checked={formData.has_spa}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary/50 focus:ring-2"
                />
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Waves className="h-4 w-4" />
                  Spa
                </label>
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">
              Capacity & Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Swimming Pools Count
                </label>
                <input
                  type="number"
                  name="swimming_pools_count"
                  value={formData.swimming_pools_count}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Max Reservations Capacity *
                </label>
                <input
                  type="number"
                  name="max_reservations_capacity"
                  value={formData.max_reservations_capacity}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary/50 focus:ring-2"
              />
              <label className="text-sm font-medium text-foreground">
                Active hotel
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Hotel' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
