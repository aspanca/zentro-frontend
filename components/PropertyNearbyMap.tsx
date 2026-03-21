'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface POIItem {
  name: string;
  distance: number;
  walkMinutes: number;
  driveMinutes: number;
  lat: number;
  lng: number;
}

interface CategoryResult {
  label: string;
  emoji: string;
  mode: 'walk' | 'drive';
  count: number;
  nearest: POIItem | null;
  items: POIItem[];
}

interface NearbyResponse {
  coordinates: { lat: number; lng: number };
  geocodedAddress: string;
  radiusMeters: number;
  categories: Record<string, CategoryResult>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

function distLabel(m: number) {
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

function distColor(m: number) {
  if (m < 300) return { text: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' };
  if (m < 700) return { text: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  return          { text: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
}

// ─── Leaflet icon helpers ─────────────────────────────────────────────────────

function pinIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
    html: `<div style="width:32px;height:32px;background:#dc2626;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>`,
  });
}

function poiIcon(emoji: string, color: string, nearest: boolean): L.DivIcon {
  const s = nearest ? 30 : 22;
  return L.divIcon({
    className: '',
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
    popupAnchor: [0, -(s / 2 + 4)],
    html: `<div style="width:${s}px;height:${s}px;background:${color};border-radius:50%;border:${nearest ? '2px solid #fff' : '1.5px solid rgba(255,255,255,.5)'};box-shadow:${nearest ? `0 0 0 2px ${color}55,0 2px 8px rgba(0,0,0,.4)` : '0 1px 4px rgba(0,0,0,.35)'};display:flex;align-items:center;justify-content:center;font-size:${nearest ? 14 : 10}px">${emoji}</div>`,
  });
}

// ─── Leaflet map (client-only) ────────────────────────────────────────────────

function LeafletMap({ lat, lng, result, activeKeys }: { lat: number; lng: number; result: NearbyResponse | null; activeKeys: Set<string> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const poiLayer     = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { center: [lat, lng], zoom: 15, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>', maxZoom: 19 }).addTo(map);
    L.marker([lat, lng], { icon: pinIcon(), zIndexOffset: 1000 }).bindPopup('<b>📍 Prona</b>').addTo(map);
    L.circle([lat, lng], { radius: 1000, color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.05, weight: 1.5, dashArray: '6 4' }).addTo(map);
    poiLayer.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 120);
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!poiLayer.current || !result) return;
    poiLayer.current.clearLayers();
    for (const [key, cat] of Object.entries(result.categories)) {
      if (!activeKeys.has(key)) continue;
      const color = CAT_COLORS[key] ?? '#94a3b8';
      cat.items.forEach((poi, i) => {
        const nearest = i === 0;
        const time = cat.mode === 'walk' ? `🚶 ${poi.walkMinutes} min` : `🚗 ${poi.driveMinutes} min`;
        L.marker([poi.lat, poi.lng], { icon: poiIcon(cat.emoji, color, nearest), zIndexOffset: nearest ? 500 : 0 })
          .bindPopup(`<div style="min-width:140px;font-family:sans-serif;font-size:13px"><b>${cat.emoji} ${poi.name}</b><div style="color:#6b7280;font-size:11px;margin:2px 0">${cat.label}</div><hr style="margin:5px 0;border-color:#e5e7eb"/>📏 ${distLabel(poi.distance)} &nbsp; ${time}${nearest ? '<br/><span style="color:#10b981;font-size:11px;font-weight:600">★ Më afërt</span>' : ''}</div>`)
          .addTo(poiLayer.current!);
      });
    }
  }, [result, activeKeys]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

// ─── Category card (right panel) ─────────────────────────────────────────────

function CategoryCard({ catKey, cat, active, onToggle }: {
  catKey: string; cat: CategoryResult; active: boolean; onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const color  = CAT_COLORS[catKey] ?? '#94a3b8';
  const nearest = cat.nearest;
  const dc = nearest ? distColor(nearest.distance) : null;

  return (
    <div className={`rounded-xl border transition-all overflow-hidden ${active ? 'border-gray-200 bg-white shadow-sm' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
      {/* Header row */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={onToggle}
      >
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: color + '18', color }}
        >
          {cat.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{cat.label}</p>
          {nearest && dc && (
            <p className="text-xs font-medium mt-0.5" style={{ color: dc.text }}>
              {distLabel(nearest.distance)} · {cat.mode === 'walk' ? `🚶 ${nearest.walkMinutes} min` : `🚗 ${nearest.driveMinutes} min`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {nearest && dc && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full border"
              style={{ color: dc.text, background: dc.bg, borderColor: dc.border }}
            >
              {distLabel(nearest.distance)}
            </span>
          )}
          <span
            className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white flex-shrink-0"
            style={{ background: color }}
          >
            {cat.count}
          </span>
        </div>
      </button>

      {/* Nearest item name */}
      {nearest && active && (
        <div className="px-4 pb-2 -mt-1">
          <p className="text-xs text-gray-500 truncate">★ {nearest.name}</p>
        </div>
      )}

      {/* Expanded list */}
      {expanded && active && cat.items.length > 1 && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {cat.items.slice(0, 8).map((poi, i) => {
            const pdc = distColor(poi.distance);
            return (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 text-xs">
                <span className="text-gray-700 truncate mr-2">{poi.name}</span>
                <span
                  className="font-bold flex-shrink-0 px-2 py-0.5 rounded-full border"
                  style={{ color: pdc.text, background: pdc.bg, borderColor: pdc.border }}
                >
                  {distLabel(poi.distance)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Expand toggle */}
      {active && cat.items.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          className="w-full text-xs text-center py-2 border-t border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {expanded ? '▲ Mbyll' : `▼ Shiko të gjitha (${cat.items.length})`}
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { lat: number; lng: number; propertyTitle: string }

export default function PropertyNearbyMap({ lat, lng }: Props) {
  const [result, setResult]       = useState<NearbyResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set(Object.keys(CAT_COLORS)));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/nearby`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, radiusMeters: 1000 }),
    })
      .then((r) => r.json())
      .then((data) => { if (!cancelled) { if (data.error) setError(data.error); else setResult(data); } })
      .catch(() => { if (!cancelled) setError('Gabim i rrjetit.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [lat, lng]);

  function toggle(key: string) {
    setActiveKeys((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }

  const totalFound = result ? Object.values(result.categories).reduce((s, c) => s + c.count, 0) : 0;
  const sortedCats = result
    ? Object.entries(result.categories).sort((a, b) => (a[1].nearest?.distance ?? Infinity) - (b[1].nearest?.distance ?? Infinity))
    : [];

  return (
    <div className="mt-8 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            🗺️ Shërbime brenda 1 km
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Kliko markerat · OpenStreetMap</p>
        </div>
        {result && (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
            {totalFound} vende
          </span>
        )}
      </div>

      {/* Body: map + panel */}
      <div className="flex flex-col lg:flex-row">

        {/* Map */}
        <div className="relative lg:flex-1" style={{ height: 380 }}>
          {typeof window !== 'undefined' && (
            <LeafletMap lat={lat} lng={lng} result={result} activeKeys={activeKeys} />
          )}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-[1000]">
              <div className="text-center">
                <div className="w-9 h-9 rounded-full mx-auto mb-3 animate-spin" style={{ border: '3px solid #e5e7eb', borderTopColor: '#10b981' }} />
                <p className="text-sm font-medium text-gray-700">Duke ngarkuar shërbimet…</p>
              </div>
            </div>
          )}
          {error && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-[1000]">
              <p className="text-sm text-gray-500">⚠️ {error}</p>
            </div>
          )}
        </div>

        {/* Right panel — distance legend + category list */}
        <div className="lg:w-72 xl:w-80 border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col">

          {/* Legend */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/60">
            {[['#10b981', '< 300 m'], ['#d97706', '< 700 m'], ['#dc2626', '> 700 m']].map(([color, label]) => (
              <span key={label} className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>

          {/* Category cards */}
          {result ? (
            <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: 380 }}>
              {sortedCats.map(([key, cat]) => (
                <CategoryCard
                  key={key}
                  catKey={key}
                  cat={cat}
                  active={activeKeys.has(key)}
                  onToggle={() => toggle(key)}
                />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-sm text-gray-400">
              {loading ? 'Duke ngarkuar…' : 'Nuk u gjend asnjë shërbim.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
