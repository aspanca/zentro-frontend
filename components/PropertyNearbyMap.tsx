'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Shared types ─────────────────────────────────────────────────────────────

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

// ─── Colors ───────────────────────────────────────────────────────────────────

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

// ─── Icon factories ───────────────────────────────────────────────────────────

function pinIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
    html: `<div style="
      width:32px;height:32px;
      background:#dc2626;
      border:3px solid #fff;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 2px 8px rgba(0,0,0,.5);
    "></div>`,
  });
}

function poiIcon(emoji: string, color: string, nearest: boolean): L.DivIcon {
  const s = nearest ? 30 : 22;
  return L.divIcon({
    className: '',
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
    popupAnchor: [0, -(s / 2 + 4)],
    html: `<div style="
      width:${s}px;height:${s}px;
      background:${color};
      border-radius:50%;
      border:${nearest ? '2px solid #fff' : '1.5px solid rgba(255,255,255,.5)'};
      box-shadow:${nearest ? `0 0 0 2px ${color}55,0 2px 8px rgba(0,0,0,.4)` : '0 1px 4px rgba(0,0,0,.35)'};
      display:flex;align-items:center;justify-content:center;
      font-size:${nearest ? 14 : 10}px;
    ">${emoji}</div>`,
  });
}

function distLabel(m: number) {
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

// ─── Map sub-component (pure Leaflet) ────────────────────────────────────────

interface MapProps {
  lat: number;
  lng: number;
  result: NearbyResponse | null;
  activeKeys: Set<string>;
}

function LeafletMap({ lat, lng, result, activeKeys }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const poiLayerRef = useRef<L.LayerGroup | null>(null);
  const pinRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  // Init map
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);

    pinRef.current = L.marker([lat, lng], { icon: pinIcon(), zIndexOffset: 1000 })
      .bindPopup('<b>📍 Prona</b>')
      .addTo(map);

    circleRef.current = L.circle([lat, lng], {
      radius: 1000,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.05,
      weight: 1.5,
      dashArray: '6 4',
    }).addTo(map);

    poiLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 120);

    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update POI markers
  useEffect(() => {
    if (!poiLayerRef.current || !result) return;
    poiLayerRef.current.clearLayers();

    for (const [key, cat] of Object.entries(result.categories)) {
      if (!activeKeys.has(key)) continue;
      const color = CAT_COLORS[key] ?? '#94a3b8';

      cat.items.forEach((poi, i) => {
        const nearest = i === 0;
        const marker = L.marker([poi.lat, poi.lng], {
          icon: poiIcon(cat.emoji, color, nearest),
          zIndexOffset: nearest ? 500 : 0,
        });

        const time = cat.mode === 'walk'
          ? `🚶 ${poi.walkMinutes} min`
          : `🚗 ${poi.driveMinutes} min`;

        marker.bindPopup(`
          <div style="min-width:140px;font-family:sans-serif;font-size:13px">
            <b>${cat.emoji} ${poi.name}</b>
            <div style="color:#6b7280;font-size:11px;margin:2px 0">${cat.label}</div>
            <hr style="margin:5px 0;border-color:#e5e7eb"/>
            📏 ${distLabel(poi.distance)} &nbsp; ${time}
            ${nearest ? '<br/><span style="color:#10b981;font-size:11px;font-weight:600">★ Më afërt</span>' : ''}
          </div>`);

        poiLayerRef.current!.addLayer(marker);
      });
    }
  }, [result, activeKeys]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

// ─── Main exported component ──────────────────────────────────────────────────

interface Props {
  lat: number;
  lng: number;
  propertyTitle: string;
}

const RADIUS = 1000;

export default function PropertyNearbyMap({ lat, lng, propertyTitle }: Props) {
  const [result, setResult] = useState<NearbyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set(Object.keys(CAT_COLORS)));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nearby`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, radiusMeters: RADIUS }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          if (data.error) setError(data.error);
          else setResult(data as NearbyResponse);
        }
      })
      .catch(() => { if (!cancelled) setError('Gabim i rrjetit.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [lat, lng]);

  function toggle(key: string) {
    setActiveKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const totalFound = result
    ? Object.values(result.categories).reduce((s, c) => s + c.count, 0)
    : 0;

  const sortedCats = result
    ? Object.entries(result.categories).sort(
        (a, b) => (a[1].nearest?.distance ?? Infinity) - (b[1].nearest?.distance ?? Infinity),
      )
    : [];

  return (
    <div className="mt-8 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            🗺️ Harta e shërbimeve afër
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Brenda 1 km nga kjo pronë · OpenStreetMap
          </p>
        </div>
        {result && (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
            {totalFound} vende
          </span>
        )}
      </div>

      {/* Map area */}
      <div className="relative" style={{ height: 380 }}>
        {typeof window !== 'undefined' && (
          <LeafletMap lat={lat} lng={lng} result={result} activeKeys={activeKeys} />
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-[1000]">
            <div className="text-center">
              <div
                className="w-9 h-9 rounded-full mx-auto mb-3 animate-spin"
                style={{ border: '3px solid #e5e7eb', borderTopColor: '#10b981' }}
              />
              <p className="text-sm font-medium text-gray-700">Duke ngarkuar shërbimet…</p>
              <p className="text-xs text-gray-400 mt-0.5">Overpass API · OpenStreetMap</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-[1000]">
            <div className="text-center text-sm text-gray-500">
              <p className="text-2xl mb-2">⚠️</p>
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Category toggle pills */}
      {result && (
        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide">
            Filtro sipas kategorisë
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
            {Object.entries(CAT_COLORS).map(([key, color]) => {
              const cat = result.categories[key];
              if (!cat) return null;
              const on = activeKeys.has(key);
              return (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all"
                  style={{
                    background: on ? color + '18' : 'transparent',
                    borderColor: on ? color + '60' : '#e5e7eb',
                    color: on ? color : '#9ca3af',
                    opacity: cat.count === 0 ? 0.4 : 1,
                  }}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                  {cat.count > 0 && (
                    <span
                      className="font-bold ml-0.5"
                      style={{ color: on ? color : '#d1d5db' }}
                    >
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Nearest-of-each summary grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sortedCats
              .filter(([, c]) => c.nearest !== null)
              .map(([key, cat]) => {
                const color = CAT_COLORS[key] ?? '#94a3b8';
                const d = cat.nearest!.distance;
                const distColor = d < 300 ? '#10b981' : d < 700 ? '#f59e0b' : '#ef4444';
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5"
                  >
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
                      style={{ background: color + '20', color }}
                    >
                      {cat.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">{cat.label}</p>
                      <p className="text-[11px] font-bold" style={{ color: distColor }}>
                        {distLabel(d)}
                        <span className="text-gray-400 font-normal ml-1">
                          {cat.mode === 'walk'
                            ? `· ${cat.nearest!.walkMinutes} min`
                            : `· ${cat.nearest!.driveMinutes} min 🚗`}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
