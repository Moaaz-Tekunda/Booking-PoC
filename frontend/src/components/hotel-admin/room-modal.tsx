"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RoomCreate, RoomUpdate, Room, RoomType } from '@/types/room';
import { useCreateRoom } from '@/hooks/use-create-room';
import { roomService } from '@/services/room-service';
import { toast } from 'sonner';
import {
  X,
  Bed,
  Users,
  DollarSign,
  Hash,
  FileText,
  Loader2
} from 'lucide-react';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelId: string;
  room?: Room;
  mode: 'create' | 'edit';
}

export default function RoomModal({ isOpen, onClose, hotelId, room, mode }: RoomModalProps) {
  const { createRoom, isLoading: isCreating } = useCreateRoom();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<RoomCreate>({
    room_number: '',
    hotel_id: hotelId,
    price_per_night: 0,
    description: '',
    type: RoomType.SINGLE,
    max_occupancy: 1,
    is_available: true
  });

  // Reset form when modal opens/closes or when room data changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && room) {
        setFormData({
          room_number: room.room_number,
          hotel_id: room.hotel_id,
          price_per_night: room.price_per_night,
          description: room.description || '',
          type: room.type,
          max_occupancy: room.max_occupancy,
          is_available: room.is_available
        });
      } else {
        setFormData({
          room_number: '',
          hotel_id: hotelId,
          price_per_night: 0,
          description: '',
          type: RoomType.SINGLE,
          max_occupancy: 1,
          is_available: true
        });
      }
    }
  }, [isOpen, mode, room, hotelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'create') {
        const newRoom = await createRoom(formData);
        if (newRoom) {
          onClose();
        }
      } else if (mode === 'edit' && room) {
        setIsUpdating(true);
        const updateData: RoomUpdate = {
          room_number: formData.room_number,
          price_per_night: formData.price_per_night,
          description: formData.description,
          type: formData.type,
          max_occupancy: formData.max_occupancy,
          is_available: formData.is_available
        };
        
        await roomService.updateRoom(room.id, updateData);
        toast.success('Room updated successfully');
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (field: keyof RoomCreate, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isLoading = isCreating || isUpdating;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card backdrop-blur-xl border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Bed className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {mode === 'create' ? 'Create New Room' : 'Edit Room'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === 'create' ? 'Add a new room to your hotel' : 'Update room details'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Room Number & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Hash className="h-4 w-4 inline mr-1" />
                Room Number
              </label>
              <input
                type="text"
                value={formData.room_number}
                onChange={(e) => handleInputChange('room_number', e.target.value)}
                className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                placeholder="e.g., 101, A-205"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Bed className="h-4 w-4 inline mr-1" />
                Room Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as RoomType)}
                className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                required
              >
                <option value={RoomType.SINGLE}>Single</option>
                <option value={RoomType.DOUBLE}>Double</option>
                <option value={RoomType.SUITE}>Suite</option>
                <option value={RoomType.FAMILY}>Family</option>
              </select>
            </div>
          </div>

          {/* Price & Occupancy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Price per Night ($)
              </label>
              <input
                type="number"
                value={formData.price_per_night}
                onChange={(e) => handleInputChange('price_per_night', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Users className="h-4 w-4 inline mr-1" />
                Max Occupancy
              </label>
              <input
                type="number"
                value={formData.max_occupancy}
                onChange={(e) => handleInputChange('max_occupancy', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                min="1"
                max="10"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground resize-none"
              placeholder="Room features, amenities, view, etc."
              rows={3}
            />
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) => handleInputChange('is_available', e.target.checked)}
              className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
            />
            <label htmlFor="is_available" className="text-sm font-medium text-foreground">
              Room is available for booking
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary hover:shadow-glow"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                mode === 'create' ? 'Create Room' : 'Update Room'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
