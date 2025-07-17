"use client";
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminHotelLayout from '@/components/hotel-admin/hotel-admin-layout';
import HotelAdminDashboard from '@/components/hotel-admin/hotel-admin-dashboard';
import { MyHotels } from '@/components/hotel-admin/my-hotels';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'overview' | 'hotels' | 'my hotels' | 'reservations'>('overview');

    useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-card">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-card/50 backdrop-blur-sm border border-border flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
    if (!isAuthenticated) {
    return null; 
  }
  return (

    <AdminHotelLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      user={user}
    >
      <div className="space-y-6">
        {activeSection === 'overview' && (
          <HotelAdminDashboard />
        )}

        {activeSection === 'hotels' && (
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-6">Hotels Management</h1>
            <p className="text-muted-foreground">Manage all hotels in the system</p>
          </div>
        )}

        {activeSection === 'my hotels' && (
          <MyHotels />
        )}

        {activeSection === 'reservations' && (
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-6">Reservations</h1>
            <p className="text-muted-foreground">Manage all reservations</p>
          </div>
        )}
      </div>
    </AdminHotelLayout>
  );

}