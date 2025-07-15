'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Calendar, 
  Heart, 
  User, 
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';

interface ViewerSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export function ViewerSidebar({ 
  currentView, 
  onViewChange, 
  isSidebarOpen, 
  setIsSidebarOpen 
}: ViewerSidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const sidebarItems = [
    {
      id: 'search',
      label: 'Search Hotels',
      icon: Search,
      description: 'Find and book hotels'
    },
    {
      id: 'reservations',
      label: 'My Reservations',
      icon: Calendar,
      description: 'View your bookings'
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Heart,
      description: 'Saved hotels'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      description: 'Account settings'
    }
  ];

  return (
    <div className={`${
      isSidebarOpen ? 'w-80' : 'w-20'
    } transition-all duration-300 bg-background backdrop-blur-sm border-r border-border flex flex-col fixed h-full z-40`}>
      
      {/* Sidebar Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          {isSidebarOpen && (
            <div>
              <h1 className="text-2xl font-bold text-foreground">BookingApp</h1>
              <p className="text-sm text-muted-foreground">Find Your Perfect Stay</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hover:bg-muted/50"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-glow' 
                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : ''}`} />
              {isSidebarOpen && (
                <div className="flex-1 text-left">
                  <div className={`font-medium ${isActive ? 'text-primary-foreground' : ''}`}>
                    {item.label}
                  </div>
                  <div className={`text-xs ${
                    isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {item.description}
                  </div>
                </div>
              )}
              {isSidebarOpen && (
                <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                  isActive ? 'text-primary-foreground' : ''
                }`} />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info & Actions */}
      <div className="p-4 border-t border-border space-y-3 bg-background backdrop-blur-sm">
        {/* User Info */}
        {isSidebarOpen && user && (
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1">
                  GUEST
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <ThemeToggle 
            variant={isSidebarOpen ? "full" : "icon"} 
            className={isSidebarOpen ? "w-full" : "w-full"}
          />
          
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full justify-start hover:bg-destructive/10 hover:text-destructive hover:scale-[1.02] transition-all duration-200 group ${
              !isSidebarOpen ? 'px-3' : ''
            }`}
          >
            <LogOut className="h-4 w-4 group-hover:text-destructive transition-colors" />
            {isSidebarOpen && <span className="ml-3 group-hover:text-destructive transition-colors">Sign Out</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
