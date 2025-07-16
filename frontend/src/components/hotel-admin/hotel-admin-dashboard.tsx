import React from 'react';
import { useState } from 'react';
import { useHotelAdminStats } from '@/hooks/use-hotel-admin-stats';

export default function HotelAdminDashboard() {
  const { stats, isLoading, error, refetch } = useHotelAdminStats();
  

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground mb-6">Hotel Admin Dashboard</h1>
      <p className="text-muted-foreground">Manage your hotel operations efficiently</p>
    </div>
  );
}