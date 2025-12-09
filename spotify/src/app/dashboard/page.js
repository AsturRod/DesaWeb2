'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getSpotifyAuthUrl, logout } from '@/lib/auth';
import { getCurrentUser, generatePlaylist } from '@/lib/spotify';
import Header from '@/components/Header';
import GenreWidget from '@/components/widgets/GenreWidget';
import PopularityWidget from '@/components/widgets/PopularityWidget';
import PlaylistDisplay from '@/components/PlaylistDisplay';

export default function DashboardPage(){
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //Estado de los widgets
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedPopularity, setSelectedPopularity] = useState([0, 100]);

  //Estado de la playlist generada
  const [playlist, setPlaylist] = useState([]);
  const [generatingPlaylist, setGeneratingPlaylist] = useState(false);

  //Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }

    //Cargar información del usuario
    fetchUser();
  }, [router]);

  async function fetchUser() {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Error obteniendo la información de usuario:', err);
      setError('Error al cargar información del usuario');
      //Redirigir al login en caso de error
      logout();
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  //Generar playlist basada en preferencias
  async function handleGeneratePlaylist() {
    setGeneratingPlaylist(true);
    try {
      const preferences = {
        artists: [],
        genres: selectedGenres,
        decades: [],
        popularity: selectedPopularity
      };

      const tracks = await generatePlaylist(preferences);
      setPlaylist(tracks);
    } catch (err) {
      console.error('Error generando la playlist:', err);
      setError('Error al generar la playlist');
    } finally {
      setGeneratingPlaylist(false);
    }
  }

  const handleRemoveTrack = (trackId) => {
    setPlaylist(playlist.filter(track => track.id !== trackId));
  };

  const handleToggleFavorite = (track) => {
    const favorites = JSON.parse(localStorage.getItem('favorite_tracks') || '[]');
    const isFavorite = favorites.find(f => f.id === track.id);

    if (isFavorite) {
      const updated = favorites.filter(f => f.id !== track.id);
      localStorage.setItem('favorite_tracks', JSON.stringify(updated));
    } else {
      favorites.push(track);
      localStorage.setItem('favorite_tracks', JSON.stringify(favorites));
    }
  };

  const handleRefreshPlaylist = async () => {
    await handleGeneratePlaylist();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-black text-white">
      {/* Header */}
      <Header user={user} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Widgets Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-2xl font-bold mb-6">Preferencias</h2>

            {/* Genre Widget */}
            <GenreWidget
              selectedGenres={selectedGenres}
              onGenresChange={setSelectedGenres}
            />

            {/* Popularity Widget */}
            <PopularityWidget
              selectedPopularity={selectedPopularity}
              onPopularityChange={setSelectedPopularity}
            />

            {/* Botón generate */}
            <button
              onClick={handleGeneratePlaylist}
              disabled={generatingPlaylist || selectedGenres.length === 0}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-3 px-4 rounded-lg transition"
            >
              {generatingPlaylist ? 'Generando...' : 'Generar Playlist'}
            </button>
          </div>

          {/* Display Playlist */}
          <div className="lg:col-span-3">
            <PlaylistDisplay
              tracks={playlist}
              onRemoveTrack={handleRemoveTrack}
              onToggleFavorite={handleToggleFavorite}
              onRefresh={handleRefreshPlaylist}
              isRefreshing={generatingPlaylist}
            />
          </div>
        </div>
      </div>
    </div>
  );
}