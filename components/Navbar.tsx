'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store';

export default function Navbar() {
  const { currentUser, logout } = useAuthStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Kosova<span className="text-rose-500">Prona</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              Kryefaqja
            </Link>
            {currentUser && (
              <Link href="/create-listing" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Shto Pronë
              </Link>
            )}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-sm">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline">{currentUser.fullName.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Dil
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Hyr
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Regjistrohu
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link
            href="/"
            className="block text-gray-700 font-medium py-2"
            onClick={() => setMenuOpen(false)}
          >
            Kryefaqja
          </Link>
          {currentUser && (
            <Link
              href="/create-listing"
              className="block text-gray-700 font-medium py-2"
              onClick={() => setMenuOpen(false)}
            >
              Shto Pronë
            </Link>
          )}
          {currentUser ? (
            <>
              <Link
                href="/profile"
                className="block text-gray-700 font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Profili im — {currentUser.fullName}
              </Link>
              <button
                onClick={handleLogout}
                className="block text-red-500 font-medium py-2 w-full text-left"
              >
                Dil
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="block text-gray-700 font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Hyr
              </Link>
              <Link
                href="/auth/register"
                className="block bg-rose-500 text-white font-medium py-2 px-4 rounded-lg text-center"
                onClick={() => setMenuOpen(false)}
              >
                Regjistrohu
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
