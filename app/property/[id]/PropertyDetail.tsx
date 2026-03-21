'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePropertyStore, usePaymentStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Property } from '@/types';
import { formatPrice, formatPricePerSqm, propertyTypeLabel, propertyTypeColor, timeAgo } from '@/lib/utils';
import InsightsPaywall from '@/components/InsightsPaywall';

const PropertyInsights = dynamic(() => import('@/components/PropertyInsights'), { ssr: false });

interface Props {
  id: string;
}

export default function PropertyDetail({ id }: Props) {
  const { properties } = usePropertyStore();
  const { isUnlocked } = usePaymentStore();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [notFound, setNotFound] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    // First try the local store (instant), then fall back to the API
    const local = properties.find((p) => p.id === id);
    if (local) {
      setProperty(local);
      setUnlocked(isUnlocked(id));
      return;
    }

    api.get(`/api/properties/${id}`)
      .then((data) => {
        setProperty(data as Property);
        setUnlocked(isUnlocked(id));
      })
      .catch(() => setNotFound(true));
  }, [id, properties, isUnlocked]);

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Prona nuk u gjet</h1>
        <p className="text-gray-500 mb-6">Kjo pronë nuk ekziston ose është fshirë.</p>
        <Link href="/" className="bg-rose-500 hover:bg-rose-600 text-white font-medium px-6 py-3 rounded-xl transition-colors">
          Kthehu në kryefaqe
        </Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-80 bg-gray-200 rounded-2xl mb-6" />
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    );
  }

  // owner info comes embedded from the API response as `owner`
  const owner = (property as Property & { owner?: { id: string; name: string; email: string } }).owner ?? null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kthehu
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[16/9] mb-3">
            <img
              src={property.images[activeImage] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${propertyTypeColor(property.type)}`}>
                {propertyTypeLabel(property.type)}
              </span>
            </div>
          </div>

          {property.images.length > 1 && (
            <div className="flex gap-2 mb-6">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === idx ? 'border-rose-500' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{property.neighborhood}, {property.city}</span>
              <span className="text-gray-300">·</span>
              <span>{timeAgo(property.createdAt)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{property.size}</p>
              <p className="text-xs text-gray-500 mt-0.5">m² total</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{property.pricePerSqm.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-0.5">€ / m²</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{propertyTypeLabel(property.type)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Lloji</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{property.hasBalcony ? '✓' : '✗'}</p>
              <p className="text-xs text-gray-500 mt-0.5">Ballkon</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Rreth kësaj prone</h2>
            <p className="text-gray-600 leading-relaxed text-sm">{property.description}</p>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
            <div className="mb-5">
              <p className="text-3xl font-bold text-gray-900">{formatPrice(property.totalPrice)}</p>
              <p className="text-sm text-gray-500 mt-0.5">{formatPricePerSqm(property.pricePerSqm)}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sipërfaqja</span>
                <span className="font-medium text-gray-900">{property.size} m²</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Qyteti</span>
                <span className="font-medium text-gray-900">{property.city}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Lagja</span>
                <span className="font-medium text-gray-900">{property.neighborhood}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Lloji</span>
                <span className="font-medium text-gray-900">{propertyTypeLabel(property.type)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ballkon</span>
                <span className="font-medium text-gray-900">{property.hasBalcony ? 'Po' : 'Jo'}</span>
              </div>
            </div>

            {owner && (
              <div className="border-t border-gray-100 pt-5 mb-5">
                <p className="text-xs font-medium text-gray-500 mb-3">Shitësi</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold">
                    {owner.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{owner.name}</p>
                    <p className="text-xs text-gray-500">{owner.email}</p>
                  </div>
                </div>
              </div>
            )}

            <button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm mb-2">
              Kontakto shitësin
            </button>
            <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Shto te preferencat
            </button>
          </div>
        </div>
      </div>

      {/* Insights — full width below the grid */}
      {unlocked ? (
        <PropertyInsights property={property} allProperties={properties} />
      ) : (
        <div className="mt-8">
          <InsightsPaywall
            propertyId={property.id}
            onUnlocked={() => setUnlocked(true)}
          />
        </div>
      )}
    </div>
  );
}
