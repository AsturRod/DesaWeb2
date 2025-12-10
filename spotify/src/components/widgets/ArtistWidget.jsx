'use client';

import { useState, useRef, useEffect } from 'react';
import { search } from '@/lib/spotify';

export default function ArtistWidget({ selectedArtists = [], onArtistsChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Buscar artistas mientras el user escribe
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
        const response = await search(searchTerm, 'artist', 10);
        setSearchResults(response.artists.items || []);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching artists:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm]);

  // Agregar artista a seleccionados
  const handleSelectArtist = (artist) => {
    const isSelected = selectedArtists.some(a => a.id === artist.id);
    
    if (!isSelected) {
      onArtistsChange([...selectedArtists, artist]);
    }
    
    setSearchTerm('');
    setShowResults(false);
  };

  // Remover artista de seleccionados
  const handleRemoveArtist = (artistId) => {
    onArtistsChange(selectedArtists.filter(a => a.id !== artistId));
  };

  return (
    <div className=" p-4">
      <h3 className="text-lg font-semibold mb-3">🎤 Artistas</h3>

      {/* Input de búsqueda */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Buscar artista..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 rounded border border-gray-600 focus:outline-none"
        />

        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Dropdown de resultados */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-stone-800 rounded mt-1 max-h-48 overflow-y-auto z-10">
            {searchResults.map((artist) => (
              <button
                key={artist.id}
                onClick={() => handleSelectArtist(artist)}
                className="w-full text-left px-3 py-2 hover:bg-stone-600 border-b border-gray-600 last:border-b-0 flex items-center gap-2"
              >
                {artist.images?.[0] && (
                  <img 
                    src={artist.images[0].url} 
                    alt={artist.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <div className="text-sm font-medium">{artist.name}</div>
                  <div className="text-xs text-gray-400">{artist.followers?.total.toLocaleString() || 0} followers</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Artistas seleccionados */}
      {selectedArtists.length > 0 && (
        <div className="space-y-2">
          {selectedArtists.map((artist) => (
            <div
              key={artist.id}
              className="flex items-center justify-between bg-stone-800 p-2 rounded"
            >
              <div className="flex items-center gap-2">
                {artist.images?.[0] && (
                  <img 
                    src={artist.images[0].url} 
                    alt={artist.name}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="text-sm">{artist.name}</span>
              </div>
              <button
                onClick={() => handleRemoveArtist(artist.id)}
                className="text-gray-400 hover:text-red-500 text-sm font-semibold"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="text-xs text-gray-400 mt-2">
            Seleccionados ({selectedArtists.length})
          </div>
        </div>
      )}
    </div>
  );
}
