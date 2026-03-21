'use client';

import { useEffect, useState, useRef } from 'react';
import { usePropertyStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Property } from '@/types';
import PropertyCard from './PropertyCard';

export default function PropertyGrid() {
  const { filters } = usePropertyStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.city)          params.set('city',        filters.city);
        if (filters.listingType)   params.set('listingType', filters.listingType);
        if (filters.category)      params.set('category',    filters.category);
        if (filters.searchQuery)   params.set('search',      filters.searchQuery);
        if (filters.minPrice !== '') params.set('minPrice',  String(filters.minPrice));
        if (filters.maxPrice !== '') params.set('maxPrice',  String(filters.maxPrice));
        if (filters.minSize  !== '') params.set('minSize',   String(filters.minSize));
        if (filters.maxSize  !== '') params.set('maxSize',   String(filters.maxSize));
        if (filters.bedrooms !== '') params.set('bedrooms',  String(filters.bedrooms));
        if (filters.bathrooms !== '') params.set('bathrooms', String(filters.bathrooms));

        const data = await api.get(`/api/properties?${params.toString()}`) as { total: number; properties: Property[] };
        setProperties(data.properties);
        setTotal(data.total);
      } catch {
        setProperties([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters]);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
              <div className="h-52 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
          <span className="font-bold text-gray-900 text-base">{total}</span>
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
