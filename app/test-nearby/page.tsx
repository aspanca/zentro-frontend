'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import type { NearbyResponse, CategoryResult } from '@/components/NearbyMap';

// Leaflet must not run on the server
const NearbyMap = dynamic(() => import('@/components/NearbyMap'), { ssr: false });

// ─── Constants ────────────────────────────────────────────────────────────────

const RADIUS_OPTIONS = [
  { label: '500 m', value: 500 },
  { label: '1 km',  value: 1000 },
  { label: '1.5 km', value: 1500 },
  { label: '2 km',  value: 2000 },
  { label: '3 km',  value: 3000 },
];

const CAT_COLORS: Record<string, string> = {
  pharmacy:        '#10b981',
  supermarket:     '#f59e0b',
  school:          '#3b82f6',
  kindergarten:    '#8b5cf6',
  parking:         '#6b7280',
  park:            '#22c55e',
  medical:         '#ef4444',
  shopping_center: '#f97316',
  main_street:     '#64748b',
};

// ─── Sidebar category card ─────────────────────────────────────────────────────

function CategoryRow({
  catKey,
  cat,
  active,
  onToggle,
}: {
  catKey: string;
  cat: CategoryResult;
  active: boolean;
  onToggle: () => void;
}) {
  const color = CAT_COLORS[catKey] ?? '#94a3b8';
  const hasData = cat.count > 0;

  return (
    <button
      onClick={onToggle}
      className={`w-full text-left rounded-xl px-3 py-2.5 flex items-center gap-3 transition-all border ${
        active && hasData
          ? 'border-white/20 bg-white/8'
          : 'border-transparent bg-white/[0.03] opacity-60 hover:opacity-80'
      }`}
      style={{ borderLeftColor: active && hasData ? color : 'transparent', borderLeftWidth: 3 }}
    >
      <span className="text-lg leading-none shrink-0">{cat.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white truncate">{cat.label}</p>
        {hasData && cat.nearest ? (
          <p className="text-[11px] text-gray-400 truncate">
            {cat.nearest.distance < 1000
              ? `${cat.nearest.distance} m`
              : `${(cat.nearest.distance / 1000).toFixed(1)} km`}
            {' · '}
            {cat.mode === 'walk'
              ? `${cat.nearest.walkMinutes} min këmbë`
              : `${cat.nearest.driveMinutes} min makinë`}
          </p>
        ) : (
          <p className="text-[11px] text-gray-500">Asnjë brenda rrezes</p>
        )}
      </div>
      <span
        className="text-xs font-bold shrink-0 px-1.5 py-0.5 rounded-full"
        style={{
          background: hasData ? color + '28' : '#ffffff10',
          color: hasData ? color : '#6b7280',
        }}
      >
        {cat.count}
      </span>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TestNearbyPage() {
  const [radius, setRadius] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NearbyResponse | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    new Set(Object.keys(CAT_COLORS)),
  );
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const fetchNearby = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nearby`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng, radiusMeters: radius }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Diçka shkoi keq.');
        } else {
          setResult(data as NearbyResponse);
          setSidebarOpen(true);
        }
      } catch {
        setError('Nuk u lidh me serverin.');
      } finally {
        setLoading(false);
      }
    },
    [radius],
  );

  function toggleCategory(key: string) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const totalFound = result
    ? Object.values(result.categories).reduce((s, c) => s + c.count, 0)
    : 0;

  return (
    <div className="flex flex-col bg-gray-950 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ── Top bar ── */}
      <div className="shrink-0 h-12 bg-gray-900 border-b border-white/10 flex items-center gap-3 px-4 z-10">
        <span className="text-white font-bold text-sm">Zentro</span>
        <span className="text-gray-600">·</span>
        <span className="text-gray-400 text-xs">Kërko Shërbime Afër</span>

        <div className="ml-auto flex items-center gap-2">
          {/* Radius picker */}
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="bg-gray-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
          >
            {RADIUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Toggle sidebar button */}
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1 text-xs text-white transition-colors"
          >
            {sidebarOpen ? '← Fshih' : '→ Rezultatet'}
            {result && (
              <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-bold px-1.5 rounded-full">
                {totalFound}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Body: map + sidebar ── */}
      <div className="flex flex-1 min-h-0">

        {/* Map */}
        <div className="relative" style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          <NearbyMap
            result={result}
            loading={loading}
            onPin={fetchNearby}
            radius={radius}
            activeCategories={activeCategories}
          />

          {/* Error toast */}
          {error && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1001] bg-red-900/90 border border-red-500/40 text-red-200 text-xs rounded-xl px-4 py-2.5 max-w-sm text-center shadow-lg">
              ⚠️ {error}
            </div>
          )}

          {/* Re-search hint after pin */}
          {result && !loading && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
              <div className="bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 text-xs text-gray-300">
                📍 Kliko sërish hartën për të ndryshuar vendndodhjen
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-72 shrink-0 bg-gray-900 border-l border-white/10 flex flex-col overflow-hidden">

            {/* Sidebar header */}
            <div className="px-4 pt-4 pb-3 border-b border-white/10">
              {result ? (
                <>
                  <p className="text-xs text-gray-400 mb-0.5">Vendndodhja</p>
                  <p className="text-white text-xs font-medium leading-snug line-clamp-2">
                    {result.geocodedAddress}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-gray-500">
                      {result.coordinates.lat.toFixed(4)}, {result.coordinates.lng.toFixed(4)}
                    </span>
                    <span className="ml-auto text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5 font-semibold">
                      {totalFound} vende
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-xs">
                  {loading ? 'Duke kërkuar…' : 'Kliko hartën për të filluar'}
                </p>
              )}

              {/* Toggle all */}
              {result && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setActiveCategories(new Set(Object.keys(CAT_COLORS)))}
                    className="text-[11px] text-gray-400 hover:text-white transition-colors"
                  >
                    Të gjitha ✓
                  </button>
                  <span className="text-gray-700">·</span>
                  <button
                    onClick={() => setActiveCategories(new Set())}
                    className="text-[11px] text-gray-400 hover:text-white transition-colors"
                  >
                    Asnjë ✗
                  </button>
                </div>
              )}
            </div>

            {/* Category list */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {result
                ? Object.entries(result.categories)
                    .sort((a, b) => {
                      // Sort: has nearest first, then by distance
                      const aD = a[1].nearest?.distance ?? Infinity;
                      const bD = b[1].nearest?.distance ?? Infinity;
                      return aD - bD;
                    })
                    .map(([key, cat]) => (
                      <div key={key}>
                        <CategoryRow
                          catKey={key}
                          cat={cat}
                          active={activeCategories.has(key)}
                          onToggle={() => toggleCategory(key)}
                        />

                        {/* Expanded list of all items */}
                        {activeCategories.has(key) && cat.count > 1 && (
                          <div className="ml-8 mt-1 mb-2">
                            <button
                              onClick={() => setExpandedCat(expandedCat === key ? null : key)}
                              className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
                            >
                              {expandedCat === key
                                ? '▲ Fshih listën'
                                : `▼ Të gjitha (${cat.count})`}
                            </button>
                            {expandedCat === key && (
                              <ul className="mt-1.5 space-y-1 max-h-48 overflow-y-auto pr-1">
                                {cat.items.map((item, i) => (
                                  <li
                                    key={i}
                                    className="flex items-center justify-between text-[11px] text-gray-400 py-1 border-b border-white/5 last:border-0"
                                  >
                                    <span className="truncate mr-2">{item.name}</span>
                                    <span
                                      className="shrink-0 font-semibold"
                                      style={{
                                        color:
                                          item.distance < 300
                                            ? '#10b981'
                                            : item.distance < 700
                                            ? '#f59e0b'
                                            : '#ef4444',
                                      }}
                                    >
                                      {item.distance < 1000
                                        ? `${item.distance}m`
                                        : `${(item.distance / 1000).toFixed(1)}km`}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                : Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 rounded-xl bg-white/[0.03] animate-pulse"
                    />
                  ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/10">
              <p className="text-[10px] text-gray-600 leading-relaxed">
                Të dhënat nga{' '}
                <a
                  href="https://www.openstreetmap.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  OpenStreetMap
                </a>
                . Rreze aktive:{' '}
                <span className="text-gray-400">
                  {radius >= 1000 ? `${radius / 1000} km` : `${radius} m`}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
