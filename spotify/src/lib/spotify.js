// Funciones para hacer peticiones a la API de Spotify


import { getAccessToken, getRefreshToken } from '@/lib/auth';



//Refrescar el token si está expirado


async function ensureValidToken() {
  const token = getAccessToken();
  
  if (!token) {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No authentication token available');
    }


    try {
      const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });


      if (!response.ok) {
        throw new Error('Token refresh failed');
      }


      const data = await response.json();
      localStorage.setItem('spotify_token', data.access_token);
      const expirationTime = Date.now() + (data.expires_in * 1000);
      localStorage.setItem('spotify_token_expiration', expirationTime.toString());


      return data.access_token;
    } catch (error) {
      console.error('Token refresh error:', error);
      localStorage.clear();
      window.location.href = '/';
      throw error;
    }
  }


  return token;
}



//Hacer una petición a la API de Spotify
 
export async function spotifyRequest(endpoint, options = {}) {
  try {
    const token = await ensureValidToken();
    const url = `https://api.spotify.com/v1${endpoint}`;


    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });


    if (response.status === 401) {
      // Token expirado, intentar refrescar
      const newToken = await ensureValidToken();
      return spotifyRequest(endpoint, {
        ...options,
        headers: { ...options.headers, 'Authorization': `Bearer ${newToken}` }
      });
    }


    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Spotify API error: ${response.status} ${JSON.stringify(error)}`);
    }


    return await response.json();
  } catch (error) {
    console.error('Spotify request error:', error);
    throw error;
  }
}



//Obtener información del usuario actual


export async function getCurrentUser() {
  return spotifyRequest('/me');
}



//Buscar artistas, canciones, etc.
export async function search(query, type = 'artist', limit = 10) {
  const params = new URLSearchParams({
    q: query,
    type: type,
    limit: limit
  });


  return spotifyRequest(`/search?${params.toString()}`);
}



//Obtener información de un artista
export async function getArtist(artistId) {
  return spotifyRequest(`/artists/${artistId}`);
}



//Obtener top tracks de un artista
 
export async function getArtistTopTracks(artistId, market = 'US') {
  return spotifyRequest(`/artists/${artistId}/top-tracks?market=${market}`);
}



//Obtener canciones top del usuario
 
export async function getUserTopTracks(limit = 20, offset = 0, timeRange = 'medium_term') {
  const params = new URLSearchParams({
    limit: limit,
    offset: offset,
    time_range: timeRange
  });


  return spotifyRequest(`/me/top/tracks?${params.toString()}`);
}



//Obtener artistas top del usuario
 
export async function getUserTopArtists(limit = 20, offset = 0, timeRange = 'medium_term') {
  const params = new URLSearchParams({
    limit: limit,
    offset: offset,
    time_range: timeRange
  });


  return spotifyRequest(`/me/top/artists?${params.toString()}`);
}


//Obtener audio features de un track
export async function getAudioFeatures(trackIds) {
  const ids = Array.isArray(trackIds) ? trackIds.join(',') : trackIds;
  return spotifyRequest(`/audio-features?ids=${ids}`);
}


//Filtrar tracks por audio features
function filterByAudioFeatures(tracks, mood) {
  if (!mood) return tracks;

  return tracks.filter(track => {
    if (!track.audio_features) return true;

    const features = track.audio_features;
    const checks = [];

    if (mood.energy) {
      checks.push(features.energy >= mood.energy[0] && features.energy <= mood.energy[1]);
    }
    if (mood.valence) {
      checks.push(features.valence >= mood.valence[0] && features.valence <= mood.valence[1]);
    }
    if (mood.danceability) {
      checks.push(features.danceability >= mood.danceability[0] && features.danceability <= mood.danceability[1]);
    }
    if (mood.acousticness) {
      checks.push(features.acousticness >= mood.acousticness[0] && features.acousticness <= mood.acousticness[1]);
    }

    return checks.length === 0 || checks.every(check => check);
  });
}


//Generar playlist basada en preferencias - SIMPLIFICADO
export async function generatePlaylist(preferences) {
  const { artists = [], tracks = [], genres = [], decades = [], popularity = null, market = 'US', mood = null } = preferences;
  
  let allTracks = [];
  const selectedTrackIds = new Set(tracks.map(t => t.id));

  // 0. PRIORIDAD: Agregar canciones seleccionadas (NUNCA se filtran)
  if (tracks.length > 0) {
    allTracks.push(...tracks);
  }

  // 1. Obtener top tracks de artistas seleccionados
  for (const artist of artists) {
    try {
      const response = await spotifyRequest(`/artists/${artist.id}/top-tracks?market=${market}`);
      if (response.tracks) {
        allTracks.push(...response.tracks);
      }
    } catch (error) {
      console.error(`Error fetching tracks for artist ${artist.id}:`, error);
    }
  }

  // 2. Si hay géneros, buscar tracks
  if (genres.length > 0) {
    for (const genre of genres) {
      try {
        const searchQuery = `genre:"${genre}"`;
        const response = await spotifyRequest(`/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=20`);
        if (response.tracks && response.tracks.items) {
          allTracks.push(...response.tracks.items);
        }
      } catch (error) {
        console.warn(`Error searching for genre ${genre}:`, error);
        // Continuar con otros géneros si uno falla
      }
    }
  }

  // 3. Si no hay suficientes tracks, usar búsqueda genérica
  if (allTracks.length < 5 && (genres.length > 0 || artists.length > 0)) {
    try {
      const query = genres.length > 0 ? genres[0] : 'popular';
      const response = await spotifyRequest(`/search?q=${encodeURIComponent(query)}&type=track&limit=30`);
      if (response.tracks && response.tracks.items) {
        allTracks.push(...response.tracks.items);
      }
    } catch (error) {
      console.warn('Error with generic search:', error);
    }
  }

  // 4. Si no hay géneros ni artistas, error
  if (allTracks.length === 0 && genres.length === 0 && artists.length === 0) {
    throw new Error('Selecciona al menos un género, artista o canción');
  }

  // 5. Obtener audio features para filtrar por mood
  if (mood && allTracks.length > 0) {
    try {
      const trackIds = allTracks.filter(t => t.id).map(t => t.id).slice(0, 100);
      if (trackIds.length > 0) {
        const features = await getAudioFeatures(trackIds);
        
        allTracks = allTracks.map(track => {
          const feature = features.audio_features?.find(f => f?.id === track.id);
          return { ...track, audio_features: feature };
        });
      }
    } catch (error) {
      console.warn('Error fetching audio features:', error);
      // Continuar sin filtrar por mood si falla
    }
  }

  // 6. Filtrar por mood
  if (mood) {
    allTracks = filterByAudioFeatures(allTracks, mood);
  }

  // 7. Filtrar por década (EXCEPTO las canciones seleccionadas)
  if (decades.length > 0) {
    allTracks = allTracks.filter(track => {
      if (selectedTrackIds.has(track.id)) {
        return true;
      }
      
      const year = new Date(track.album?.release_date).getFullYear();
      return decades.some(decade => {
        const decadeStart = parseInt(decade);
        return year >= decadeStart && year < decadeStart + 10;
      });
    });
  }

  // 8. Filtrar por popularidad (EXCEPTO las canciones seleccionadas)
  if (popularity) {
    const [min, max] = popularity;
    allTracks = allTracks.filter(track => {
      if (selectedTrackIds.has(track.id)) {
        return true;
      }
      
      return track.popularity >= min && track.popularity <= max;
    });
  }

  // 9. Eliminar duplicados y limitar a 30 canciones
  const uniqueMap = new Map();
  
  for (const track of tracks) {
    uniqueMap.set(track.id, track);
  }
  
  for (const track of allTracks) {
    if (!uniqueMap.has(track.id)) {
      uniqueMap.set(track.id, track);
    }
  }
  
  const uniqueTracks = Array.from(uniqueMap.values()).slice(0, 30);

  if (uniqueTracks.length === 0) {
    throw new Error('No se encontraron canciones con esos criterios');
  }

  return uniqueTracks;
}