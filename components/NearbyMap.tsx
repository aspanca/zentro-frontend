'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface POIResult {
  name: string;
  distance: number;
  walkMinutes: number;
  driveMinutes: number;
  lat: number;
  lng: number;
}

export interface CategoryResult {
  label: string;
  emoji: string;
  mode: 'walk' | 'drive';
  count: number;
  nearest: POIResult | null;
  items: POIResult[];
}

export interface NearbyResponse {
  coordinates: { lat: number; lng: number };
  geocodedAddress: string;
  radiusMeters: number;
  categories: Record<string, CategoryResult>;
}

// ─── Category color palette ───────────────────────────────────────────────────

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

// ─── Icon factories (pure L.divIcon – no image file issues) ──────────────────

function pinIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
    html: `
      <div style="
        width:36px;height:36px;
        background:#dc2626;
        border:3px solid #fff;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 2px 8px rgba(0,0,0,.5);
      "></div>`,
  });
}

function poiIcon(emoji: string, color: string, isNearest: boolean): L.DivIcon {
  const size = isNearest ? 34 : 26;
  const border = isNearest ? '3px solid #fff' : '2px solid rgba(255,255,255,.6)';
  const shadow = isNearest
    ? '0 0 0 2px ' + color + ', 0 3px 10px rgba(0,0,0,.5)'
    : '0 2px 6px rgba(0,0,0,.4)';
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
    html: `
      <div style="
        width:${size}px;height:${size}px;
        background:${color};
        border-radius:50%;
        border:${border};
        box-shadow:${shadow};
        display:flex;align-items:center;justify-content:center;
        font-size:${isNearest ? 16 : 12}px;
        line-height:1;
      ">${emoji}</div>`,
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function distLabel(m: number) {
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  result: NearbyResponse | null;
  loading: boolean;
  onPin: (lat: number, lng: number) => void;
  radius: number;
  activeCategories: Set<string>;
}

export default function NearbyMap({ result, loading, onPin, radius, activeCategories }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pinMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const poiLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Init map once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [42.6629, 21.1655], // Prishtina
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Click to drop pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      onPin(e.latlng.lat, e.latlng.lng);
    });

    poiLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Force Leaflet to recalculate tile layout after React finishes painting
    setTimeout(() => map.invalidateSize(), 100);
    setMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update pin + radius circle when result changes
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    // Remove old pin + circle
    pinMarkerRef.current?.remove();
    radiusCircleRef.current?.remove();

    if (result) {
      const { lat, lng } = result.coordinates;

      pinMarkerRef.current = L.marker([lat, lng], { icon: pinIcon(), zIndexOffset: 1000 })
        .bindPopup(`<b>📍 Pika juaj</b><br/><small>${result.geocodedAddress}</small>`)
        .addTo(map);

      radiusCircleRef.current = L.circle([lat, lng], {
        radius,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.06,
        weight: 1.5,
        dashArray: '6 4',
      }).addTo(map);

      map.setView([lat, lng], 15, { animate: true });
    }
  }, [result, mapReady, radius]);

  // Update POI markers when result or activeCategories changes
  useEffect(() => {
    if (!mapReady || !poiLayerRef.current) return;
    const layer = poiLayerRef.current;
    layer.clearLayers();

    if (!result) return;

    for (const [catKey, cat] of Object.entries(result.categories)) {
      if (!activeCategories.has(catKey)) continue;
      const color = CAT_COLORS[catKey] ?? '#94a3b8';

      cat.items.forEach((poi, idx) => {
        const isNearest = idx === 0;
        const marker = L.marker([poi.lat, poi.lng], {
          icon: poiIcon(cat.emoji, color, isNearest),
          zIndexOffset: isNearest ? 500 : 0,
        });

        const timeStr =
          cat.mode === 'walk'
            ? `🚶 ${poi.walkMinutes} min në këmbë`
            : `🚗 ${poi.driveMinutes} min me makinë`;

        marker.bindPopup(`
          <div style="min-width:160px;font-family:sans-serif">
            <div style="font-weight:700;font-size:13px;margin-bottom:4px">${cat.emoji} ${poi.name}</div>
            <div style="color:#6b7280;font-size:12px">${cat.label}</div>
            <hr style="margin:6px 0;border-color:#e5e7eb"/>
            <div style="font-size:12px;line-height:1.6">
              📏 ${distLabel(poi.distance)}<br/>
              ${timeStr}${isNearest ? '<br/><span style="color:#10b981;font-size:11px;font-weight:600">★ Më afërt</span>' : ''}
            </div>
          </div>
        `);

        layer.addLayer(marker);
      });
    }
  }, [result, activeCategories, mapReady]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Instruction overlay — shown before first pin */}
      {!result && !loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4 text-center max-w-xs">
            <p className="text-3xl mb-2">📍</p>
            <p className="text-white font-semibold text-sm">Kliko çfarëdo vendi në hartë</p>
            <p className="text-gray-400 text-xs mt-1">
              Shërbime afër do të shfaqen automatikisht
            </p>
          </div>
        </div>
      )}

      {/* Loading spinner overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-[1000]">
          <div className="bg-gray-900 border border-white/10 rounded-2xl px-8 py-6 text-center">
            <div className="w-10 h-10 border-3 border-white/20 border-t-emerald-400 rounded-full animate-spin mx-auto mb-3" style={{ borderWidth: '3px' }} />
            <p className="text-white text-sm font-medium">Duke kërkuar shërbime…</p>
            <p className="text-gray-400 text-xs mt-1">Overpass API · OpenStreetMap</p>
          </div>
        </div>
      )}
    </div>
  );
}
