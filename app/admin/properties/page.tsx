'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/lib/store';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

interface PropRow {
  id: string;
  title: string;
  city: string;
  listingType: string;
  category: string;
  totalPrice: number;
  size: number;
  createdAt: string;
  owner?: { id: string; name: string; email: string };
}

const LISTING_BADGE: Record<string, string> = { sale: 'Shitje', rent: 'Qira' };

export default function AdminPropertiesPage() {
  const { adminToken } = useAdminStore();
  const [data, setData]     = useState<PropRow[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const headers = { Authorization: `Bearer ${adminToken}` };

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    const res = await fetch(`${API}/api/admin/properties?${params}`, { headers });
    const json = await res.json();
    setData(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, adminToken]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Fshi këtë pronë? Veprimi nuk mund të kthehets.')) return;
    await fetch(`${API}/api/admin/properties/${id}`, { method: 'DELETE', headers });
    load();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pronat</h1>
          <p className="text-gray-500 text-sm mt-1">{total} prona gjithsej</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Kërko sipas titullit ose qytetit…"
          className="w-full max-w-sm bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-500 placeholder-gray-600"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 bg-gray-900 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-500 font-medium px-6 py-4">Titulli</th>
                  <th className="text-left text-gray-500 font-medium px-6 py-4 hidden md:table-cell">Qyteti</th>
                  <th className="text-left text-gray-500 font-medium px-6 py-4 hidden lg:table-cell">Lloji</th>
                  <th className="text-left text-gray-500 font-medium px-6 py-4 hidden lg:table-cell">Çmimi</th>
                  <th className="text-left text-gray-500 font-medium px-6 py-4 hidden xl:table-cell">Pronari</th>
                  <th className="text-left text-gray-500 font-medium px-6 py-4 hidden xl:table-cell">Data</th>
                  <th className="text-right text-gray-500 font-medium px-6 py-4">Veprimet</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-12">Nuk u gjetën prona.</td>
                  </tr>
                ) : data.map((p, i) => (
                  <tr key={p.id} className={`border-b border-gray-800 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-800/20'}`}>
                    <td className="px-6 py-3">
                      <p className="text-white font-medium line-clamp-1">{p.title}</p>
                    </td>
                    <td className="px-6 py-3 text-gray-400 hidden md:table-cell">{p.city}</td>
                    <td className="px-6 py-3 hidden lg:table-cell">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.listingType === 'rent' ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {LISTING_BADGE[p.listingType] ?? p.listingType}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-300 hidden lg:table-cell">
                      {p.totalPrice ? `€${Number(p.totalPrice).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-3 hidden xl:table-cell">
                      {p.owner ? (
                        <div>
                          <p className="text-gray-300 text-xs">{p.owner.name}</p>
                          <p className="text-gray-600 text-xs">{p.owner.email}</p>
                        </div>
                      ) : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-xs hidden xl:table-cell">
                      {new Date(p.createdAt).toLocaleDateString('sq-XK')}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/property/${p.id}`}
                          target="_blank"
                          className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                          title="Shiko"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                          title="Fshi"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
              <p className="text-gray-500 text-xs">Faqja {page} nga {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-gray-800 disabled:opacity-40 transition-colors"
                >
                  ← Para
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-gray-800 disabled:opacity-40 transition-colors"
                >
                  Pas →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
