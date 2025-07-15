'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/auth/auth-modal';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';


export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error,
    logout,
    clearError 
  } = useAuth();

  const router = useRouter();

  // Prefetch routes for faster navigation
  useEffect(() => {
    router.prefetch('/admin');
    router.prefetch('/dashboard');
  }, [router]);

  // Handle redirect immediately after authentication
  useEffect(() => {
    if (isAuthenticated && user && !isRedirecting) {
      if (user.role?.includes('admin')) {
        setIsRedirecting(true);
        // Use Next.js router for smoother navigation
        router.push('/admin');
      } else {
        // Redirect viewer users to dashboard
        setIsRedirecting(true);
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router, isRedirecting]);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleStartNow = () => {
    if (isAuthenticated) {
      // If user is admin, set redirecting state and navigate
      if (user?.role?.includes('admin')) {
        setIsRedirecting(true);
        router.push('/admin');
      } else {
        // Redirect to user dashboard/booking page
        setIsRedirecting(true);
        router.push('/dashboard');
      }
    } else {
      // Open login modal
      openAuthModal('login');
    }
  };

  // Show loading spinner during authentication or redirect
  if (isLoading || isRedirecting) {
    const loadingText = isRedirecting 
      ? "Redirecting to your dashboard..." 
      : "Loading your experience...";
      
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
            
            <p className="text-muted-foreground animate-fade-in">{loadingText}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Hero onStartNow={handleStartNow} />
      <Features />
      <HowItWorks />
      <Footer />
      
      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </div>
  );
}
