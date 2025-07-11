'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    const success = await login(email, password);
    
    if (success) {
      onSuccess?.();
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
        <p className="text-muted-foreground">Sign in to your account to continue</p>
      </div>
        
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button 
                onClick={clearError}
                className="text-destructive/70 hover:text-destructive"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                placeholder="Enter your password"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !email || !password}
            className="w-full bg-gradient-primary text-primary-foreground hover:shadow-glow hover:scale-105 transition-all duration-300 py-3 text-base font-medium"
            size="lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span>Sign In</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </div>
            )}
          </Button>
        </form>

        {/* Quick Test Accounts */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3 text-center">Quick test accounts:</p>
          <div className="space-y-2 text-xs">
            <button
              onClick={() => {
                setEmail('admin@example.com');
                setPassword('admin123');
              }}
              className="block w-full text-left p-2 rounded-lg bg-background/30 hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-primary font-medium">Admin:</span> moaaz.admin@mail.com / password
            </button>
            <button
              onClick={() => {
                setEmail('user@example.com');
                setPassword('user123');
              }}
              className="block w-full text-left p-2 rounded-lg bg-background/30 hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-primary font-medium">User:</span> moaaz@mail.com / user123
            </button>
          </div>
        </div>

        {onSwitchToRegister && (
          <div className="mt-6 text-center">
            <span className="text-sm text-muted-foreground">Don't have an account? </span>
            <button
              onClick={onSwitchToRegister}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign Up
            </button>
          </div>
        )}
    </div>
  );
}
