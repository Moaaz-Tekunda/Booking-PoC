import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelService } from '@/services/hotel-service';
import { Hotel, HotelCreate, HotelUpdate } from '@/types/hotel';
import { toast } from 'sonner';

// Query keys
export const hotelQueryKeys = {
  all: ['hotels'] as const,
  lists: () => [...hotelQueryKeys.all, 'list'] as const,
  list: (params: { skip?: number; limit?: number; active_only?: boolean }) => [...hotelQueryKeys.lists(), params] as const,
  details: () => [...hotelQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...hotelQueryKeys.details(), id] as const,
  search: (params: { city?: string; country?: string }) => [...hotelQueryKeys.all, 'search', params] as const,
};

// Get all hotels
export const useHotels = (params?: { skip?: number; limit?: number; active_only?: boolean }) => {
  return useQuery({
    queryKey: hotelQueryKeys.list(params || {}),
    queryFn: () => hotelService.getHotels(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get a specific hotel
export const useHotel = (hotelId: string) => {
  return useQuery({
    queryKey: hotelQueryKeys.detail(hotelId),
    queryFn: () => hotelService.getHotel(hotelId),
    enabled: !!hotelId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Search hotels
export const useSearchHotels = (params?: { city?: string; country?: string }) => {
  return useQuery({
    queryKey: hotelQueryKeys.search(params || {}),
    queryFn: () => hotelService.searchHotels(params),
    enabled: !!(params?.city || params?.country),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create hotel mutation
export const useCreateHotel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (hotelData: HotelCreate) => hotelService.createHotel(hotelData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.all });
      toast.success('Hotel created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create hotel');
    },
  });
};

// Update hotel mutation
export const useUpdateHotel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ hotelId, hotelData }: { hotelId: string; hotelData: HotelUpdate }) => 
      hotelService.updateHotel(hotelId, hotelData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.all });
      queryClient.setQueryData(hotelQueryKeys.detail(variables.hotelId), data);
      toast.success('Hotel updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update hotel');
    },
  });
};

// Delete hotel mutation
export const useDeleteHotel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (hotelId: string) => hotelService.deleteHotel(hotelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.all });
      toast.success('Hotel deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete hotel');
    },
  });
};

// Toggle hotel active status mutation
export const useToggleHotelActive = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ hotelId, isActive }: { hotelId: string; isActive: boolean }) => 
      hotelService.toggleHotelActive(hotelId, isActive),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.all });
      queryClient.setQueryData(hotelQueryKeys.detail(variables.hotelId), data);
      toast.success(`Hotel ${data.is_active ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update hotel status');
    },
  });
};
