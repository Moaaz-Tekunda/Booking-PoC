import React from 'react';
import { useState } from 'react';
import { Users, Building2, Calendar, TrendingUp, Plus, DollarSign, CheckCircle, Clock, ChevronRight, LayoutDashboard  } from 'lucide-react';
import { useHotelAdminStats } from '@/hooks/use-hotel-admin-stats';
import { toast } from 'sonner';


export default function HotelAdminDashboard() {
  const { stats, isLoading, error, refetch } = useHotelAdminStats();
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

    </div>
  );
}