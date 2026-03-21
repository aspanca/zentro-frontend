'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/types';

// ─── Overpass types ───────────────────────────────────────────────────────────

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

// ─── Score calculation from live Overpass data ────────────────────────────────

// Each entry: [categoryKey, maxPoints]
const SCORE_WEIGHTS: [string, number][] = [
  ['supermarket',     1.8],
  ['pharmacy',        1.5],
  ['school',          1.4],
  ['park',            1.2],
  ['medical',         1.3],
  ['parking',         0.8],
  ['kindergarten',    0.6],
  ['shopping_center', 0.4],
];
const MAX_SCORE = SCORE_WEIGHTS.reduce((s, [, w]) => s + w, 0); // 9.0

function proximityFactor(distance: number): number {
  if (distance < 150) return 1.0;
  if (distance < 300) return 0.88;
  if (distance < 500) return 0.72;
  if (distance < 700) return 0.52;
  if (distance < 900) return 0.30;
  if (distance < 1200) return 0.12;
  return 0;
}

function calcLiveScore(categories: Record<string, CategoryResult>): number {
  let pts = 0;
  for (const [key, maxPts] of SCORE_WEIGHTS) {
    const cat = categories[key];
    if (!cat?.nearest) continue;
    pts += maxPts * proximityFactor(cat.nearest.distance);
  }
  return Math.min(10, Math.round((pts / MAX_SCORE) * 100) / 10);
}

function scoreLabel(s: number): string {
  if (s >= 8.5) return 'Shkëlqyer';
  if (s >= 7)   return 'Shumë i mirë';
  if (s >= 5.5) return 'I mirë';
  if (s >= 4)   return 'Mesatar';
  if (s >= 2.5) return 'Nën mesatare';
  return 'I dobët';
}

function scoreGradient(s: number): string {
  if (s >= 7.5) return 'from-emerald-500 to-green-400';
  if (s >= 5)   return 'from-amber-400 to-yellow-300';
  return 'from-red-500 to-orange-400';
}

function scoreTextColor(s: number): string {
  if (s >= 7.5) return 'text-emerald-600';
  if (s >= 5)   return 'text-amber-500';
  return 'text-red-500';
}

// ─── Price analysis ───────────────────────────────────────────────────────────

function calcPriceAnalysis(property: Property, allProperties: Property[]) {
  const cityProps = allProperties.filter(
    (p) => p.city === property.city && p.id !== property.id,
  );
  if (!cityProps.length) return null;
  const avg = cityProps.reduce((s, p) => s + p.pricePerSqm, 0) / cityProps.length;
  const diff = ((property.pricePerSqm - avg) / avg) * 100;
  return {
    avg: Math.round(avg),
    diff: Math.round(diff),
    label: diff > 5 ? 'Mbi mesatare' : diff < -5 ? 'Nën mesatare' : 'Mesatare',
    isGood: diff <= 5,
  };
}

// ─── Leaflet map ──────────────────────────────────────────────────────────────

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

function pinIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -36],
    html: `<div style="width:34px;height:34px;background:#dc2626;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,.45)"></div>`,
  });
}

function poiIcon(emoji: string, color: string, nearest: boolean): L.DivIcon {
  const s = nearest ? 32 : 23;
  return L.divIcon({
    className: '',
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
    popupAnchor: [0, -(s / 2 + 4)],
    html: `<div style="width:${s}px;height:${s}px;background:${color};border-radius:50%;border:${nearest ? '2px solid #fff' : '1.5px solid rgba(255,255,255,.55)'};box-shadow:${nearest ? `0 0 0 2px ${color}55,0 2px 8px rgba(0,0,0,.4)` : '0 1px 4px rgba(0,0,0,.3)'};display:flex;align-items:center;justify-content:center;font-size:${nearest ? 14 : 10}px">${emoji}</div>`,
  });
}

interface MapProps {
  lat: number;
  lng: number;
  result: NearbyResponse;
  activeKeys: Set<string>;
}

