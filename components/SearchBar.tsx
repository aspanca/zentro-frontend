'use client';

import { usePropertyStore } from '@/lib/store';

export default function SearchBar() {
  const { filters, setFilter } = usePropertyStore();

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex-1 flex items-center px-5">
          <svg
            className="w-5 h-5 text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Kërko sipas qytetit, lagjes ose titullit..."
            value={filters.searchQuery}
            onChange={(e) => setFilter('searchQuery', e.target.value)}
            className="flex-1 px-3 py-4 text-gray-700 placeholder-gray-400 focus:outline-none text-sm bg-transparent"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilter('searchQuery', '')}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="px-2">
          <button className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors">
            Kërko
          </button>
        </div>
      </div>
    </div>
  );
}
