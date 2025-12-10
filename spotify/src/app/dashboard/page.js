'use client';



import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getSpotifyAuthUrl, logout } from '@/lib/auth';
import { getCurrentUser, generatePlaylist, createPlaylist } from '@/lib/spotify';
import Header from '@/components/Header';
import MoodWidget from '@/components/widgets/MoodWidget';
import GenreWidget from '@/components/widgets/GenreWidget';
import PopularityWidget from '@/components/widgets/PopularityWidget';
import DecadeWidget from '@/components/widgets/DecadeWidget';
import ArtistWidget from '@/components/widgets/ArtistWidget';
import TrackWidget from '@/components/widgets/TrackWidget';
import PlaylistDisplay from '@/components/PlaylistDisplay';




export default function DashboardPage(){
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);




  //Estado de los widgets
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedPopularity, setSelectedPopularity] = useState([0, 100]);
  const [selectedDecades, setSelectedDecades] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);




  //Estado de la playlist generada
  const [playlist, setPlaylist] = useState([]);
  const [generatingPlaylist, setGeneratingPlaylist] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('Mi Playlist Generada');
  const [savingPlaylist, setSavingPlaylist] = useState(false);




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
      // Guardar en localStorage para acceso en otras páginas
      localStorage.setItem('spotify_user', JSON.stringify(userData));
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
    } catch (err) {
      console.error('Error generando la playlist:', err);
      setError('Error al generar la playlist');
    } finally {
      setGeneratingPlaylist(false);
    }
  }




  //Guardar playlist en Spotify
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
        createdAt: new Date().toISOString(),
        spotifyUrl: null
      };
      history.push(playlistEntry);
      localStorage.setItem('playlist_history', JSON.stringify(history));
      
      setError(null);
      setShowSaveModal(false);
      setPlaylistName('Mi Playlist Generada');
      // Mostrar mensaje de éxito
      alert(`✅ Playlist "${playlistName}" guardada en Spotify!`);
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
          <div className="lg:col-span-1 space-y-4 max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Preferencias</h2>




            {/* Mood Widget */}
            <MoodWidget
              selectedMood={selectedMood}
              onMoodChange={setSelectedMood}
            />




            {/* Artist Widget */}
            <ArtistWidget
              selectedArtists={selectedArtists}
              onArtistsChange={setSelectedArtists}
            />




            {/* Track Widget */}
            <TrackWidget
              selectedTracks={selectedTracks}
              onTracksChange={setSelectedTracks}
            />




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




            {/* Decade Widget */}
            <DecadeWidget
              onDecadesChange={setSelectedDecades}
            />




            {/* Botón generate */}
            <button
              onClick={handleGeneratePlaylist}
              disabled={generatingPlaylist || (selectedGenres.length === 0 && selectedArtists.length === 0 && selectedTracks.length === 0)}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-3 px-4 rounded-lg transition sticky bottom-0"
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
              onSave={playlist.length > 0 ? () => setShowSaveModal(true) : null}
            />
          </div>
        </div>
      </div>




      {/* Modal de Guardar Playlist */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-2xl font-bold mb-4">Guardar Playlist</h3>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Nombre de la playlist"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePlaylist}
                disabled={savingPlaylist}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-black font-bold py-2 px-4 rounded transition"
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