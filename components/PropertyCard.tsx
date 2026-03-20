'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types';
import { formatPrice, formatPricePerSqm, propertyTypeLabel, propertyTypeColor, timeAgo } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const mainImage = property.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80';

  return (
    <Link href={`/property/${property.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={mainImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${propertyTypeColor(property.type)}`}>
              {propertyTypeLabel(property.type)}
            </span>
          </div>
          {property.hasBalcony && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Ballkon
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-rose-500 transition-colors">
              {property.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{property.neighborhood}, {property.city}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">{formatPrice(property.totalPrice)}</p>
              <p className="text-xs text-gray-400">{formatPricePerSqm(property.pricePerSqm)}</p>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-sm bg-gray-50 px-2.5 py-1.5 rounded-lg">
              <span className="font-medium text-gray-700">{property.size}</span>
              <span className="text-xs">m²</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
            {timeAgo(property.createdAt)}
          </div>
        </div>
      </div>
    </Link>
  );
}
