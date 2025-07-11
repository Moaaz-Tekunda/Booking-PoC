'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'spinner', 
  text, 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const containerSizes = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  if (variant === 'dots') {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div className="flex space-x-2 mb-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>
        {text && <span className="text-sm text-muted-foreground animate-fade-in">{text}</span>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div className={`${containerSizes[size]} rounded-full bg-primary/20 flex items-center justify-center animate-pulse`}>
          <div className={`${sizeClasses[size]} rounded-full bg-primary`}></div>
        </div>
        {text && <span className="mt-3 text-sm text-muted-foreground animate-fade-in">{text}</span>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`${containerSizes[size]} rounded-full bg-card/50 backdrop-blur-sm border border-border flex items-center justify-center`}>
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-2 border-primary border-t-transparent`}></div>
      </div>
      {text && <span className="mt-3 text-sm text-muted-foreground animate-fade-in">{text}</span>}
    </div>
  );
}

interface PageLoadingProps {
  text?: string;
  showDots?: boolean;
}

export function PageLoading({ text = "Loading...", showDots = true }: PageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-card">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-card/50 backdrop-blur-sm border border-border flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>
          
          {showDots && (
            <div className="flex justify-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}
          
          <p className="text-muted-foreground animate-fade-in">{text}</p>
        </div>
      </div>
    </div>
  );
}

interface ButtonLoadingProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function ButtonLoading({ 
  isLoading, 
  loadingText = "Loading...", 
  children, 
  size = 'md' 
}: ButtonLoadingProps) {
  const spinnerSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className={`animate-spin rounded-full ${spinnerSizes[size]} border-2 border-current border-t-transparent mr-2`}></div>
        <span>{loadingText}</span>
      </div>
    );
  }

  return <>{children}</>;
}
