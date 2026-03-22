'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

function CategoryCard({ catKey, cat, active, onToggle }: {
  catKey: string; cat: CategoryResult; active: boolean; onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const color  = CAT_COLORS[catKey] ?? '#94a3b8';
  const nearest = cat.nearest;
  const dc = nearest ? distColor(nearest.distance) : null;

  return (
    <div className={`rounded-2xl border transition-all overflow-hidden ${active ? 'border-gray-200 bg-white shadow-sm' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        onClick={onToggle}
      >
        <span
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: color + '18', color }}
        >
          {cat.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 truncate">{cat.label}</p>
          {nearest && dc && (
            <p className="text-sm font-medium mt-0.5 truncate" style={{ color: dc.text }}>
              {nearest.name} &middot; {cat.mode === 'walk' ? `🚶 ${nearest.walkMinutes} min` : `🚗 ${nearest.driveMinutes} min`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {nearest && dc && (
            <span
              className="text-sm font-bold px-2.5 py-1 rounded-full border"
              style={{ color: dc.text, background: dc.bg, borderColor: dc.border }}
            >
              {distLabel(nearest.distance)}
            </span>
          )}
          <span
            className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white flex-shrink-0"
            style={{ background: color }}
          >
            {cat.count}
          </span>
        </div>
      </button>

      {expanded && active && cat.items.length > 0 && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {cat.items.slice(0, 8).map((poi, i) => {
            const pdc = distColor(poi.distance);
            return (
              <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-gray-700 truncate mr-3">{poi.name}</span>
                <span
                  className="font-bold flex-shrink-0 px-2.5 py-1 rounded-full border text-sm"
                  style={{ color: pdc.text, background: pdc.bg, borderColor: pdc.border }}
                >
                  {distLabel(poi.distance)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {active && cat.items.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          className="w-full text-sm text-center py-2.5 border-t border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors font-medium"
        >
          {expanded ? '▲ Mbyll' : `▼ Shiko të gjitha (${cat.items.length})`}
        </button>
      )}
    </div>
  );
}

interface Props { lat: number; lng: number; propertyTitle: string }

export default function PropertyNearbyMap({ lat, lng }: Props) {
  const [result, setResult]       = useState<NearbyResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set(Object.keys(CAT_COLORS)));
  const [panelOpen, setPanelOpen] = useState(false);

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
    <div className="mt-8 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white relative z-0">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            🗺️ Shërbime brenda 1 km
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">Kliko markerat · OpenStreetMap</p>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-bold px-3 py-1.5 rounded-full">
              {totalFound} vende
            </span>
          )}
          {result && (
            <button
              onClick={() => setPanelOpen(true)}
              className="lg:hidden flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-full transition-colors border border-indigo-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Detajet
            </button>
          )}
        </div>
      </div>

      {/* Body: map + panel */}
      <div className="flex flex-col lg:flex-row">

        {/* Map — z-index capped so it never overlaps navbar */}
        <div className="relative lg:flex-1 z-0" style={{ height: 380 }}>
          {typeof window !== 'undefined' && (
            <LeafletMap lat={lat} lng={lng} result={result} activeKeys={activeKeys} />
          )}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
              <div className="text-center">
                <div className="w-9 h-9 rounded-full mx-auto mb-3 animate-spin" style={{ border: '3px solid #e5e7eb', borderTopColor: '#10b981' }} />
                <p className="text-sm font-medium text-gray-700">Duke ngarkuar shërbimet…</p>
              </div>
            </div>
          )}
          {error && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
              <p className="text-sm text-gray-500">⚠️ {error}</p>
            </div>
          )}
        </div>

        {/* Desktop panel — always visible on lg+ */}
        <div className="hidden lg:flex lg:w-80 xl:w-96 border-l border-gray-100 flex-col">
          <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
            {[['#10b981', '< 300 m'], ['#d97706', '< 700 m'], ['#dc2626', '> 700 m']].map(([color, label]) => (
              <span key={label} className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
          {result ? (
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5" style={{ maxHeight: 380 }}>
              {sortedCats.map(([key, cat]) => (
                <CategoryCard key={key} catKey={key} cat={cat} active={activeKeys.has(key)} onToggle={() => toggle(key)} />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-base text-gray-400">
              {loading ? 'Duke ngarkuar…' : 'Nuk u gjend asnjë shërbim.'}
            </div>
          )}
        </div>
      </div>

      {/* Mobile modal overlay */}
      {panelOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPanelOpen(false)} />

          <div className="relative bg-white rounded-t-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1.5 rounded-full bg-gray-300" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Shërbime afër</h3>
                <p className="text-sm text-gray-400 mt-0.5">{totalFound} vende brenda 1 km</p>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
              {[['#10b981', '< 300 m'], ['#d97706', '< 700 m'], ['#dc2626', '> 700 m']].map(([color, label]) => (
                <span key={label} className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {sortedCats.map(([key, cat]) => (
                <CategoryCard key={key} catKey={key} cat={cat} active={activeKeys.has(key)} onToggle={() => toggle(key)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
