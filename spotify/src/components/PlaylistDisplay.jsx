'use client';

import { useEffect, useState } from 'react';
import TrackCard from './TrackCard';

export default function PlaylistDisplay({
  tracks,
  onRemoveTrack,
  onToggleFavorite,
  onRefresh,
  isRefreshing
}) {
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    // Cargar favoritos del localStorage
    const favorites = JSON.parse(localStorage.getItem('favorite_tracks') || '[]');
    const favoriteIdSet = new Set(favorites.map(f => f.id));
    setFavoriteIds(favoriteIdSet);
  }, []);

  const handleToggleFavorite = (track) => {
    onToggleFavorite(track);

    // Actualizar estado local
    const newFavorites = new Set(favoriteIds);
    if (newFavorites.has(track.id)) {
      newFavorites.delete(track.id);
    } else {
      newFavorites.add(track.id);
    }
    setFavoriteIds(newFavorites);
  };

  if (tracks.length === 0) {
    return (
      <div className="  p-8  text-center">
        <p className="text-white text-lg mb-4">
          Selecciona géneros y haz clic en "Generar Playlist" para comenzar
        </p>
        <p className="text-white text-sm">
          Tu playlist aparecerá aquí con hasta 30 canciones
        </p>
      </div>
    );
  }

  return (
    <div className=" p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Tu Playlist</h2>
          <p className="text-gray-400 text-sm mt-1">
            {tracks.length} canción{tracks.length !== 1 ? 'es' : ''} generada{tracks.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-2 px-4 rounded transition"
        >
          {isRefreshing ? 'Refrescando...' : '🔄 Refrescar'}
        </button>
      </div>

      {/* Tracks List */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {tracks.map((track, index) => (
          <TrackCard
            key={track.id}
            track={track}
            index={index}
            isFavorite={favoriteIds.has(track.id)}
            onRemove={() => onRemoveTrack(track.id)}
            onToggleFavorite={() => handleToggleFavorite(track)}
          />
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-gray-700 text-sm text-gray-400">
        <p>💡 Haz clic en la x para eliminar la canción, click en la estrella para marcar en favoritos</p>
      </div>
    </div>
  );
}