'use client';

import { useRef, useState, useEffect } from 'react';
import { usePropertyStore } from '@/lib/store';
import { KOSOVO_CITIES } from '@/lib/mockData';
import { PropertyType } from '@/types';

const PROPERTY_TYPES: { value: PropertyType | ''; label: string; icon: string }[] = [
  { value: '',      label: 'Të gjitha', icon: '' },
  { value: 'flat',  label: 'Banesë',    icon: '🏢' },
  { value: 'house', label: 'Shtëpi',    icon: '🏡' },
];

export default function SearchFilters() {
  const { filters, setFilter, resetFilters } = usePropertyStore();
  const [priceOpen, setPriceOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);
  const priceRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    setFilter('searchQuery', localSearch);
  };

  // Close price dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (priceRef.current && !priceRef.current.contains(e.target as Node)) {
        setPriceOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  useEffect(() => {
    if (filters.searchQuery === '') setLocalSearch('');
  }, [filters.searchQuery]);

  const activeCount =
    (filters.city !== '' ? 1 : 0) +
    (filters.propertyType !== '' ? 1 : 0) +
    (filters.minPrice !== '' ? 1 : 0) +
    (filters.maxPrice !== '' ? 1 : 0);

  const priceLabel = (() => {
    if (filters.minPrice !== '' && filters.maxPrice !== '')
      return `${Number(filters.minPrice).toLocaleString('de-DE')} – ${Number(filters.maxPrice).toLocaleString('de-DE')} €`;
    if (filters.minPrice !== '')
      return `Nga ${Number(filters.minPrice).toLocaleString('de-DE')} €`;
    if (filters.maxPrice !== '')
      return `Deri ${Number(filters.maxPrice).toLocaleString('de-DE')} €`;
    return 'Çmimi';
  })();

  const priceActive = filters.minPrice !== '' || filters.maxPrice !== '';

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">

        <div className="sm:flex sm:items-center sm:gap-2">

        {/* ── Row 1: search (full width on mobile) ── */}
        <div className="flex items-center gap-2 w-full sm:flex-1 sm:min-w-0">
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
              <button
                onClick={() => { setLocalSearch(''); setFilter('searchQuery', ''); }}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="h-11 px-4 sm:px-5 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white text-sm font-semibold rounded-xl flex-shrink-0 transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:inline">Kërko</span>
          </button>
        </div>

        {/* ── Row 2: filters (scrollable on mobile) ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 -mx-1 px-1 mt-2 sm:mt-0 sm:flex-shrink-0">

          {/* City select */}
          <div className="relative flex-shrink-0">
            <select
              value={filters.city}
              onChange={(e) => setFilter('city', e.target.value)}
              className={`h-9 pl-3 pr-8 rounded-xl border text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all ${
                filters.city
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
              }`}
              style={{ backgroundImage: 'none' }}
            >
              <option value="">📍 Qyteti</option>
              {KOSOVO_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Property type toggle buttons */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 gap-0.5 flex-shrink-0">
            {PROPERTY_TYPES.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setFilter('propertyType', value)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  filters.propertyType === value
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white'
                }`}
              >
                {icon && <span className="mr-1">{icon}</span>}{label}
              </button>
            ))}
          </div>

          {/* Price dropdown */}
          <div className="relative flex-shrink-0" ref={priceRef}>
            <button
              onClick={() => setPriceOpen(!priceOpen)}
              className={`h-9 flex items-center gap-2 px-4 rounded-xl border text-sm font-medium transition-all focus:outline-none ${
                priceActive
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="whitespace-nowrap">{priceLabel}</span>
              <svg className={`w-3.5 h-3.5 transition-transform ${priceOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {priceOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-72 bg-white rounded-2xl border border-gray-100 shadow-xl p-5 z-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Çmimi total (€)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Minimumi</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.minPrice}
                      onChange={(e) => setFilter('minPrice', e.target.value ? Number(e.target.value) : '')}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Maksimumi</label>
                    <input
                      type="number"
                      placeholder="∞"
                      value={filters.maxPrice}
                      onChange={(e) => setFilter('maxPrice', e.target.value ? Number(e.target.value) : '')}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    />
                  </div>
                </div>
                {/* Quick presets */}
                <p className="text-xs text-gray-400 mt-4 mb-2 font-medium">Shpejt</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '< 50k',    min: '',      max: 50000  },
                    { label: '50–100k',  min: 50000,   max: 100000 },
                    { label: '100–200k', min: 100000,  max: 200000 },
                    { label: '200k+',   min: 200000,  max: ''     },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => { setFilter('minPrice', p.min); setFilter('maxPrice', p.max); }}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-all"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {priceActive && (
                  <button
                    onClick={() => { setFilter('minPrice', ''); setFilter('maxPrice', ''); setPriceOpen(false); }}
                    className="mt-4 w-full text-xs text-rose-500 hover:text-rose-700 font-medium py-2 border border-rose-200 rounded-xl hover:bg-rose-50 transition-all"
                  >
                    Pastro çmimin
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Clear all badge */}
          {activeCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex-shrink-0 flex items-center gap-1.5 h-9 px-3 rounded-xl bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold transition-colors"
            >
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {activeCount}
              </span>
              Pastro
            </button>
          )}
        </div>

        </div>{/* end sm:flex wrapper */}

        {/* ── Active filter chips ── */}
        {activeCount > 0 && (
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {filters.city && (
              <Chip label={`📍 ${filters.city}`} onRemove={() => setFilter('city', '')} />
            )}
            {filters.propertyType && (
              <Chip
                label={`${filters.propertyType === 'flat' ? '🏢' : filters.propertyType === 'house' ? '🏡' : '🌿'} ${
                  filters.propertyType === 'flat' ? 'Banesë' : filters.propertyType === 'house' ? 'Shtëpi' : 'Truall'
                }`}
                onRemove={() => setFilter('propertyType', '')}
              />
            )}
            {(filters.minPrice !== '' || filters.maxPrice !== '') && (
              <Chip label={`💰 ${priceLabel}`} onRemove={() => { setFilter('minPrice', ''); setFilter('maxPrice', ''); }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-rose-900 transition-colors">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
