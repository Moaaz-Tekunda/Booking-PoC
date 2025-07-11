'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { X } from 'lucide-react';
import LoginForm from './login-form';
import RegisterForm from './register-form';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [isClosing, setIsClosing] = useState(false);
  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Handle tab switching with animation
  const handleTabSwitch = (tab: 'login' | 'register') => {
    if (tab === activeTab) return;
    
    setIsTabSwitching(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTimeout(() => setIsTabSwitching(false), 10);
    }, 150);
  };

  // Close modal when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      handleClose();
    }
  }, [isAuthenticated]);

  // Reset tab when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab(defaultTab);
      setIsClosing(false);
    }
  }, [isOpen, defaultTab]);

  // Handle smooth close animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${
      isClosing ? 'backdrop-exit' : 'backdrop-enter'
    }`}>
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm ${
            isClosing ? 'backdrop-exit' : 'backdrop-enter'
          }`}
          onClick={handleBackdropClick}
        />
        
        {/* Modal */}
        <div className={`relative w-full max-w-3xl transform overflow-hidden rounded-2xl bg-background/95 backdrop-blur-md border border-border shadow-card ${
          isClosing ? 'modal-exit' : 'modal-enter'
        }`}>
          {/* Close button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-background/50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6 pt-6">
              <button
                onClick={() => handleTabSwitch('login')}
                className={`py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === 'login'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => handleTabSwitch('register')}
                className={`py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === 'register'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign Up
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className={`${
              isTabSwitching ? 'tab-content-exit' : 'tab-content-enter'
            }`}>
              {activeTab === 'login' ? (
                <LoginForm
                  onSuccess={handleClose}
                  onSwitchToRegister={() => handleTabSwitch('register')}
                />
              ) : (
                <RegisterForm
                  onSuccess={handleClose}
                  onSwitchToLogin={() => handleTabSwitch('login')}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
