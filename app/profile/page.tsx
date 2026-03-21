'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, usePropertyStore } from '@/lib/store';
import PropertyCard from '@/components/PropertyCard';
import { formatPrice } from '@/lib/utils';

export default function ProfilePage() {
  const { currentUser, logout, _hasHydrated } = useAuthStore();
  const { properties } = usePropertyStore();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!currentUser) router.push('/auth/login');
  }, [currentUser, _hasHydrated, router]);

  if (!_hasHydrated || !currentUser) return null;

  const myProperties = properties.filter((p) => p.userId === currentUser.id);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 text-3xl font-bold mb-3">
                {currentUser.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{currentUser.name}</h2>
              <p className="text-sm text-gray-400 mt-1">{currentUser.email}</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full text-red-500 hover:bg-red-50 text-sm font-medium py-2.5 rounded-xl transition-colors"
            >
              Dil nga llogaria
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{myProperties.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Prona aktive</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-500">
                  {myProperties.length > 0
                    ? formatPrice(myProperties.reduce((s, p) => s + p.totalPrice, 0) / myProperties.length).split(' ')[0]
                    : '—'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Çmimi mesatar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Pronat e mia</h2>
            <Link
              href="/create-listing"
              className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Shto pronë
            </Link>
          </div>

          {myProperties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <p className="text-gray-900 font-semibold mb-1">Nuk ke prona ende</p>
              <p className="text-gray-500 text-sm mb-5">Shto pronën tënde të parë dhe fillo të shesësh.</p>
              <Link
                href="/create-listing"
                className="inline-block bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
              >
                Shto pronën tënde
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {myProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
