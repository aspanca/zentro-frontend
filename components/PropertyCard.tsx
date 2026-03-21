'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types';

const CATEGORY_LABELS: Record<string, string> = {
  apartment: 'Banesë', house: 'Shtëpi', office: 'Zyrë', store: 'Dyqan',
  land: 'Tokë', object: 'Objekt', warehouse: 'Depo', business: 'Biznes',
};

const EXTRA_ICONS: Record<string, string> = {
  elevator: '🛗', garage: '🚗', parking: '🅿️', air_conditioning: '❄️',
  tv: '📺', internet: '🌐', storage: '📦',
};

interface Props { property: Property }

export default function PropertyCard({ property }: Props) {
  const {
    id, title, neighborhood, city, totalPrice, pricePerSqm, size,
    images, listingType, category, bedrooms, bathrooms, extras = [],
    hasBalcony,
  } = property;

  const mainImage = images?.[0] ?? null;
  const badge = listingType === 'rent' ? 'Qira' : 'Shitje';
  const badgeColor = listingType === 'rent' ? 'bg-blue-500' : 'bg-rose-500';

  const displayExtras = extras.slice(0, 3);

  return (
    <Link href={`/property/${id}`} className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} points="9,22 9,12 15,12 15,22" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`${badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm`}>
            {badge}
          </span>
          {category && (
            <span className="bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
              {CATEGORY_LABELS[category] ?? category}
            </span>
          )}
        </div>

        {/* Image count */}
        {images?.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
              <circle cx="8.5" cy="8.5" r="1.5" strokeWidth={2} />
              <polyline points="21,15 16,10 5,21" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {images.length}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Location */}
        <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {neighborhood}, {city}
        </p>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-3">{title}</h3>

        {/* Price */}
        <div className="mb-3">
          <p className="text-xl font-bold text-gray-900">
            {totalPrice >= 1_000_000
              ? `€${(totalPrice / 1_000_000).toFixed(1)}M`
              : totalPrice >= 1_000
              ? `€${(totalPrice / 1_000).toFixed(0)}K`
              : `€${totalPrice.toLocaleString()}`}
          </p>
          {pricePerSqm > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">€{pricePerSqm.toLocaleString()}/m²</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-3 flex-wrap">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h12a2 2 0 012 2v2M4 8h16M4 8l1 12h14l1-12" />
            </svg>
            {size} m²
          </span>
          {bedrooms > 0 && (
            <span className="flex items-center gap-1">
              🛏 {bedrooms}
            </span>
          )}
          {bathrooms > 0 && (
            <span className="flex items-center gap-1">
              🚿 {bathrooms}
            </span>
          )}
          {hasBalcony && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              🌿 Ballkon
            </span>
          )}
        </div>

        {/* Extras */}
        {displayExtras.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {displayExtras.map((extra) => (
              <span key={extra} className="text-xs bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {EXTRA_ICONS[extra] ?? '•'} {extra.replace(/_/g, ' ')}
              </span>
            ))}
            {extras.length > 3 && (
              <span className="text-xs text-gray-400">+{extras.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
