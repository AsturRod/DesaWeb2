'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

export default function Header({ user }) {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-black bg-opacity-80 border-b border-green-500 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo/Title */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-green-500">🎵 Playlist Generator</h1>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-300 hover:text-green-500 transition font-semibold"
          >
            🎚️ Generar
          </button>
          <button
            onClick={() => router.push('/favorites')}
            className="text-gray-300 hover:text-green-500 transition font-semibold"
          >
            ❤️ Favoritos
          </button>
          <button
            onClick={() => router.push('/playlist-history')}
            className="text-gray-300 hover:text-green-500 transition font-semibold"
          >
            📻 Historial
          </button>
        </nav>

        {/* User Info & Logout */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              {user.images && user.images[0] && (
                <img
                  src={user.images[0].url}
                  alt={user.display_name}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm font-semibold hidden sm:inline">
                {user.display_name}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition text-sm"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-700 px-4 py-3 flex gap-2 overflow-x-auto">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-300 hover:text-green-500 transition font-semibold whitespace-nowrap text-sm"
        >
          🎚️ Generar
        </button>
        <button
          onClick={() => router.push('/favorites')}
          className="text-gray-300 hover:text-green-500 transition font-semibold whitespace-nowrap text-sm"
        >
          ❤️ Favoritos
        </button>
        <button
          onClick={() => router.push('/playlist-history')}
          className="text-gray-300 hover:text-green-500 transition font-semibold whitespace-nowrap text-sm"
        >
          📻 Historial
        </button>
      </div>
    </header>
  );
}