'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import TrackCard from '@/components/TrackCard';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Cargar favoritos del localStorage
    const storedFavorites = JSON.parse(localStorage.getItem('favorite_tracks') || '[]');
    setFavorites(storedFavorites);

    // Cargar usuario del localStorage
    const userData = localStorage.getItem('spotify_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleRemoveFavorite = (trackId) => {
    const updated = favorites.filter(track => track.id !== trackId);
    setFavorites(updated);
    localStorage.setItem('favorite_tracks', JSON.stringify(updated));
  };

  const handleToggleFavorite = (track) => {
    const isFavorite = favorites.find(f => f.id === track.id);
    
    if (isFavorite) {
      handleRemoveFavorite(track.id);
    } else {
      const updated = [...favorites, track];
      setFavorites(updated);
      localStorage.setItem('favorite_tracks', JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-black text-white">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">❤️ Mis Favoritos</h1>
          <p className="text-gray-400">
            {favorites.length} canción{favorites.length !== 1 ? 'es' : ''} guardada{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">No tienes favoritos aún</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-6 rounded transition"
            >
              Ir a generar playlists
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {favorites.map((track, index) => (
              <TrackCard
                key={track.id}
                track={track}
                index={index + 1}
                isFavorite={true}
                onRemove={() => handleRemoveFavorite(track.id)}
                onToggleFavorite={() => handleToggleFavorite(track)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}