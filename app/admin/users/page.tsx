'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useAdminStore } from '@/lib/store';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { adminToken } = useAdminStore();
  const [data, setData]     = useState<UserRow[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    const res = await fetch(`${API}/api/admin/users?${params}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    setData(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, adminToken]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Përdoruesit</h1>
          <p className="text-gray-500 text-sm mt-1">{total} përdorues gjithsej</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Kërko sipas emrit ose emailit…"
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
                  <th className="text-left text-gray-500 font-medium px-6 py-4">Përdoruesi</th>
                  <th className="text-left text-gray-500 font-medium px-6 py-4 hidden md:table-cell">Email</th>
                  <th className="text-left text-gray-500 font-medium px-6 py-4 hidden lg:table-cell">Telefoni</th>
                  <th className="text-left text-gray-500 font-medium px-6 py-4 hidden lg:table-cell">Verifikuar</th>
                  <th className="text-left text-gray-500 font-medium px-6 py-4 hidden xl:table-cell">Regjistruar</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-12">Nuk u gjetën përdorues.</td>
                  </tr>
                ) : data.map((u, i) => (
                  <tr key={u.id} className={`border-b border-gray-800 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-800/20'}`}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {u.avatar ? (
                            <Image src={u.avatar} alt={u.name} width={32} height={32} className="object-cover w-full h-full" />
                          ) : (
                            <span className="text-rose-400 font-bold text-sm">{u.name?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="text-white font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-400 hidden md:table-cell">{u.email}</td>
                    <td className="px-6 py-3 text-gray-400 hidden lg:table-cell">{u.phone || <span className="text-gray-700">—</span>}</td>
                    <td className="px-6 py-3 hidden lg:table-cell">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.isVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-500'}`}>
                        {u.isVerified ? '✓ Po' : '✗ Jo'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-xs hidden xl:table-cell">
                      {new Date(u.createdAt).toLocaleDateString('sq-XK')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
