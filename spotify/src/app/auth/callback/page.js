'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveTokens } from '@/lib/auth';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevenir ejecución duplicada
    if (hasProcessed.current) return;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Autenticación cancelada');
      setLoading(false);
      return;
    }

    if (!code) {
      setError('No se recibió código de autorización');
      setLoading(false);
      return;
    }

    //Usamos sessionStorage en lugar de localStorage
    const savedState = sessionStorage.getItem('spotify_auth_state');
    if (!state || state !== savedState) {
      setError('Error de validación de seguridad (CSRF). Intenta iniciar sesión de nuevo.');
      sessionStorage.removeItem('spotify_auth_state'); 
      setLoading(false);
      return;
    }

    // Limpiar state después de validar
    sessionStorage.removeItem('spotify_auth_state');

    // Marcar como procesado
    hasProcessed.current = true;

    // Intercambiar código por token
    const exchangeCodeForToken = async (code) => {
      try {
        const response = await fetch('/api/spotify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al obtener token');
        }

        // Guardar tokens
        saveTokens(data.access_token, data.refresh_token, data.expires_in);

        // Redirigir al dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    exchangeCodeForToken(code);
  }, [searchParams, router]);

  /*Renderizado
  Muestra estados de carga y error con un diseño similar a spotify con un gradiente verde y negro.*/
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-2">Autenticando...</h1>
          <p className="text-gray-400">
            Por favor espera mientras completamos tu autenticación con Spotify
          </p>
        </div>
      </div>
    );
  }

  /*En caso de fallo en la autenticación mostrara un error con un botón de vuelta al login*/
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-900 border border-red-700 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-red-300 mb-2">❌ Error de Autenticación</h2>
            <p className="text-red-200 mb-4">{error}</p>
          </div>
          <a
            href="/"
            className="inline-block bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-6 rounded-lg transition duration-200"
          >
            Volver a Login
          </a>
        </div>
      </div>
    );
  }
}
