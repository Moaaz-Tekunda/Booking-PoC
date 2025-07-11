'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/admin-layout';
import UsersGrid from '@/components/admin/users-grid';
import HotelsGrid from '@/components/admin/hotels-grid';
import DashboardOverview from '@/components/admin/dashboard-overview';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'hotels'>('overview');
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.role?.includes('admin'))) {
      router.push('/');
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-card">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-card/50 backdrop-blur-sm border border-border flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
            
            {/* Pulsing dots */}
            <div className="flex justify-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
            </div>
            
            <p className="text-muted-foreground animate-fade-in">Verifying admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not admin
  if (!isAuthenticated || !user?.role?.includes('admin')) {
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview onSectionChange={setActiveSection} />;
      case 'users':
        return <UsersGrid />;
      case 'hotels':
        return <HotelsGrid />;
      default:
        return <DashboardOverview onSectionChange={setActiveSection} />;
    }
  };

  return (
    <AdminLayout 
      activeSection={activeSection} 
      onSectionChange={setActiveSection}
      user={user}
    >
      {renderContent()}
    </AdminLayout>
  );
}
