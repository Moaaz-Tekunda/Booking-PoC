'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Settings, 
  LogOut, 
  Menu,
  X,
  ChevronRight,
  Home
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: 'overview' | 'users' | 'hotels';
  onSectionChange: (section: 'overview' | 'users' | 'hotels') => void;
  user: any;
}

export default function AdminLayout({ 
  children, 
  activeSection, 
  onSectionChange, 
  user 
}: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const sidebarItems = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'Dashboard statistics'
    },
    {
      id: 'users' as const,
      label: 'Users',
      icon: Users,
      description: 'Manage user accounts'
    },
    {
      id: 'hotels' as const,
      label: 'Hotels',
      icon: Building2,
      description: 'Manage hotel properties'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Fixed position to stay in place during scroll */}
      <div className={`${
        isSidebarOpen ? 'w-80' : 'w-20'
      } transition-all duration-300 bg-card/30 backdrop-blur-sm border-r border-border flex flex-col fixed h-full z-40`}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Hotel Management System</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hover:bg-background/50"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation - Scrollable middle section */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-glow' 
                    : 'hover:bg-background/50 text-muted-foreground hover:text-foreground'
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

        {/* User Info & Actions - Always visible at bottom */}
        <div className="p-4 border-t border-border space-y-3 bg-card/50 backdrop-blur-sm">
          {/* User Info */}
          {isSidebarOpen && (
            <div className="bg-background/50 rounded-xl p-4">
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
                    {user?.role?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons - Enhanced visibility */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={handleGoHome}
              className={`w-full justify-start hover:bg-background/50 hover:scale-[1.02] transition-all duration-200 group ${
                !isSidebarOpen ? 'px-3' : ''
              }`}
            >
              <Home className="h-4 w-4 group-hover:text-primary transition-colors" />
              {isSidebarOpen && <span className="ml-3 group-hover:text-primary transition-colors">Back to Home</span>}
            </Button>
            
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

      {/* Main Content - Offset by sidebar width */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isSidebarOpen ? 'ml-80' : 'ml-20'
      }`}>
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
