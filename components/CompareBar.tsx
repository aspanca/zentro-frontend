'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCompareStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Property } from '@/types';

export default function CompareBar() {
  const { ids, remove, clear } = useCompareStore();
  const router = useRouter();
  const [properties, setProperties] = useState<Record<string, Property>>({});
  const [visible, setVisible] = useState(false);

  // Animate in/out
  useEffect(() => {
    setVisible(ids.length > 0);
  }, [ids.length]);

  // Fetch property info for each id
  useEffect(() => {
    ids.forEach((id) => {
      if (properties[id]) return;
      api.get(`/api/properties/${id}`)
        .then((data) => setProperties((prev) => ({ ...prev, [id]: data as Property })))
        .catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  if (!visible && ids.length === 0) return null;

  const goCompare = () => {
    router.push(`/compare?ids=${ids.join(',')}`);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-gray-900 border-t border-gray-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">

          {/* Label */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-gray-400 text-sm font-medium">Krahaso</span>
          </div>

          {/* Property slots */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {ids.map((id) => {
              const p = properties[id];
              return (
                <div key={id} className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2 min-w-0 max-w-[200px]">
                  {p?.images?.[0] && (
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={p.images[0]} alt="" width={32} height={32} className="object-cover w-full h-full" />
                    </div>
                  )}
                  <span className="text-white text-xs font-medium truncate flex-1 min-w-0">
                    {p?.title ?? '…'}
                  </span>
                  <button
                    onClick={() => remove(id)}
                    className="text-gray-500 hover:text-white flex-shrink-0 ml-1 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}

            {/* Empty slots */}
            {Array.from({ length: 3 - ids.length }).map((_, i) => (
              <div key={i} className="flex items-center justify-center w-28 h-12 rounded-xl border border-dashed border-gray-700 text-gray-600 text-xs">
                + Shto pronë
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={clear}
              className="text-gray-500 hover:text-gray-300 text-xs font-medium transition-colors hidden sm:block"
            >
              Pastro
            </button>
            <button
              onClick={goCompare}
              disabled={ids.length < 2}
              className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Krahaso {ids.length > 0 && `(${ids.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
