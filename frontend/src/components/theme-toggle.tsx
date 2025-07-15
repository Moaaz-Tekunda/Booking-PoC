'use client';

import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

interface ThemeToggleProps {
  variant?: 'icon' | 'full';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', size = 'default', className = '' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'System';
    }
  };

  if (variant === 'full') {
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={cycleTheme}
        className={`justify-start gap-2 hover:bg-primary/10 hover:text-primary hover:scale-[1.02] transition-all duration-200 group ${className}`}
      >
        <span className="group-hover:text-primary transition-colors">{getIcon()}</span>
        <span className="group-hover:text-primary transition-colors">{getLabel()} Theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size={size === 'default' ? 'icon' : size}
      onClick={cycleTheme}
      className={`hover:bg-background/50 hover:scale-[1.02] transition-all duration-200 ${className}`}
      title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
    >
      {getIcon()}
    </Button>
  );
}
