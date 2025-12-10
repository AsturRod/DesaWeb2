
// Funciones auxiliares para OAuth y gestión de tokens



export function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


// Construir URL de autorización de Spotify
export function getSpotifyAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || '';
  const state = generateRandomString(16);


  
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('spotify_auth_state', state); 
  }


  const scope = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'playlist-modify-public',
    'playlist-modify-private'
  ].join(' ');


  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    state: state,
    scope: scope
  });


  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}



export function saveTokens(accessToken, refreshToken, expiresIn) {
  if (typeof window === 'undefined') return;


  const expirationTime = Date.now() + expiresIn * 1000;
  localStorage.setItem('spotify_token', accessToken);
  localStorage.setItem('spotify_refresh_token', refreshToken);
  localStorage.setItem('spotify_token_expiration', expirationTime.toString());
}



export function getAccessToken() {
  if (typeof window === 'undefined') return null;


  const token = localStorage.getItem('spotify_token');
  const expiration = localStorage.getItem('spotify_token_expiration');


  if (!token || !expiration) return null;


  
  if (Date.now() > parseInt(expiration)) {
    return null;
  }


  return token;
}



export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('spotify_refresh_token');
}



export function isAuthenticated() {
  return getAccessToken() !== null;
}



export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('spotify_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_token_expiration');
}