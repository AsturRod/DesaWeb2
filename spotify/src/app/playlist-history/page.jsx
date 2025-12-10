'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function PlaylistHistoryPage() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Cargar historial del localStorage
    const storedHistory = JSON.parse(localStorage.getItem('playlist_history') || '[]');
    setPlaylists(storedHistory.reverse()); // Más recientes primero

    // Cargar usuario del localStorage
    const userData = localStorage.getItem('spotify_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleDeletePlaylist = (playlistId) => {
    const updated = playlists.filter(p => p.id !== playlistId);
    setPlaylists(updated);
    localStorage.setItem('playlist_history', JSON.stringify(updated));
  };

  const handleViewDetails = (playlist) => {
    // Guardar en sessionStorage para verlo en detalle
    sessionStorage.setItem('playlist_details', JSON.stringify(playlist));
    router.push(`/playlist/${playlist.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-black text-white">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📻 Historial de Playlists</h1>
          <p className="text-gray-400">
            {playlists.length} playlist{playlists.length !== 1 ? 's' : ''} generada{playlists.length !== 1 ? 's' : ''}
          </p>
        </div>

        {playlists.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">No tienes historial aún</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-6 rounded transition"
            >
              Crear tu primera playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition cursor-pointer"
                onClick={() => handleViewDetails(playlist)}
              >
                <h3 className="text-xl font-bold mb-2 truncate">{playlist.name}</h3>
                <p className="text-gray-400 text-sm mb-4">
                  📅 {new Date(playlist.createdAt).toLocaleDateString('es-ES')}
                </p>
                <p className="text-gray-300 mb-4">
                  🎵 {playlist.tracks.length} canciones
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(playlist);
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded text-sm transition"
                  >
                    Ver
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(playlist.id);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}