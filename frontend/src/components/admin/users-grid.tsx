'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Edit3, 
  Trash2, 
  Plus, 
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Calendar,
  Shield,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';
import { User } from '@/types/user';
import { useUsers, useDeleteUser, useToggleUserActive } from '@/hooks/use-users';
import { useAuth } from '@/hooks/use-auth';
import UserModal from './user-modal';

export default function UsersGrid() {
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading, error } = useUsers();
  const deleteUserMutation = useDeleteUser();
  const toggleUserActiveMutation = useToggleUserActive();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    user?: User;
  }>({
    isOpen: false,
    mode: 'create',
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'admin_hotel':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'viewer':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const handleEdit = (user: User) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      user,
    });
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      await deleteUserMutation.mutateAsync(user.id);
    }
  };

  const handleToggleActive = async (user: User) => {
    await toggleUserActiveMutation.mutateAsync({ 
      userId: user.id, 
      isActive: !user.is_active 
    });
  };

  const handleCreateUser = () => {
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

  const toggleCardExpansion = (userId: string) => {
    setExpandedCard(expandedCard === userId ? null : userId);
  };

  const canDeleteUser = currentUser?.role === 'super_admin';
  const canEditUser = currentUser?.role === 'super_admin' || currentUser?.role === 'admin_hotel';

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Error loading users</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            Users Management
          </h2>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        
        <Button 
          onClick={handleCreateUser}
          className="bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
        >
          <option value="all">All Roles</option>
          <option value="viewer">Viewer</option>
          <option value="admin_hotel">Hotel Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      {/* Users Grid */}
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
          filteredUsers.map((user) => {
            const isExpanded = expandedCard === user.id;
            
            return (
              <div
                key={user.id}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:bg-card/70 hover:shadow-card transition-all duration-300 group"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                    <button
                      onClick={() => toggleCardExpansion(user.id)}
                      className="p-1 rounded-lg hover:bg-background/50 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{user.mobile_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{user.age} years old, {user.gender}</span>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-border pt-4 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Job:</span>
                        <p className="font-medium text-foreground">{user.job_type || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <p className={`font-medium ${user.is_active ? 'text-green-500' : 'text-red-500'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Member since:</span>
                        <p className="font-medium text-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {canEditUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          className="flex-1"
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                      {canEditUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(user)}
                          className="flex-1"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                      {canDeleteUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Indicator */}
                <div className="flex items-center justify-between mt-4">
                  <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-muted-foreground">
                    ID: {user.id}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Empty State */}
      {!isLoading && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No users found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        user={modalState.user}
        mode={modalState.mode}
      />
    </div>
  );
}
