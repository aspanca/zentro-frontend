'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore, usePaymentStore, useWishlistStore } from '@/lib/store';

export default function Navbar() {
  const { currentUser, logout } = useAuthStore();
  const { credits } = usePaymentStore();
  const { ids: wishlistIds } = useWishlistStore();
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
              Zen<span className="text-rose-500">tro</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              Kryefaqja
            </Link>
            {/* Wishlist icon */}
            <Link href="/wishlist" className="relative text-gray-500 hover:text-rose-500 transition-colors" title="Lista e dëshirave">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
            {currentUser && (
              <>
                <Link href="/my-properties" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                  Pronat e mia
                </Link>
                <Link href="/create-listing" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                  Shto Pronë
                </Link>
              </>
            )}
            {/* Credits badge */}
            {currentUser && credits > 0 && (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.077 2.353 1.229V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.228V5z" clipRule="evenodd" />
                </svg>
                {credits} {credits === 1 ? 'kredi' : 'kredi'}
              </div>
            )}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-sm flex-shrink-0">
                    {currentUser.avatar ? (
                      <Image src={currentUser.avatar} alt={currentUser.name ?? ''} width={32} height={32} className="object-cover w-full h-full" />
                    ) : (
                      currentUser.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="hidden lg:inline">{currentUser.name?.split(' ')[0]}</span>
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
          <Link
            href="/wishlist"
            className="flex items-center gap-2 text-gray-700 font-medium py-2"
            onClick={() => setMenuOpen(false)}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Lista e dëshirave
            {wishlistIds.length > 0 && (
              <span className="bg-rose-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{wishlistIds.length}</span>
            )}
          </Link>
          {currentUser && (
            <>
              <Link
                href="/my-properties"
                className="block text-gray-700 font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Pronat e mia
              </Link>
              <Link
                href="/create-listing"
                className="block text-gray-700 font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Shto Pronë
              </Link>
            </>
          )}
          {currentUser ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-3 text-gray-700 font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-sm flex-shrink-0">
                  {currentUser.avatar ? (
                    <Image src={currentUser.avatar} alt={currentUser.name ?? ''} width={32} height={32} className="object-cover w-full h-full" />
                  ) : (
                    currentUser.name?.charAt(0).toUpperCase()
                  )}
                </div>
                Profili im — {currentUser.name}
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
