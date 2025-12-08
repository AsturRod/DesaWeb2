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
 
export async function getArtistTopTracks(artistId, market = 'ES') {
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

//Generar playlist basada en preferencias
export async function generatePlaylist(preferences) {
  const { artists = [], genres = [], decades = [], popularity = null } = preferences;
  
  let allTracks = [];

  // 1. Obtener top tracks de artistas seleccionados
  for (const artist of artists) {
    try {
      const response = await spotifyRequest(`/artists/${artist.id}/top-tracks?market=US`);
      allTracks.push(...response.tracks);
    } catch (error) {
      console.error(`Error fetching tracks for artist ${artist.id}:`, error);
    }
  }

  // 2. Buscar por géneros
  for (const genre of genres) {
    try {
      const response = await spotifyRequest(`/search?type=track&q=genre:${genre}&limit=20`);
      allTracks.push(...response.tracks.items);
    } catch (error) {
      console.error(`Error searching for genre ${genre}:`, error);
    }
  }

  // 3. Filtrar por década
  if (decades.length > 0) {
    allTracks = allTracks.filter(track => {
      const year = new Date(track.album.release_date).getFullYear();
      return decades.some(decade => {
        const decadeStart = parseInt(decade);
        return year >= decadeStart && year < decadeStart + 10;
      });
    });
  }

  // 4. Filtrar por popularidad
  if (popularity) {
    const [min, max] = popularity;
    allTracks = allTracks.filter(
      track => track.popularity >= min && track.popularity <= max
    );
  }

  // 5. Eliminar duplicados y limitar a 30 canciones
  const uniqueTracks = Array.from(
    new Map(allTracks.map(track => [track.id, track])).values()
  ).slice(0, 30);

  return uniqueTracks;
}
