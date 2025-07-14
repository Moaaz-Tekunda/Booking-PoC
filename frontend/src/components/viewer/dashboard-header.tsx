import { useAuth } from '@/hooks/use-auth';

export function DashboardHeader() {
  const { user } = useAuth();

  return (
    <div className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Find Your Perfect Stay</h1>
            <p className="text-muted-foreground">Discover amazing hotels worldwide</p>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Welcome back!</p>
                <p className="text-xs text-muted-foreground">{user.name}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
