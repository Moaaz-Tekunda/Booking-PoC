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
        </div>
      </div>
    </div>
  );
}
