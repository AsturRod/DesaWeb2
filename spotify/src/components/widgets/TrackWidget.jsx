'use client';

import { useState, useRef, useEffect } from 'react';
import { search } from '@/lib/spotify';

export default function TrackWidget({ selectedTracks = [], onTracksChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Buscar canciones mientras el user escribe
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await search(searchTerm, 'track', 10);
        setSearchResults(response.tracks.items || []);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching tracks:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm]);

  // Agregar canción a seleccionadas
  const handleSelectTrack = (track) => {
    const isSelected = selectedTracks.some(t => t.id === track.id);
    
    if (!isSelected) {
      onTracksChange([...selectedTracks, track]);
    }
    
    setSearchTerm('');
    setShowResults(false);
  };

  // Eliminar canción de seleccionadas
  const handleRemoveTrack = (trackId) => {
    onTracksChange(selectedTracks.filter(t => t.id !== trackId));
  };

  return (
    <div className=" p-4">
      <h3 className="text-lg font-semibold mb-3">🎵 Canciones</h3>

      {/* Input de búsqueda */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Buscar canción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-white rounded border border-gray-600 focus:border-green-500 focus:outline-none"
        />

        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Dropdown de resultados */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-stone-800 rounded mt-1 max-h-48 overflow-y-auto z-10">
            {searchResults.map((track) => (
              <button
                key={track.id}
                onClick={() => handleSelectTrack(track)}
                className="w-full text-left px-3 py-2 hover:bg-stone-800 border-b border-gray-600 last:border-b-0 flex items-center gap-2"
              >
                {track.album?.images?.[0] && (
                  <img 
                    src={track.album.images[0].url} 
                    alt={track.name}
                    className="w-8 h-8 rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{track.name}</div>
                  <div className="text-xs text-gray-400 truncate">
                    {track.artists.map(a => a.name).join(', ')}
                  </div>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">
                  {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Canciones seleccionadas */}
      {selectedTracks.length > 0 && (
        <div className="space-y-2">
          {selectedTracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between bg-stone-800 p-2 rounded text-sm"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {track.album?.images?.[0] && (
                  <img 
                    src={track.album.images[0].url} 
                    alt={track.name}
                    className="w-6 h-6 rounded flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <div className="truncate font-medium">{track.name}</div>
                  <div className="text-xs text-gray-400 truncate">
                    {track.artists.map(a => a.name).join(', ')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemoveTrack(track.id)}
                className="text-gray-400 hover:text-red-500 font-semibold flex-shrink-0 ml-2"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="text-xs text-gray-400 mt-2">
            Seleccionadas ({selectedTracks.length})
          </div>
        </div>
      )}
    </div>
  );
}
