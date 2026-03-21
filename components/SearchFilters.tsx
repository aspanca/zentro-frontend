'use client';

import { useState } from 'react';
import { usePropertyStore } from '@/lib/store';
import FilterSheet, { activeFilterCount } from './FilterSheet';

export default function SearchFilters() {
  const { filters, setFilter } = usePropertyStore();
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSearch = () => setFilter('searchQuery', localSearch);
  const count = activeFilterCount(filters);

  return (
    <>
      <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />

      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2">
            {/* Search input */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 h-11 flex-1 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Kërko pronë, lagje, qytet..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none min-w-0"
              />
              {localSearch && (
                <button onClick={() => { setLocalSearch(''); setFilter('searchQuery', ''); }} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="h-11 px-4 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl flex-shrink-0 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Kërko</span>
            </button>

            {/* Filters button */}
            <button
              onClick={() => setSheetOpen(true)}
              className={`h-11 px-4 flex items-center gap-2 rounded-xl border text-sm font-semibold flex-shrink-0 transition-all ${
                count > 0
                  ? 'bg-rose-500 border-rose-500 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              <span className="hidden sm:inline">Filtrat</span>
              {count > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-rose-500 text-[10px] font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </div>

          {/* Active filter chips */}
          {count > 0 && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {filters.listingType && <ActiveChip label={filters.listingType === 'sale' ? '🏷️ Shitje' : '🏷️ Qira'} onRemove={() => setFilter('listingType', '')} />}
              {filters.category    && <ActiveChip label={`🏠 ${filters.category}`} onRemove={() => setFilter('category', '')} />}
              {filters.city        && <ActiveChip label={`📍 ${filters.city}`}   onRemove={() => setFilter('city', '')} />}
              {(filters.minPrice !== '' || filters.maxPrice !== '') && (
                <ActiveChip label={`💰 ${filters.minPrice || '0'} – ${filters.maxPrice || '∞'} €`} onRemove={() => { setFilter('minPrice', ''); setFilter('maxPrice', ''); }} />
              )}
              {(filters.minSize !== '' || filters.maxSize !== '') && (
                <ActiveChip label={`📐 ${filters.minSize || '0'} – ${filters.maxSize || '∞'} m²`} onRemove={() => { setFilter('minSize', ''); setFilter('maxSize', ''); }} />
              )}
              {filters.bedrooms  !== '' && <ActiveChip label={`🛏 ${filters.bedrooms}+ dhoma`} onRemove={() => setFilter('bedrooms', '')} />}
              {filters.bathrooms !== '' && <ActiveChip label={`🚿 ${filters.bathrooms}+ banjo`} onRemove={() => setFilter('bathrooms', '')} />}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-rose-900">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
