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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setVisible(ids.length > 0);
    if (ids.length === 0) setMobileOpen(false);
  }, [ids.length]);

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
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── Desktop bar (hidden on mobile) ── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 hidden md:block ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-gray-900 border-t border-gray-700 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-gray-400 text-sm font-medium">Krahaso</span>
            </div>

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

              {Array.from({ length: 3 - ids.length }).map((_, i) => (
                <div key={i} className="flex items-center justify-center w-28 h-12 rounded-xl border border-dashed border-gray-700 text-gray-600 text-xs">
                  + Shto pronë
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={clear}
                className="text-gray-500 hover:text-gray-300 text-xs font-medium transition-colors"
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

      {/* ── Mobile: sticky FAB button (bottom-right) ── */}
      {ids.length > 0 && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-6 right-4 z-50 md:hidden w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {ids.length}
          </span>
        </button>
      )}

      {/* ── Mobile: slide-up panel ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />

          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col">
            {/* Handle + header */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Krahasimi
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{ids.length}/3 prona të zgjedhura</p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Property list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {ids.map((id) => {
                const p = properties[id];
                return (
                  <div key={id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    {p?.images?.[0] ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <Image src={p.images[0]} alt="" width={64} height={64} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p?.title ?? 'Duke ngarkuar…'}</p>
                      {p?.city && <p className="text-xs text-gray-500 mt-0.5">{p.city}</p>}
                      {p?.price != null && (
                        <p className="text-sm font-bold text-rose-500 mt-1">€{Number(p.price).toLocaleString()}</p>
                      )}
                    </div>
                    <button
                      onClick={() => remove(id)}
                      className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 flex-shrink-0 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}

              {/* Empty slots */}
              {Array.from({ length: 3 - ids.length }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center h-16 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm"
                >
                  + Shto pronë
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 p-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={clear}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Pastro
              </button>
              <button
                onClick={goCompare}
                disabled={ids.length < 2}
                className="flex-[2] py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Krahaso ({ids.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
