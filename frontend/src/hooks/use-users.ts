import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user-service';
import { User, UserCreate, UserUpdate } from '@/types/user';
import { toast } from 'sonner';

// Query keys
export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (params: { skip?: number; limit?: number }) => [...userQueryKeys.lists(), params] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...userQueryKeys.details(), id] as const,
  byHotel: (hotelId: string) => [...userQueryKeys.all, 'hotel', hotelId] as const,
};

// Get all users
export const useUsers = (params?: { skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: userQueryKeys.list(params || {}),
    queryFn: () => userService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get a specific user
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: userQueryKeys.detail(userId),
    queryFn: () => userService.getUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get users by hotel
export const useUsersByHotel = (hotelId: string, params?: { skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: userQueryKeys.byHotel(hotelId),
    queryFn: () => userService.getUsersByHotel(hotelId, params),
    enabled: !!hotelId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: UserCreate) => userService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create user');
    },
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: UserUpdate }) => 
      userService.updateUser(userId, userData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      queryClient.setQueryData(userQueryKeys.detail(variables.userId), data);
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update user');
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
    },
  });
};

// Toggle user active status mutation
export const useToggleUserActive = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) => 
      userService.toggleUserActive(userId, isActive),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      queryClient.setQueryData(userQueryKeys.detail(variables.userId), data);
      toast.success(`User ${data.is_active ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update user status');
    },
  });
};
