'use client';

import { usePropertyStore } from '@/lib/store';
import PropertyCard from './PropertyCard';

export default function PropertyGrid() {
  const { getFilteredProperties, filters } = usePropertyStore();
  const properties = getFilteredProperties();

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nuk u gjet asnjë rezultat</h3>
        <p className="text-gray-500 text-sm max-w-sm">
          {filters.searchQuery
            ? `Nuk ka prona që përputhen me "${filters.searchQuery}". Provoni terma të tjerë.`
            : 'Nuk ka prona për filtrat e zgjedhur. Provoni të ndryshoni kriteret e kërkimit.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-gray-900 text-base">{properties.length}</span>
          {' '}prona të gjetura
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
