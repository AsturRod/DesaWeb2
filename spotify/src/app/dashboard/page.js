'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, logout } from '@/lib/auth';
import { getCurrentUser, generatePlaylist, createPlaylist } from '@/lib/spotify';
import Header from '@/components/Header';
import MoodWidget from '@/components/widgets/MoodWidget';
import GenreWidget from '@/components/widgets/GenreWidget';
import PopularityWidget from '@/components/widgets/PopularityWidget';
import DecadeWidget from '@/components/widgets/DecadeWidget';
import ArtistWidget from '@/components/widgets/ArtistWidget';
import TrackWidget from '@/components/widgets/TrackWidget';
import PlaylistDisplay from '@/components/PlaylistDisplay';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado de los widgets
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedPopularity, setSelectedPopularity] = useState([0, 100]);
  const [selectedDecades, setSelectedDecades] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);

  // Estado de la playlist generada
  const [playlist, setPlaylist] = useState([]);
  const [generatingPlaylist, setGeneratingPlaylist] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('Mi Playlist Generada');
  const [savingPlaylist, setSavingPlaylist] = useState(false);
  const [showWidgetsSidebar, setShowWidgetsSidebar] = useState(false);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }

    fetchUser();
  }, [router]);

  async function fetchUser() {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      localStorage.setItem('spotify_user', JSON.stringify(userData));
    } catch (err) {
      console.error('Error obteniendo la información de usuario:', err);
      setError('Error al cargar información del usuario');
      logout();
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  // Generar playlist basada en preferencias
  async function handleGeneratePlaylist() {
    setGeneratingPlaylist(true);
    setError(null);
    try {
      const preferences = {
        artists: selectedArtists,
        tracks: selectedTracks,
        genres: selectedGenres,
        decades: selectedDecades,
        popularity: selectedPopularity,
        market: 'US',
        mood: selectedMood
      };

      const tracks = await generatePlaylist(preferences);
      setPlaylist(tracks);
      setShowWidgetsSidebar(false); // Cerrar sidebar en mobile después de generar
    } catch (err) {
      console.error('Error generando la playlist:', err);
      setError('Error al generar la playlist: ' + err.message);
    } finally {
      setGeneratingPlaylist(false);
    }
  }

  // Guardar playlist en Spotify
  async function handleSavePlaylist() {
    if (!playlistName.trim()) {
      setError('Por favor ingresa un nombre para la playlist');
      return;
    }

    setSavingPlaylist(true);
    setError(null);
    try {
      const trackUris = playlist.map(track => `spotify:track:${track.id}`);
      await createPlaylist(playlistName, trackUris);

      // Guardar en historial
      const history = JSON.parse(localStorage.getItem('playlist_history') || '[]');
      const playlistEntry = {
        id: Date.now().toString(),
        name: playlistName,
        tracks: playlist,
        createdAt: new Date().toISOString()
      };
      history.push(playlistEntry);
      localStorage.setItem('playlist_history', JSON.stringify(history));

      setError(null);
      setShowSaveModal(false);
      setPlaylistName('Mi Playlist Generada');
      alert(`Playlist "${playlistName}" guardada en Spotify!`);
    } catch (err) {
      console.error('Error guardando playlist:', err);
      setError('Error al guardar la playlist en Spotify');
    } finally {
      setSavingPlaylist(false);
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
      <div className="min-h-screen bg-linear-to-br from-green-900 via-black to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-900 via-black to-black text-white">
      
      <Header user={user} />

      
      <main className="w-full px-4 md:px-6 lg:px-8 py-6 md:py-8">
        
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg animate-pulse">
            <p className="font-semibold">⚠️ Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        
        <div className="hidden lg:grid lg:grid-cols-4 gap-6">
          
          <div className="lg:col-span-1 space-y-4">
            <div className="sticky top-20 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
              <h2 className="text-2xl font-bold text-white ">Preferencias</h2>

              <MoodWidget
                selectedMood={selectedMood}
                onMoodChange={setSelectedMood}
              />

              <ArtistWidget
                selectedArtists={selectedArtists}
                onArtistsChange={setSelectedArtists}
              />

              <TrackWidget
                selectedTracks={selectedTracks}
                onTracksChange={setSelectedTracks}
              />

              <GenreWidget
                selectedGenres={selectedGenres}
                onGenresChange={setSelectedGenres}
              />

              <PopularityWidget
                selectedPopularity={selectedPopularity}
                onPopularityChange={setSelectedPopularity}
              />

              <DecadeWidget
                onDecadesChange={setSelectedDecades}
              />

              <button
                onClick={handleGeneratePlaylist}
                disabled={
                  generatingPlaylist ||
                  (selectedGenres.length === 0 &&
                    selectedArtists.length === 0 &&
                    selectedTracks.length === 0)
                }
                className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-bold py-3 px-4 rounded-lg transition transform hover:scale-105"
              >
                {generatingPlaylist ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                    Generando...
                  </span>
                ) : (
                  '▶️ Generar Playlist'
                )}
              </button>
            </div>
          </div>

          {/* Playlist Display - Desktop (col-span-3) */}
          <div className="lg:col-span-3">
            <PlaylistDisplay
              tracks={playlist}
              onRemoveTrack={handleRemoveTrack}
              onToggleFavorite={handleToggleFavorite}
              onRefresh={handleRefreshPlaylist}
              isRefreshing={generatingPlaylist}
              onSave={playlist.length > 0 ? () => setShowSaveModal(true) : null}
            />
          </div>
        </div>

       
        <div className="lg:hidden space-y-6">
          
          <button
            onClick={() => setShowWidgetsSidebar(!showWidgetsSidebar)}
            className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-bold py-3 px-4 rounded-lg transition flex items-center justify-between md:hidden"
          >
            <span>⚙️ Preferencias</span>
            <span className="text-xl">{showWidgetsSidebar ? '▼' : '▶'}</span>
          </button>

          
          {showWidgetsSidebar && (
            <div className="space-y-4 md:hidden bg-black/50 p-4 rounded-lg border border-green-500/30">
              <h2 className="text-xl font-bold">🎵 Preferencias</h2>

              <MoodWidget
                selectedMood={selectedMood}
                onMoodChange={setSelectedMood}
              />

              <ArtistWidget
                selectedArtists={selectedArtists}
                onArtistsChange={setSelectedArtists}
              />

              <TrackWidget
                selectedTracks={selectedTracks}
                onTracksChange={setSelectedTracks}
              />

              <GenreWidget
                selectedGenres={selectedGenres}
                onGenresChange={setSelectedGenres}
              />

              <PopularityWidget
                selectedPopularity={selectedPopularity}
                onPopularityChange={setSelectedPopularity}
              />

              <DecadeWidget
                onDecadesChange={setSelectedDecades}
              />

              <button
                onClick={handleGeneratePlaylist}
                disabled={
                  generatingPlaylist ||
                  (selectedGenres.length === 0 &&
                    selectedArtists.length === 0 &&
                    selectedTracks.length === 0)
                }
                className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-bold py-3 px-4 rounded-lg transition transform hover:scale-105"
              >
                {generatingPlaylist ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                    Generando...
                  </span>
                ) : (
                  '▶️ Generar Playlist'
                )}
              </button>
            </div>
          )}

          
          <div className="hidden md:grid md:grid-cols-2 lg:hidden gap-4">
            <MoodWidget
              selectedMood={selectedMood}
              onMoodChange={setSelectedMood}
            />

            <ArtistWidget
              selectedArtists={selectedArtists}
              onArtistsChange={setSelectedArtists}
            />

            <TrackWidget
              selectedTracks={selectedTracks}
              onTracksChange={setSelectedTracks}
            />

            <GenreWidget
              selectedGenres={selectedGenres}
              onGenresChange={setSelectedGenres}
            />

            <PopularityWidget
              selectedPopularity={selectedPopularity}
              onPopularityChange={setSelectedPopularity}
            />

            <DecadeWidget
              onDecadesChange={setSelectedDecades}
            />

            <button
              onClick={handleGeneratePlaylist}
              disabled={
                generatingPlaylist ||
                (selectedGenres.length === 0 &&
                  selectedArtists.length === 0 &&
                  selectedTracks.length === 0)
              }
              className="md:col-span-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-bold py-3 px-4 rounded-lg transition transform hover:scale-105"
            >
              {generatingPlaylist ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                  Generando...
                </span>
              ) : (
                '▶️ Generar Playlist'
              )}
            </button>
          </div>

          
          <div>
            <PlaylistDisplay
              tracks={playlist}
              onRemoveTrack={handleRemoveTrack}
              onToggleFavorite={handleToggleFavorite}
              onRefresh={handleRefreshPlaylist}
              isRefreshing={generatingPlaylist}
              onSave={playlist.length > 0 ? () => setShowSaveModal(true) : null}
            />
          </div>
        </div>
      </main>

      
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-lg p-6 w-full max-w-md border border-green-500/30 shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              💾 Guardar Playlist
            </h3>

            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Nombre de la playlist"
              className="w-full px-4 py-3 rounded bg-gray-700/50 text-white border border-gray-600 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 mb-6 transition"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition transform hover:scale-105"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePlaylist}
                disabled={savingPlaylist || !playlistName.trim()}
                className="flex-1 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-bold py-2 px-4 rounded-lg transition transform hover:scale-105"
              >
                {savingPlaylist ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}