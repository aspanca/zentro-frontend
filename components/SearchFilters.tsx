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

      <div className="sticky top-16 z-30 border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl overflow-x-hidden px-3 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            {/* Search row: full width on mobile */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 transition-all focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 sm:px-4">
                <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  placeholder="Kërko pronë, lagje, qytet..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="min-w-0 flex-1 bg-transparent text-base text-gray-700 placeholder-gray-400 focus:outline-none sm:text-sm"
                />
                {localSearch && (
                  <button
                    type="button"
                    onClick={() => { setLocalSearch(''); setFilter('searchQuery', ''); }}
                    className="flex-shrink-0 touch-manipulation text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Desktop: actions inline with search */}
              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex h-11 touch-manipulation items-center gap-2 rounded-xl bg-rose-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Kërko
                </button>
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className={`flex h-11 touch-manipulation items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-all ${
                    count > 0
                      ? 'border-rose-500 bg-rose-500 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-rose-300 hover:text-rose-500'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                  Filtrat
                  {count > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-rose-500">
                      {count}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile: second row — full-width action buttons */}
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <button
                type="button"
                onClick={handleSearch}
                className="flex h-12 touch-manipulation items-center justify-center gap-2 rounded-xl bg-rose-500 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Kërko
              </button>
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className={`flex h-12 touch-manipulation items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all ${
                  count > 0
                    ? 'border-rose-500 bg-rose-500 text-white'
                    : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filtrat
                {count > 0 && (
                  <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-rose-500">
                    {count}
                  </span>
                )}
              </button>
            </div>
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
