"use client";
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

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
    
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-card">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h1>
        <p className="text-muted-foreground">You are logged in as {user?.name}</p>
      </div>
    </div>
  );

}