function LiveMap({ lat, lng, result, activeKeys }: MapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const poiLayer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current || mapRef.current) return;
    const map = L.map(ref.current, { center: [lat, lng], zoom: 15, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);
    L.marker([lat, lng], { icon: pinIcon(), zIndexOffset: 1000 })
      .bindPopup('<b>📍 Prona</b>')
      .addTo(map);
    L.circle([lat, lng], {
      radius: 1000,
      color: '#3b82f6', fillColor: '#3b82f6',
      fillOpacity: 0.05, weight: 1.5, dashArray: '6 4',
    }).addTo(map);
    poiLayer.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 120);
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!poiLayer.current) return;
    poiLayer.current.clearLayers();
    for (const [key, cat] of Object.entries(result.categories)) {
      if (!activeKeys.has(key)) continue;
      const color = CAT_COLORS[key] ?? '#94a3b8';
      cat.items.forEach((poi, i) => {
        const nearest = i === 0;
        const m = L.marker([poi.lat, poi.lng], {
          icon: poiIcon(cat.emoji, color, nearest),
          zIndexOffset: nearest ? 500 : 0,
        });
        const dist = poi.distance < 1000 ? `${poi.distance} m` : `${(poi.distance / 1000).toFixed(1)} km`;
        const time = cat.mode === 'walk' ? `🚶 ${poi.walkMinutes} min` : `🚗 ${poi.driveMinutes} min`;
        m.bindPopup(`<div style="min-width:145px;font-family:sans-serif"><b style="font-size:13px">${cat.emoji} ${poi.name}</b><div style="color:#6b7280;font-size:11px;margin:2px 0">${cat.label}</div><hr style="margin:5px 0;border-color:#e5e7eb"/><div style="font-size:12px">📏 ${dist} &nbsp; ${time}${nearest ? '<br/><span style="color:#10b981;font-weight:600;font-size:11px">★ Më afërt</span>' : ''}</div></div>`);
        poiLayer.current!.addLayer(m);
      });
    }
  }, [result, activeKeys]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
}

// ─── Category sidebar entry ───────────────────────────────────────────────────

