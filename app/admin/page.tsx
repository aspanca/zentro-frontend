'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/lib/store';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

interface Stats {
  properties: number;
  users: number;
  cities: number;
  heatingOptions: number;
  amenities: number;
}

const STAT_CARDS = (s: Stats) => [
  {
    label: 'Prona gjithsej',
    value: s.properties,
    icon: '🏠',
    href: '/admin/properties',
    color: 'from-rose-500/20 to-rose-500/5 border-rose-500/20',
    text: 'text-rose-400',
  },
  {
    label: 'Përdorues',
    value: s.users,
    icon: '👤',
    href: '/admin/users',
    color: 'from-blue-500/20 to-blue-500/5 border-blue-500/20',
    text: 'text-blue-400',
  },
  {
    label: 'Qytete',
    value: s.cities,
    icon: '🏙️',
    href: '/admin/cities',
    color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
    text: 'text-emerald-400',
  },
  {
    label: 'Opsionet e ngrohjes',
    value: s.heatingOptions,
    icon: '🔥',
    href: '/admin/heating',
    color: 'from-orange-500/20 to-orange-500/5 border-orange-500/20',
    text: 'text-orange-400',
  },
  {
    label: 'Amenitete',
    value: s.amenities,
    icon: '✨',
    href: '/admin/amenities',
    color: 'from-purple-500/20 to-purple-500/5 border-purple-500/20',
    text: 'text-purple-400',
  },
];

export default function AdminDashboard() {
  const { adminToken } = useAdminStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminToken) return;
    fetch(`${API}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [adminToken]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Pamja e përgjithshme e platformës</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse">
              <div className="w-10 h-10 bg-gray-800 rounded-xl mb-4" />
              <div className="h-8 bg-gray-800 rounded w-16 mb-2" />
              <div className="h-4 bg-gray-800 rounded w-24" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {STAT_CARDS(stats).map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`bg-gradient-to-br ${card.color} border rounded-2xl p-6 hover:scale-[1.02] transition-transform`}
            >
              <div className="text-3xl mb-4">{card.icon}</div>
              <p className={`text-3xl font-bold ${card.text}`}>{card.value.toLocaleString()}</p>
              <p className="text-gray-400 text-sm mt-1">{card.label}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Nuk mund të ngarkojë statistikat.</p>
      )}

      {/* Quick links */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-white mb-4">Veprimet e shpejta</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Shto qytet',     href: '/admin/cities',     icon: '🏙️' },
            { label: 'Shto ngrohje',   href: '/admin/heating',    icon: '🔥' },
            { label: 'Shto amenitet',  href: '/admin/amenities',  icon: '✨' },
            { label: 'Shiko pronat',   href: '/admin/properties', icon: '🏠' },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center gap-3 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span className="text-xl">{a.icon}</span>
              {a.label}
              <svg className="w-4 h-4 ml-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
