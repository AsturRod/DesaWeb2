'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import Link from 'next/link';

export default function Header({ user }) {
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <header className="bg-stone-950  sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          <span className="text-xl font-bold text-green-500">Spotify Taste Mixer</span>
        </Link>

        {/* User Info & Logout */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              {user.images && user.images[0] && (
                <img
                  src={user.images[0].url}
                  alt={user.display_name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-semibold">{user.display_name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}