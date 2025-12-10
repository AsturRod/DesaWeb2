// Funciones para hacer peticiones a la API de Spotify

import { getAccessToken, getRefreshToken } from '@/lib/auth';



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



export async function getCurrentUser() {
  return spotifyRequest('/me');
}


export async function search(query, type = 'artist', limit = 10) {
  const params = new URLSearchParams({
    q: query,
    type: type,
    limit: limit
  });

  return spotifyRequest(`/search?${params.toString()}`);
}


export async function getArtist(artistId) {
  return spotifyRequest(`/artists/${artistId}`);
}


 
export async function getArtistTopTracks(artistId, market = 'US') {
  return spotifyRequest(`/artists/${artistId}/top-tracks?market=${market}`);
}


 
export async function getUserTopTracks(limit = 20, offset = 0, timeRange = 'medium_term') {
  const params = new URLSearchParams({
    limit: limit,
    offset: offset,
    time_range: timeRange
  });

  return spotifyRequest(`/me/top/tracks?${params.toString()}`);
}


 
export async function getUserTopArtists(limit = 20, offset = 0, timeRange = 'medium_term') {
  const params = new URLSearchParams({
    limit: limit,
    offset: offset,
    time_range: timeRange
  });

  return spotifyRequest(`/me/top/artists?${params.toString()}`);
}


export async function createPlaylist(playlistName, trackUris) {
  try {
    const user = await getCurrentUser();
    const userId = user.id;

   
    const createResponse = await spotifyRequest(`/users/${userId}/playlists`, {
      method: 'POST',
      body: JSON.stringify({
        name: playlistName,
        description: 'Playlist generada con Playlist Generator',
        public: false
      })
    });

    const playlistId = createResponse.id;

    
    for (let i = 0; i < trackUris.length; i += 100) {
      const chunk = trackUris.slice(i, i + 100);
      await spotifyRequest(`/playlists/${playlistId}/tracks`, {
        method: 'POST',
        body: JSON.stringify({ uris: chunk })
      });
    }

    return createResponse;
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
}

//Simular mood usando datos disponibles (popularity, duration, etc)
function simulateMoodFromTrackData(track, mood) {
  if (!mood) return true;

  const checks = [];

  // Energy simulado: basado en popularidad y duración
  if (mood.energy) {
    const [min, max] = mood.energy;
    const simulated_energy = (track.popularity / 100) * 0.7 + 
                            (Math.min(track.duration_ms, 300000) / 300000) * 0.3;
    checks.push(simulated_energy >= (min - 0.2) && simulated_energy <= (max + 0.2));
  }

  // Danceability simulado: canciones populares son más bailable
  if (mood.danceability) {
    const [min, max] = mood.danceability;
    const simulated_danceability = track.popularity / 100;
    checks.push(simulated_danceability >= (min - 0.2) && simulated_danceability <= (max + 0.2));
  }

  // Valence simulado: canciones recientes tienden a ser más positivas
  if (mood.valence) {
    const [min, max] = mood.valence;
    const year = new Date(track.album?.release_date).getFullYear();
    const simulated_valence = Math.min(1, (year - 1990) / 34) * 0.6 + (track.popularity / 100) * 0.4;
    checks.push(simulated_valence >= (min - 0.2) && simulated_valence <= (max + 0.2));
  }

  // Acousticness simulado: canciones antiguas y menos populares son más acústicas
  if (mood.acousticness) {
    const [min, max] = mood.acousticness;
    const year = new Date(track.album?.release_date).getFullYear();
    const simulated_acousticness = Math.max(0, 1 - (track.popularity / 100)) * 0.7 + 
                                  Math.max(0, (2024 - year) / 100) * 0.3;
    checks.push(simulated_acousticness >= (min - 0.2) && simulated_acousticness <= (max + 0.2));
  }

  if (checks.length === 0) return true;
  return checks.every(check => check);
}


export async function generatePlaylist(preferences) {
  const { artists = [], tracks = [], genres = [], decades = [], popularity = null, mood = null, market = 'ES' } = preferences;
  
  let allTracks = [];
  const selectedTrackIds = new Set(tracks.map(t => t.id));

  
  if (tracks.length > 0) {
    allTracks.push(...tracks);
  }

  
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
      }
    }
  }

  
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

  
  if (allTracks.length === 0 && genres.length === 0 && artists.length === 0) {
    throw new Error('Selecciona al menos un género, artista o canción');
  }

  
  if (decades.length > 0) {
    const beforeDecade = allTracks.length;
    const filteredByDecade = allTracks.filter(track => {
      if (selectedTrackIds.has(track.id)) {
        return true;
      }
      
      const year = new Date(track.album?.release_date).getFullYear();
      return decades.some(decade => {
        const decadeStart = parseInt(decade);
        return year >= decadeStart && year < decadeStart + 10;
      });
    });
    
  
    if (filteredByDecade.length >= 5) {
      allTracks = filteredByDecade;
      console.log(`Decade filter: ${beforeDecade} → ${allTracks.length} tracks`);
    } else {
      console.log(`Decade filter too restrictive (${filteredByDecade.length} tracks), ignoring`);
    }
  }

  
  if (popularity && popularity[0] > 0 || popularity[1] < 100) {
    const beforePopularity = allTracks.length;
    const [min, max] = popularity;
    const filteredByPopularity = allTracks.filter(track => {
      if (selectedTrackIds.has(track.id)) {
        return true;
      }
      
      return track.popularity >= min && track.popularity <= max;
    });
    
    
    if (filteredByPopularity.length >= 5) {
      allTracks = filteredByPopularity;
      console.log(`Popularity filter: ${beforePopularity} → ${allTracks.length} tracks`);
    } else {
      console.log(`Popularity filter too restrictive (${filteredByPopularity.length} tracks), ignoring`);
    }
  }

  
  if (mood) {
    const beforeMood = allTracks.length;
    const filteredByMood = allTracks.filter(track => {
      if (selectedTrackIds.has(track.id)) {
        return true;
      }
      return simulateMoodFromTrackData(track, mood);
    });
    
    // Solo aplicar filtro si quedan al menos 5 canciones
    if (filteredByMood.length >= 5) {
      allTracks = filteredByMood;
      console.log(`Mood filter (simulated): ${beforeMood} → ${allTracks.length} tracks`);
    } else {
      console.log(`Mood filter too restrictive (${filteredByMood.length} tracks), ignoring`);
    }
  }


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
    throw new Error('No se encontraron canciones con esos criterios. Intenta con otros filtros.');
  }

  return uniqueTracks;
}