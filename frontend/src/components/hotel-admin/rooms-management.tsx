"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Room, RoomType } from '@/types/room';
import { useRoomsByHotel } from '@/hooks/use-rooms-by-hotel';
import { useDeleteRoom } from '@/hooks/use-delete-room';
import { useToggleRoomAvailability } from '@/hooks/use-toggle-room-availability';
import RoomModal from './room-modal';
import {
  Bed,
  Plus,
  Search,
  Edit3,
  Trash2,
  Users,
  DollarSign,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface RoomsManagementProps {
  hotelId: string;
  hotelName: string;
  onBack?: () => void;
}

export default function RoomsManagement({ hotelId, hotelName, onBack }: RoomsManagementProps) {
  const { data: rooms = [], isLoading, error, refetch } = useRoomsByHotel(hotelId);
  const { deleteRoom, isLoading: isDeleting } = useDeleteRoom();
  const { toggleRoomAvailability, isLoading: isToggling } = useToggleRoomAvailability();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    room?: Room;
  }>({
    isOpen: false,
    mode: 'create',
  });

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || room.type === selectedType;
    
    let matchesStatus = false;
    if (selectedStatus === 'all') {
      matchesStatus = true;
    } else if (selectedStatus === 'available') {
      matchesStatus = room.is_available === true;
    } else if (selectedStatus === 'unavailable') {
      matchesStatus = room.is_available === false;
    }
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateRoom = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
    });
  };

  const handleEditRoom = (room: Room) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      room,
    });
  };

  const handleDeleteRoom = async (room: Room) => {
    if (window.confirm(`Are you sure you want to delete room ${room.room_number}?`)) {
      const success = await deleteRoom(room.id);
      if (success) {
        if (expandedCard === room.id) {
          setExpandedCard(null);
        }
        refetch();
      }
    }
  };

  const handleToggleAvailability = async (room: Room) => {
    const updatedRoom = await toggleRoomAvailability(room.id, !room.is_available);
    if (updatedRoom) {
      refetch();
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: 'create',
    });
    refetch(); // Refresh rooms when modal closes
  };

  const toggleCardExpansion = (roomId: string) => {
    setExpandedCard(expandedCard === roomId ? null : roomId);
  };

  const getRoomTypeDisplay = (type: RoomType) => {
    switch (type) {
      case RoomType.SINGLE: return 'Single';
      case RoomType.DOUBLE: return 'Double';
      case RoomType.SUITE: return 'Suite';
      case RoomType.FAMILY: return 'Family';
      default: return type;
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Error loading rooms</h3>
          <p className="text-muted-foreground">{error}</p>
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
        <div className="flex items-center gap-4">
          {onBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
              Back to Hotels
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Bed className="h-6 w-6 text-primary" />
              Rooms - {hotelName}
            </h2>
            <p className="text-muted-foreground">Manage rooms and their availability</p>
          </div>
        </div>
        
        <Button 
          onClick={handleCreateRoom}
          className="bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Room
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search rooms by number or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
        >
          <option value="all">All Types</option>
          <option value={RoomType.SINGLE}>Single</option>
          <option value={RoomType.DOUBLE}>Double</option>
          <option value={RoomType.SUITE}>Suite</option>
          <option value={RoomType.FAMILY}>Family</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      {/* Rooms Grid */}
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
          filteredRooms.map((room) => {
            const isExpanded = expandedCard === room.id;
            
            return (
              <div
                key={room.id}
                onClick={() => toggleCardExpansion(room.id)}
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
                      <Bed className="h-6 w-6 text-primary group-hover:text-primary/90" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Room {room.room_number}</h3>
                      <p className="text-sm text-muted-foreground">{getRoomTypeDisplay(room.type)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      room.is_available 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {room.is_available ? 'Available' : 'Unavailable'}
                    </div>
                    <button className="p-1 rounded-lg hover:bg-primary/20 hover:scale-110 transition-all duration-200">
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
                    <DollarSign className="h-4 w-4" />
                    <span>${room.price_per_night}/night</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Max {room.max_occupancy} guests</span>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-6 animate-fade-in max-w-lg z-10">
                    <div className="space-y-4 text-sm">
                      {room.description && (
                        <div>
                          <span className="text-muted-foreground">Description:</span>
                          <p className="font-medium text-foreground mt-1">{room.description}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p className="font-medium text-foreground">
                          {new Date(room.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditRoom(room);
                        }}
                        className="flex-1"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAvailability(room);
                        }}
                        className="flex-1"
                        disabled={isToggling}
                      >
                        {room.is_available ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                        {isToggling ? 'Updating...' : (room.is_available ? 'Make Unavailable' : 'Make Available')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoom(room);
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Status Indicator */}
                <div className="flex items-center justify-between mt-4">
                  <div className={`w-2 h-2 rounded-full ${room.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-muted-foreground">
                    ID: {room.id}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Empty State */}
      {!isLoading && filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No rooms found</h3>
          <p className="text-muted-foreground">
            {rooms.length === 0 ? 'Create your first room to get started' : 'Try adjusting your search criteria'}
          </p>
        </div>
      )}

      {/* Room Modal */}
      <RoomModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        hotelId={hotelId}
        room={modalState.room}
        mode={modalState.mode}
      />
    </div>
  );
}
