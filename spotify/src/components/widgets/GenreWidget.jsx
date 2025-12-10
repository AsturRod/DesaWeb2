'use client';

import { useState } from 'react';

const AVAILABLE_GENRES = [
  'acoustic', 'afrobeat', 'alt-rock', 'alternative', 'ambient',
  'anime', 'black-metal', 'bluegrass', 'blues', 'bossanova',
  'brazil', 'breakbeat', 'british', 'cantopop', 'celtic', 'chicago-house',
  'children', 'chill', 'classical', 'club', 'comedy',
  'country', 'dance', 'dancehall', 'death-metal', 'deep-house',
  'detroit-techno', 'disco', 'disney', 'drum-and-bass', 'dub',
  'dubstep', 'edm', 'electro', 'electronic', 'emo',
  'folk', 'forro', 'french', 'funk', 'garage',
  'german', 'gospel', 'goth', 'grindcore', 'groove',
  'grunge', 'guitar', 'happy', 'hard-rock', 'hardcore',
  'hardstyle', 'heavy-metal', 'hip-hop', 'house', 'idm',
  'indian', 'indie', 'indie-pop', 'industrial', 'iranian',
  'j-dance', 'j-idol', 'j-pop', 'j-rock', 'jazz',
  'k-pop', 'kids', 'latin', 'latino', 'malay',
  'mandopop', 'metal', 'metal-misc', 'metalcore', 'minimal-techno',
  'movies', 'mpb', 'new-age', 'new-release', 'opera',
  'pagode', 'party', 'philippines-opm', 'piano', 'pop',
  'pop-film', 'post-dubstep', 'power-pop', 'progressive-house', 'psych-rock',
  'punk', 'punk-rock', 'r-n-b', 'rainy-day', 'reggae',
  'reggaeton', 'road-trip', 'rock', 'rock-n-roll', 'rockabilly',
  'romance', 'sad', 'salsa', 'samba', 'sertanejo',
  'show-tunes', 'singer-songwriter', 'ska', 'sleep', 'songwriter',
  'soul', 'soundtracks', 'spanish', 'study', 'summer',
  'swedish', 'synth-pop', 'tango', 'techno', 'trance',
  'trip-hop', 'turkish', 'work-out', 'world-music'
];

export default function GenreWidget({ selectedGenres, onGenresChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGenres = AVAILABLE_GENRES.filter(genre =>
    genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenreClick = (genre) => {
    if (selectedGenres.includes(genre)) {
      onGenresChange(selectedGenres.filter(g => g !== genre));
    } else {
      
      if (selectedGenres.length < 5) {
        onGenresChange([...selectedGenres, genre]);
      }
    }
  };

  return (
    <div className=" border-gray-700 rounded-lg overflow-hidden hover:border-green-500/50 transition">
      {/* Header - Desplegable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/50 transition"
      >
        <div className="text-left">
          <h3 className="font-semibold text-white">🎸 Géneros</h3>
          {selectedGenres.length > 0 && (
            <p className="text-xs text-green-400 mt-1">
              {selectedGenres.length} seleccionado{selectedGenres.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <span className={`text-xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

    
      {isOpen && (
        <div className="border-t border-gray-700 p-4 space-y-3">
          
          {selectedGenres.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Seleccionados ({selectedGenres.length}/5)
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedGenres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => handleGenreClick(genre)}
                    className="bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black text-sm px-3 py-1 rounded-full font-semibold transition transform hover:scale-105 flex items-center gap-1"
                  >
                    {genre}
                    <span className="ml-1 font-bold">×</span>
                  </button>
                ))}
              </div>
              <div className="h-px bg-gray-700 my-2"></div>
            </div>
          )}

          {/* Search Input */}
          <input
            type="text"
            placeholder="🔍 Buscar géneros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-white rounded border border-gray-600 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition text-sm"
            autoFocus
          />

          {/* Genre List - Grid */}
          {filteredGenres.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
              {filteredGenres.map(genre => (
                <button
                  key={genre}
                  onClick={() => handleGenreClick(genre)}
                  disabled={selectedGenres.length >= 5 && !selectedGenres.includes(genre)}
                  className={`px-3 py-2 rounded text-sm font-medium transition transform ${
                    selectedGenres.includes(genre)
                      ? 'bg-green-500 text-black scale-105'
                      : selectedGenres.length >= 5
                      ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed opacity-50'
                      : 'bg-stone-800 text-white hover:bg-gray-600 hover:scale-105'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4 text-sm">
              No se encontraron géneros
            </p>
          )}

          {/* Info */}
          {selectedGenres.length >= 5 && (
            <p className="text-xs text-yellow-400 text-center">
              ⚠️ Máximo 5 géneros alcanzado
            </p>
          )}
        </div>
      )}
    </div>
  );
}