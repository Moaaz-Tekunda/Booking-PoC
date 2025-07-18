import React from 'react';
import { useState } from 'react';
import { Users, Building2, Calendar, TrendingUp, Plus, DollarSign, CheckCircle, Clock, ChevronRight, LayoutDashboard  } from 'lucide-react';
import { useHotelAdminStats } from '@/hooks/use-hotel-admin-stats';
import { toast } from 'sonner';


export default function HotelAdminDashboard() {
  const { stats, isLoading, error, refetch } = useHotelAdminStats();
  console.log('Hotel Admin Stats:', stats);
  
  const statCards = [
    {
      title: 'Hotels',
      value: stats?.my_hotels?.toLocaleString() || '0',
      icon: Building2,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      change: '+5%',
      changeColor: 'text-green-500',
      onClick: () => toast.info('Hotels management coming soon')
    },
    {
      title: 'Bookings',
      value: stats?.total_reservations?.toLocaleString() || '0',
      icon: Calendar,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      change: '+18%',
      changeColor: 'text-green-500',
      onClick: () => toast.info('Bookings management coming soon')
    }
  ];

  return (
    <div className="space-y-8">

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4">
          <p className="text-sm">Failed to load dashboard data. Please try again later.</p>
          <button 
            onClick={refetch}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            Hotel Admin Dashboard
          </h2>
          <p className="text-muted-foreground">Manage your hotel operations efficiently</p>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <div
              key={stat.title}
              onClick={stat.onClick}
              className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:bg-card/70 hover:shadow-card hover:scale-[1.02] transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${stat.changeColor}`}>
                    {stat.change}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
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

      {/* Recent Activity */}
      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Activity
          </h3>
        </div>
        
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
            stats.recent_activity.map((activity: any, index: number) => {
              const getIcon = () => {
                switch (activity.icon || activity.type) {
                  case 'users': 
                  case 'user_registration':
                  case 'check-in':
                  case 'check-out': 
                    return Users;
                  case 'building': 
                  case 'hotel_added': 
                    return Building2;
                  case 'calendar': 
                  case 'booking':
                  case 'booking_created': 
                    return Calendar;
                  case 'cancellation': 
                    return Clock;
                  default: 
                    return CheckCircle;
                }
              };
              const Icon = getIcon();
              
              const getIconColor = () => {
                switch (activity.type) {
                  case 'user_registration':
                  case 'check-in':
                    return 'text-blue-500 bg-blue-500/20';
                  case 'hotel_added':
                    return 'text-purple-500 bg-purple-500/20';
                  case 'booking':
                  case 'booking_created':
                    return 'text-green-500 bg-green-500/20';
                  case 'cancellation':
                    return 'text-red-500 bg-red-500/20';
                  case 'check-out':
                    return 'text-orange-500 bg-orange-500/20';
                  default: 
                    return 'text-primary bg-primary/20';
                }
              };
              
              return (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-background/50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconColor()}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title || activity.description || activity.message || 'Activity update'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description && activity.title ? activity.description : 
                       activity.subtitle || 'Hotel activity'}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time || 'Recent'}
                  </span>
                </div>
              );
            })
          ) : (
            // Empty state
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-sm font-medium text-foreground mb-2">No recent activity</h4>
              <p className="text-xs text-muted-foreground">Activity will appear here as it happens</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}