'use client';

import { usePropertyStore } from '@/lib/store';
import { KOSOVO_CITIES } from '@/lib/mockData';
import { PropertyType } from '@/types';

export default function Filters() {
  const { filters, setFilter, resetFilters } = usePropertyStore();

  const hasActiveFilters =
    filters.city !== '' ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.propertyType !== '';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 text-sm">Filtra</h2>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors"
          >
            Pastro të gjitha
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Qyteti</label>
          <select
            value={filters.city}
            onChange={(e) => setFilter('city', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white text-gray-700"
          >
            <option value="">Të gjitha qytetet</option>
            {KOSOVO_CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Lloji i pronës</label>
          <div className="grid grid-cols-3 gap-2">
            {(['', 'flat', 'house', 'land'] as (PropertyType | '')[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilter('propertyType', type)}
                className={`text-xs font-medium py-2 px-2 rounded-lg border transition-all ${
                  filters.propertyType === type
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {type === '' ? 'Të gjitha' : type === 'flat' ? 'Banesë' : type === 'house' ? 'Shtëpi' : 'Truall'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Çmimi (€)</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilter('minPrice', e.target.value ? Number(e.target.value) : '')}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilter('maxPrice', e.target.value ? Number(e.target.value) : '')}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
