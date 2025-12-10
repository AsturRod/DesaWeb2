'use client';

export default function TrackCard({
  track,
  index,
  isFavorite,
  onRemove,
  onToggleFavorite
}) {
  const durationMinutes = Math.floor(track.duration_ms / 60000);
  const durationSeconds = Math.floor((track.duration_ms % 60000) / 1000);
  const duration = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;

  const artistNames = track.artists.map(a => a.name).join(', ');

  const handleOpenInSpotify = () => {
    const spotifyUrl = `https://open.spotify.com/track/${track.id}`;
    window.open(spotifyUrl, '_blank');
  };

  return (
    <div className="bg-stone-800 hover:bg-gray-700 rounded p-4 flex items-center justify-between gap-4 transition group">
      {/* Imagen y detalles*/}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* número */}
        <span className="text-gray-500 font-semibold w-6 text-right">
          {index + 1}
        </span>

        {/* Imagen del album */}
        {track.album.images[0] && (
          <img
            src={track.album.images[0].url}
            alt={track.name}
            className="w-12 h-12 rounded flex-shrink-0"
          />
        )}

        {/* Detalles de la canción */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{track.name}</p>
          <p className="text-sm text-gray-400 truncate">{artistNames}</p>
        </div>
      </div>

      {/* Duración */}
      <div className="text-sm text-gray-400 flex-shrink-0 w-12 text-right">
        {duration}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Botón Abrir en Spotify - Logo PNG */}
        <button
          onClick={handleOpenInSpotify}
          className="p-2 rounded opacity-70 hover:opacity-100 transition hover:scale-110 transform"
          title="Abrir en Spotify"
        >
          <img
            src="/logo_1.png"
            alt="Spotify"
            className="w-5 h-5"
          />
        </button>

        {/* Botón Favoritos */}
        <button
          onClick={onToggleFavorite}
          className={`p-2 rounded transition ${
            isFavorite
              ? 'text-yellow-400 hover:text-yellow-300'
              : 'text-gray-500 hover:text-yellow-400'
          }`}
          title="Marcar como favorito"
        >
          {isFavorite ? '★' : '☆'}
        </button>

        {/* Botón eliminar*/}
        <button
          onClick={onRemove}
          className="p-2 rounded text-gray-500 hover:text-red-500 transition"
          title="Quitar canción"
        >
          ✕
        </button>
      </div>
    </div>
  );
}