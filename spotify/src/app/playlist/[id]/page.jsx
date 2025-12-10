'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import TrackCard from '@/components/TrackCard';

export default function PlaylistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playingPreview, setPlayingPreview] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    // Cargar usuario
    const userData = localStorage.getItem('spotify_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Cargar playlist del sessionStorage o localStorage
    const playlistData = sessionStorage.getItem('playlist_details') || localStorage.getItem(`playlist_${params.id}`);
    
    if (playlistData) {
      setPlaylist(JSON.parse(playlistData));
    } else {
      // Si no está en sessionStorage, buscar en historial
      const history = JSON.parse(localStorage.getItem('playlist_history') || '[]');
      const found = history.find(p => p.id === params.id);
      if (found) {
        setPlaylist(found);
      }
    }

    // Cargar favoritos
    const favorites = JSON.parse(localStorage.getItem('favorite_tracks') || '[]');
    const favoriteIdSet = new Set(favorites.map(f => f.id));
    setFavoriteIds(favoriteIdSet);

    setLoading(false);
  }, [params.id]);

  const handleToggleFavorite = (track) => {
    const favorites = JSON.parse(localStorage.getItem('favorite_tracks') || '[]');
    const isFavorite = favorites.find(f => f.id === track.id);

    if (isFavorite) {
      const updated = favorites.filter(f => f.id !== track.id);
      localStorage.setItem('favorite_tracks', JSON.stringify(updated));
      setFavoriteIds(new Set(updated.map(f => f.id)));
    } else {
      favorites.push(track);
      localStorage.setItem('favorite_tracks', JSON.stringify(favorites));
      setFavoriteIds(new Set(favorites.map(f => f.id)));
    }
  };

  const handleRemoveTrack = (trackId) => {
    if (!playlist) return;
    
    const updated = {
      ...playlist,
      tracks: playlist.tracks.filter(t => t.id !== trackId)
    };
    setPlaylist(updated);
    localStorage.setItem('playlist_history', JSON.stringify(
      JSON.parse(localStorage.getItem('playlist_history') || '[]').map(p => 
        p.id === playlist.id ? updated : p
      )
    ));
  };

  const togglePreview = (trackId) => {
    if (playingPreview === trackId) {
      setPlayingPreview(null);
    } else {
      setPlayingPreview(trackId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-900 via-black to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-900 via-black to-black text-white">
        <Header user={user} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">Playlist no encontrada</p>
            <button
              onClick={() => router.push('/playlist-history')}
              className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-6 rounded transition"
            >
              Volver al Historial
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-900 via-black to-black text-white">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header de Playlist */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/playlist-history')}
            className="text-green-500 hover:text-green-400 font-semibold mb-4 text-sm"
          >
            ← Volver
          </button>
          <h1 className="text-4xl font-bold mb-2">{playlist.name}</h1>
          <div className="flex gap-4 text-gray-400">
            <p>📅 {new Date(playlist.createdAt).toLocaleDateString('es-ES')}</p>
            <p>🎵 {playlist.tracks.length} canciones</p>
          </div>
        </div>

        {/* Tracks */}
        <div className="space-y-2">
          {playlist.tracks.map((track, index) => (
            <TrackCard
              key={track.id}
              track={track}
              index={index + 1}
              isFavorite={favoriteIds.has(track.id)}
              onRemove={() => handleRemoveTrack(track.id)}
              onToggleFavorite={() => handleToggleFavorite(track)}
              isPlayingPreview={playingPreview === track.id}
              onTogglePreview={() => togglePreview(track.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}