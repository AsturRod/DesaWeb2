'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getSpotifyAuthUrl } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = () => {
    window.location.href = getSpotifyAuthUrl();
  };

//Login principal
//Gradiente verde y negro
  return (
    <div className="min-h-screen bg-linear-to-br from-green-900 via-black to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🎵 Spotify Taste Mixer
        </h1>
        <p className="text-gray-300 mb-8">
          Inicia sesión con Spotify para generar playlists personalizadas.
        </p>
        <button
          onClick={handleLogin}
          className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-6 rounded-lg transition"
        >
          Login con Spotify
        </button>
      </div>
    </div>
  );
}
