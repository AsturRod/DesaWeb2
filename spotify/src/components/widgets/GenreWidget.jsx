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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGenres = AVAILABLE_GENRES.filter(genre =>
    genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenreClick = (genre) => {
    if (selectedGenres.includes(genre)) {
      onGenresChange(selectedGenres.filter(g => g !== genre));
    } else {
      // Limitar a 5 géneros máximo
      if (selectedGenres.length < 5) {
        onGenresChange([...selectedGenres, genre]);
      }
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Géneros</h3>

      {/* Search */}
      <input
        type="text"
        placeholder="Buscar géneros..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border border-gray-700 rounded px-3 py-2 text-white mb-4 placeholder-gray-500"
      />

      {/* Selected Genres */}
      {selectedGenres.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">
            Seleccionados ({selectedGenres.length}/5)
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedGenres.map(genre => (
              <button
                key={genre}
                onClick={() => handleGenreClick(genre)}
                className="bg-green-500 text-black text-sm px-3 py-1 rounded-full hover:bg-green-600 transition"
              >
                {genre} ×
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Genre List */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {filteredGenres.map(genre => (
          <button
            key={genre}
            onClick={() => handleGenreClick(genre)}
            className={`w-full text-left px-3 py-2 rounded transition ${
              selectedGenres.includes(genre)
                ? 'bg-green-500 text-black'
                : 'bg-stone-800 text-white hover:bg-gray-700'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {filteredGenres.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          No se encontraron géneros
        </p>
      )}
    </div>
  );
}