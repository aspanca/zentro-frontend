'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Property } from '@/types';
import { useWishlistStore } from '@/lib/store';
import PropertyCard from '@/components/PropertyCard';

export default function WishlistPage() {
  const { ids, toggle } = useWishlistStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ids.length) { setLoading(false); return; }

    setLoading(true);
    Promise.all(ids.map((id) => api.get(`/api/properties/${id}`).catch(() => null)))
      .then((results) => {
        setProperties(results.filter(Boolean) as Property[]);
        setLoading(false);
      });
  }, [ids]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span>❤️</span> Lista e dëshirave
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {ids.length === 0 ? 'Nuk keni prona të ruajtura' : `${ids.length} prona të ruajtura`}
            </p>
          </div>
          {ids.length > 0 && (
            <Link href="/" className="text-sm text-rose-500 hover:text-rose-600 font-medium transition-colors">
              + Shto me shumë
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full" />
          </div>
        ) : ids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-7xl mb-6">🏠</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Lista e dëshirave është bosh</h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              Shtyp ikonën e zemrës në çdo pronë për ta shtuar këtu.
            </p>
            <Link
              href="/"
              className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Shfleto pronat
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {properties.map((p) => (
              <div key={p.id} className="relative">
                <PropertyCard property={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
