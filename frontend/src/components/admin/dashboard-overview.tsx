'use client';

import { useState } from 'react';
import { Users, Building2, Calendar, TrendingUp, Plus, DollarSign, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { toast } from 'sonner';
import UserModal from './user-modal';
import HotelModal from './hotel-modal';
import { User } from '@/types/user';
import { Hotel } from '@/types/hotel';

interface DashboardOverviewProps {
  onSectionChange?: (section: 'overview' | 'users' | 'hotels') => void;
}

export default function DashboardOverview({ onSectionChange }: DashboardOverviewProps) {
  const { user: currentUser } = useAuth();
  const { data: stats, isLoading, error } = useDashboardStats();

  // Modal statess
  const [userModalState, setUserModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    user?: User;
  }>({
    isOpen: false,
    mode: 'create',
  });

  const [hotelModalState, setHotelModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    hotel?: Hotel;
  }>({
    isOpen: false,
    mode: 'create',
  });

  // Modal handlers
  const handleCreateUser = () => {
    setUserModalState({
      isOpen: true,
      mode: 'create',
    });
  };

  const handleCreateHotel = () => {
    setHotelModalState({
      isOpen: true,
      mode: 'create',
    });
  };

  const closeUserModal = () => {
    setUserModalState({
      isOpen: false,
      mode: 'create',
    });
  };

  const closeHotelModal = () => {
    setHotelModalState({
      isOpen: false,
      mode: 'create',
    });
  };

  // Permission checks
  const canCreateUser = currentUser?.role === 'super_admin';
  const canCreateHotel = currentUser?.role === 'super_admin' || 
                        (currentUser?.role === 'admin_hotel' && currentUser.hotel_id);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users?.toLocaleString() || '0',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      change: '+12%',
      changeColor: 'text-green-500',
      onClick: () => onSectionChange?.('users')
    },
    {
      title: 'Hotels',
      value: stats?.total_hotels?.toLocaleString() || '0',
      icon: Building2,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      change: '+5%',
      changeColor: 'text-green-500',
      onClick: () => onSectionChange?.('hotels')
    },
    {
      title: 'Bookings',
      value: stats?.total_bookings?.toLocaleString() || '0',
      icon: Calendar,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      change: '+18%',
      changeColor: 'text-green-500',
      onClick: () => toast.info('Bookings management coming soon')
    },
    {
      title: 'Revenue',
      value: `$${stats?.total_revenue?.toLocaleString() || '0'}`,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      change: '+23%',
      changeColor: 'text-green-500',
      onClick: () => toast.info('Revenue analytics coming soon')
    }
  ];

  const quickActions = [
    ...(canCreateHotel ? [{
      title: 'Add New Hotel',
      description: 'Register a new hotel property',
      icon: Building2,
      action: handleCreateHotel,
      color: 'bg-primary'
    }] : []),
    ...(canCreateUser ? [{
      title: 'Create User Account',
      description: 'Add a new user to the system',
      icon: Users,
      action: handleCreateUser,
      color: 'bg-secondary'
    }] : []),
    {
      title: 'View Analytics',
      description: 'Detailed booking and revenue analytics',
      icon: TrendingUp,
      action: () => {
        if (onSectionChange) {
          onSectionChange('users');
          toast.success('Navigating to Users section');
        } else {
          toast.info('Analytics feature coming soon');
        }
      },
      color: 'bg-accent'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4">
          <p className="text-sm">Failed to load dashboard data. Please try again later.</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <div
              key={stat.title}
              onClick={stat.onClick}
              className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:bg-card/70 hover:shadow-card hover:scale-105 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${stat.changeColor}`}>
                    {stat.change}
                  </span>
                  {onSectionChange && (stat.title === 'Total Users' || stat.title === 'Hotels') && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  {isLoading ? (
                    <div className="h-8 bg-muted/30 rounded animate-pulse"></div>
                  ) : (
                    stat.value
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Stats Row */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Active Hotels</h3>
                <p className="text-sm text-muted-foreground">Currently operational</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {isLoading ? (
                <div className="h-8 bg-muted/30 rounded animate-pulse"></div>
              ) : (
                stats.active_hotels
              )}
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Pending Bookings</h3>
                <p className="text-sm text-muted-foreground">Awaiting confirmation</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {isLoading ? (
                <div className="h-8 bg-muted/30 rounded animate-pulse"></div>
              ) : (
                stats.pending_bookings
              )}
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h3>
        <div className={`grid grid-cols-1 gap-6 ${
          quickActions.length === 1 ? 'md:grid-cols-1 max-w-md' :
          quickActions.length === 2 ? 'md:grid-cols-2' :
          'md:grid-cols-3'
        }`}>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <button
                key={action.title}
                onClick={action.action}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 text-left hover:bg-card/70 hover:shadow-card hover:scale-105 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${action.color}/10`}>
                    <Icon className={`h-6 w-6 text-primary`} />
                  </div>
                  <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{action.title}</h4>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-6">Recent Activity</h3>
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-muted/30 animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted/30 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-muted/30 rounded animate-pulse w-1/2"></div>
                  </div>
                  <div className="h-3 bg-muted/30 rounded animate-pulse w-16"></div>
                </div>
              ))
            ) : (stats?.recent_activity && stats.recent_activity.length > 0) ? (
              // Real activity data
              stats.recent_activity.map((activity, index) => {
                const getIcon = () => {
                  switch (activity.icon) {
                    case 'users': return Users;
                    case 'building': return Building2;
                    case 'calendar': return Calendar;
                    default: return TrendingUp;
                  }
                };
                const Icon = getIcon();
                
                const getIconColor = () => {
                  switch (activity.type) {
                    case 'user_registration': return 'text-blue-500 bg-blue-500/20';
                    case 'hotel_added': return 'text-purple-500 bg-purple-500/20';
                    case 'booking_created': return 'text-orange-500 bg-orange-500/20';
                    default: return 'text-primary bg-primary/20';
                  }
                };
                
                return (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-background/50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconColor()}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                );
              })
            ) : (
              // Empty state
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={userModalState.isOpen}
        onClose={closeUserModal}
        user={userModalState.user}
        mode={userModalState.mode}
      />

      {/* Hotel Modal */}
      <HotelModal
        isOpen={hotelModalState.isOpen}
        onClose={closeHotelModal}
        hotel={hotelModalState.hotel}
        mode={hotelModalState.mode}
      />
    </div>
  );
}
