'use client';

import { Heart } from 'lucide-react';

interface MyFavoritesProps {
  favorites: string[];
  onToggleFavorite: (hotelId: string) => void;
}

export function MyFavorites({ favorites, onToggleFavorite }: MyFavoritesProps) {
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Heart className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">No Favorites Yet</h3>
        <p className="text-muted-foreground text-center">
          Start adding hotels to your favorites by clicking the heart icon when browsing hotels!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Favorites</h2>
      <p className="text-muted-foreground">
        You have {favorites.length} favorite hotel{favorites.length !== 1 ? 's' : ''}
      </p>
      <div className="grid gap-4">
        {favorites.map((hotelId) => (
          <div key={hotelId} className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Hotel ID: {hotelId}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Full hotel details will be loaded here in future updates
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