function DistBadge({ distance }: { distance: number }) {
  const [bg, text, border] =
    distance < 300
      ? ['bg-emerald-50', 'text-emerald-700', 'border-emerald-200']
      : distance < 700
      ? ['bg-amber-50', 'text-amber-700', 'border-amber-200']
      : ['bg-red-50', 'text-red-600', 'border-red-200'];
  const label = distance < 1000 ? `${distance} m` : `${(distance / 1000).toFixed(1)} km`;
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${bg} ${text} ${border} shrink-0`}>
      {label}
    </span>
  );
}

function CategoryEntry({
  catKey, cat, active, onToggle,
}: {
  catKey: string;
  cat: CategoryResult;
  active: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const color = CAT_COLORS[catKey] ?? '#94a3b8';
  const hasData = cat.count > 0;

  return (
    <div className={`rounded-xl border transition-all ${active && hasData ? 'border-gray-200 bg-white shadow-sm' : 'border-transparent bg-gray-50 opacity-60'}`}>

      {/* Row header — click to toggle visibility on map */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
        style={{ borderLeft: `3px solid ${active && hasData ? color : 'transparent'}`, borderRadius: '0.75rem 0.75rem 0 0' }}
      >
        <span className="text-base leading-none shrink-0">{cat.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">{cat.label}</p>
          {hasData && cat.nearest ? (
            <p className="text-[10px] text-gray-400 truncate mt-0.5">
              {cat.mode === 'walk'
                ? `🚶 ${cat.nearest.walkMinutes} min · ${cat.nearest.distance < 1000 ? `${cat.nearest.distance} m` : `${(cat.nearest.distance / 1000).toFixed(1)} km`}`
                : `🚗 ${cat.nearest.driveMinutes} min · ${cat.nearest.distance < 1000 ? `${cat.nearest.distance} m` : `${(cat.nearest.distance / 1000).toFixed(1)} km`}`}
            </p>
          ) : (
            <p className="text-[10px] text-gray-400 mt-0.5">Asnjë brenda 1 km</p>
          )}
        </div>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
          style={{
            background: hasData ? color + '20' : '#f3f4f6',
            color: hasData ? color : '#9ca3af',
          }}
        >
          {cat.count}
        </span>
      </button>

      {/* Nearest item preview */}
      {hasData && cat.nearest && (
        <div className="mx-3 mb-2 px-2.5 py-2 bg-gray-50 rounded-lg">
          <p className="text-[11px] font-semibold text-gray-700 truncate">{cat.nearest.name}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-gray-400">
              {cat.mode === 'walk'
                ? `${cat.nearest.walkMinutes} min në këmbë`
                : `${cat.nearest.driveMinutes} min me makinë`}
            </span>
            <DistBadge distance={cat.nearest.distance} />
          </div>
        </div>
      )}

      {/* Expand button */}
      {hasData && cat.items.length > 1 && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="w-full flex items-center justify-between px-3 pb-2 text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span>{expanded ? '▲ Fshih listën' : `▼ Shiko të gjitha (${cat.items.length})`}</span>
        </button>
      )}

      {/* Full list */}
      {expanded && (
        <ul className="mx-3 mb-2.5 space-y-1 max-h-40 overflow-y-auto pr-0.5">
          {cat.items.map((item, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 text-[10px] text-gray-600 border-b border-gray-100 pb-1 last:border-0 last:pb-0"
            >
              <span className="truncate">{item.name}</span>
              <DistBadge distance={item.distance} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  property: Property;
  allProperties: Property[];
}

export default function PropertyInsights({ property, allProperties }: Props) {
  const [data, setData] = useState<NearbyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set(Object.keys(CAT_COLORS)));

  useEffect(() => {
    if (!property.lat || !property.lng) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nearby`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: property.lat, lng: property.lng, radiusMeters: 1000 }),
    })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) { d.error ? setError(d.error) : setData(d); } })
      .catch(() => { if (!cancelled) setError('Nuk u arrit serveri.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [property.lat, property.lng]);

  function toggle(key: string) {
    setActiveKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const priceInfo = calcPriceAnalysis(property, allProperties);
  const score = data ? calcLiveScore(data.categories) : null;
  const totalFound = data ? Object.values(data.categories).reduce((s, c) => s + c.count, 0) : 0;

  const sortedCats = data
    ? Object.entries(data.categories).sort(
        (a, b) => (a[1].nearest?.distance ?? Infinity) - (b[1].nearest?.distance ?? Infinity),
      )
    : [];

  return (
    <div className="mt-8 space-y-5">

      {/* ── Score + Price Analysis row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Score card */}
        <div className="bg-gray-900 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${score !== null ? scoreGradient(score) : 'from-gray-600 to-gray-500'}`} />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Vlerësimi i Lokacionit
            </p>

            {loading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span className="text-sm text-gray-400">Duke analizuar…</span>
              </div>
            )}

            {!loading && score !== null && (
              <div className="flex items-end gap-4">
                {/* Big score number */}
                <div className="text-center">
                  <p className={`text-5xl font-black tabular-nums ${scoreTextColor(score)}`}>
                    {score.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">/ 10</p>
                </div>

                <div className="flex-1">
                  <p className={`text-lg font-bold ${scoreTextColor(score)}`}>{scoreLabel(score)}</p>

                  {/* Progress bar */}
                  <div className="mt-2 h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${scoreGradient(score)} transition-all duration-700`}
                      style={{ width: `${(score / 10) * 100}%` }}
                    />
                  </div>

                  {/* Sub-scores */}
                  <div className="mt-3 space-y-1.5">
                    {SCORE_WEIGHTS.slice(0, 4).map(([key, maxPts]) => {
                      const cat = data?.categories[key];
                      const pts = cat?.nearest
                        ? maxPts * proximityFactor(cat.nearest.distance)
                        : 0;
                      const pct = pts / maxPts;
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs w-4 text-center">{cat?.emoji ?? '·'}</span>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-white/60 transition-all duration-500"
                              style={{ width: `${pct * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-500 w-6 text-right">
                            {cat?.nearest
                              ? cat.nearest.distance < 1000
                                ? `${cat.nearest.distance}m`
                                : `${(cat.nearest.distance / 1000).toFixed(1)}k`
                              : '–'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {!loading && score === null && !error && (
              <p className="text-sm text-gray-400">Koordinatat nuk janë të disponueshme.</p>
            )}

            {error && (
              <p className="text-sm text-red-400">⚠️ {error}</p>
            )}

            <p className="text-[10px] text-gray-600 mt-4 leading-relaxed">
              Bazuar në shërbime reale nga OpenStreetMap brenda 1 km.
            </p>
          </div>
        </div>

        {/* Price analysis card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Analiza e Çmimit
          </p>

          {priceInfo ? (
            <>
              <div className="flex items-end gap-2 mb-4">
                <span
                  className={`text-3xl font-black ${priceInfo.diff > 5 ? 'text-red-500' : priceInfo.diff < -5 ? 'text-emerald-600' : 'text-amber-500'}`}
                >
                  {priceInfo.diff > 0 ? '+' : ''}{priceInfo.diff}%
                </span>
                <span className="text-sm text-gray-500 mb-1">
                  {priceInfo.label}
                </span>
              </div>

              {/* Two-bar comparison */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Kjo pronë</span>
                    <span className="font-semibold text-gray-900">
                      {property.pricePerSqm.toLocaleString()} €/m²
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${priceInfo.diff > 5 ? 'bg-red-400' : 'bg-emerald-400'}`}
                      style={{
                        width: `${Math.min(100, (property.pricePerSqm / Math.max(property.pricePerSqm, priceInfo.avg)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Mesatarja — {property.city}</span>
                    <span className="font-semibold text-gray-700">
                      {priceInfo.avg.toLocaleString()} €/m²
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-300 rounded-full"
                      style={{
                        width: `${Math.min(100, (priceInfo.avg / Math.max(property.pricePerSqm, priceInfo.avg)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <p className={`mt-4 text-xs font-medium px-3 py-2 rounded-xl ${priceInfo.isGood ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {priceInfo.isGood
                  ? '✓ Çmim i favorshëm krahasuar me tregun'
                  : '↑ Çmim mbi mesataren e tregut'}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400">Nuk ka të dhëna të mjaftueshme për krahasim.</p>
          )}
        </div>
      </div>

      {/* ── Map + Sidebar ── */}
      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-gray-900 text-sm">🗺️ Shërbime brenda 1 km</h3>
            <span className="text-xs text-gray-400">Kliko markerët · OpenStreetMap</span>
          </div>
          <div className="flex items-center gap-2">
            {data && (
              <>
                <button
                  onClick={() => setActiveKeys(new Set(Object.keys(CAT_COLORS)))}
                  className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
                >Të gjitha</button>
                <span className="text-gray-300">·</span>
                <button
                  onClick={() => setActiveKeys(new Set())}
                  className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
                >Asnjë</button>
                <span className="text-gray-300">·</span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {totalFound} vende
                </span>
              </>
            )}
          </div>
        </div>

        {/* Map + sidebar split */}
        <div className="flex" style={{ height: 620 }}>

          {/* Map — takes remaining width */}
          <div className="relative flex-1 min-w-0">
            {data && typeof window !== 'undefined' && (
              <LiveMap
                lat={property.lat!}
                lng={property.lng!}
                result={data}
                activeKeys={activeKeys}
              />
            )}

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-[1000]">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full mx-auto mb-3 animate-spin"
                    style={{ border: '3px solid #e5e7eb', borderTopColor: '#10b981' }} />
                  <p className="text-sm font-medium text-gray-700">Duke ngarkuar hartën…</p>
                  <p className="text-xs text-gray-400 mt-1">OpenStreetMap · Overpass API</p>
                </div>
              </div>
            )}
            {error && !loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-[1000]">
                <p className="text-sm text-gray-500">⚠️ Harta nuk u ngarkua.</p>
              </div>
            )}
          </div>

          {/* Sidebar — fixed width, scrollable */}
          <div className="w-72 shrink-0 border-l border-gray-100 flex flex-col overflow-hidden bg-white">

            {/* Loading skeleton */}
            {loading && (
              <div className="p-3 space-y-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            )}

            {/* Category list */}
            {data && (
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {sortedCats.map(([key, cat]) => (
                  <CategoryEntry
                    key={key}
                    catKey={key}
                    cat={cat}
                    active={activeKeys.has(key)}
                    onToggle={() => toggle(key)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-gray-400 leading-relaxed px-1">
        Ne ofrojmë këto të dhëna për t&apos;ju ndihmuar të merrni vendime më të informuara. Largësitë, çmimet
        dhe vlerësimet janë llogaritur automatikisht nga të dhënat e OpenStreetMap dhe mund të ndryshojnë.
        Vendimi final duhet të bazohet gjithmonë në vlerësimin tuaj personal.
      </p>
    </div>
  );
}
