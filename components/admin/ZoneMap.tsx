'use client';

import {
  MapContainer, TileLayer, Polygon, Polyline, CircleMarker,
  Tooltip, Marker, useMapEvents, useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type ZoneType = 'high_traffic' | 'construction' | 'price_zone';

export interface ZoneRow {
  id: number;
  name: string;
  type: ZoneType;
  coordinates: [number, number][];
  color: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  isActive: boolean;
}

const TYPE_DEFAULTS: Record<ZoneType, { color: string; label: string; icon: string }> = {
  high_traffic: { color: '#ef4444', label: 'Trafik i lartë',     icon: '🚦' },
  construction: { color: '#f59e0b', label: 'Ndërtim në progres', icon: '🏗️' },
  price_zone:   { color: '#3b82f6', label: 'Zonë çmimesh',       icon: '💰' },
};

function zoneColor(z: ZoneRow) { return z.color ?? TYPE_DEFAULTS[z.type].color; }

// Numbered vertex icon for the drawing layer
function vertexIcon(n: number, isFirst: boolean, canClose: boolean) {
  const size  = isFirst && canClose ? 28 : 22;
  const half  = size / 2;
  const pulse = isFirst && canClose
    ? `<div style="
        position:absolute;inset:-6px;border-radius:50%;
        border:2px solid #22c55e;opacity:0.6;
        animation:zp 1.2s ease-out infinite;
      "></div>
      <style>@keyframes zp{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.8);opacity:0}}</style>`
    : '';

  return L.divIcon({
    className: '',
    iconSize:   [size, size],
    iconAnchor: [half, half],
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      ${pulse}
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:${isFirst ? '#22c55e' : '#6366f1'};
        border:2.5px solid #fff;
        box-shadow:0 1px 6px rgba(0,0,0,.5);
        display:flex;align-items:center;justify-content:center;
        color:#fff;font-size:${isFirst && canClose ? 10 : 9}px;font-weight:700;
        cursor:${isFirst && canClose ? 'pointer' : 'crosshair'};
      ">${n}</div>
    </div>`,
  });
}

// ─── Drawing layer — handles clicks, mouse move, renders in-progress polygon ──

const CLOSE_PX = 16; // pixel radius to snap-close the polygon

function DrawLayer({
  active, points, onAddPoint, onMovePoint, onClose,
}: {
  active: boolean;
  points: [number, number][];
  onAddPoint: (p: [number, number]) => void;
  onMovePoint: (p: [number, number] | null) => void;
  onClose: () => void;
}) {
  const map = useMap();

  useMapEvents({
    click(e) {
      if (!active) return;

      // Close polygon when clicking near the first point (≥3 points placed)
      if (points.length >= 3) {
        const firstPx = map.latLngToContainerPoint(L.latLng(points[0][0], points[0][1]));
        const clickPx = map.latLngToContainerPoint(e.latlng);
        const dist = Math.hypot(firstPx.x - clickPx.x, firstPx.y - clickPx.y);
        if (dist <= CLOSE_PX) { onClose(); return; }
      }

      onAddPoint([e.latlng.lat, e.latlng.lng]);
    },
    mousemove(e) { if (active) onMovePoint([e.latlng.lat, e.latlng.lng]); },
    mouseout()   { onMovePoint(null); },
  });
  return null;
}

// ─── Main map component ───────────────────────────────────────────────────────

interface Props {
  zones: ZoneRow[];
  drawing: boolean;
  drawPoints: [number, number][];
  onAddPoint: (p: [number, number]) => void;
  onMovePoint: (p: [number, number] | null) => void;
  onClose: () => void;
  cursorPoint: [number, number] | null;
  onSelectZone: (z: ZoneRow) => void;
  selectedId: number | null;
}

export default function ZoneMap({
  zones, drawing, drawPoints, onAddPoint, onMovePoint, onClose,
  cursorPoint, onSelectZone, selectedId,
}: Props) {
  const KOSOVO_CENTER: [number, number] = [42.6629, 21.1655];

  // Build the preview polyline: all drawn points + cursor
  const previewLine: [number, number][] =
    drawPoints.length > 0 && cursorPoint
      ? [...drawPoints, cursorPoint]
      : drawPoints;

  // Closing line back to first point (preview of close)
  const closingLine: [number, number][] =
    drawPoints.length >= 2 && cursorPoint
      ? [cursorPoint, drawPoints[0]]
      : [];

  return (
    <div className="relative w-full h-full" style={{ cursor: drawing ? 'crosshair' : 'default' }}>
      <MapContainer
        center={KOSOVO_CENTER}
        zoom={12}
        className="w-full h-full"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />

        {/* ── Saved zones ── */}
        {zones.map((z) => (
          <Polygon
            key={z.id}
            positions={z.coordinates}
            pathOptions={{
              color: zoneColor(z),
              fillColor: zoneColor(z),
              weight: selectedId === z.id ? 4 : 2,
              opacity: z.isActive ? 1 : 0.4,
              fillOpacity: z.isActive ? 0.25 : 0.1,
            }}
            eventHandlers={{ click: () => onSelectZone(z) }}
          >
            <Tooltip sticky>
              <span className="font-semibold text-xs">{TYPE_DEFAULTS[z.type].icon} {z.name}</span>
              {z.description && <div className="text-xs text-gray-500 mt-0.5">{z.description}</div>}
              {z.metadata?.avgPrice && <div className="text-xs font-bold text-blue-600 mt-0.5">€{String(z.metadata.avgPrice)}/m²</div>}
            </Tooltip>
          </Polygon>
        ))}

        {/* ── In-progress drawing ── */}
        {drawing && (
          <>
            {/* Filled preview polygon (semi-transparent) */}
            {previewLine.length >= 3 && (
              <Polygon
                positions={previewLine}
                pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.15, weight: 0, interactive: false }}
              />
            )}

            {/* Main path connecting drawn points + cursor */}
            {previewLine.length >= 2 && (
              <Polyline
                positions={previewLine}
                pathOptions={{ color: '#6366f1', weight: 2.5, dashArray: '6 4', interactive: false }}
              />
            )}

            {/* Closing dashed line back to first point */}
            {closingLine.length === 2 && (
              <Polyline
                positions={closingLine}
                pathOptions={{ color: '#6366f1', weight: 1.5, dashArray: '4 6', opacity: 0.5, interactive: false }}
              />
            )}

            {/* Vertex markers with numbers */}
            {drawPoints.map((p, i) => (
              <Marker
                key={i}
                position={p}
                icon={vertexIcon(i + 1, i === 0, drawPoints.length >= 3)}
                interactive={i === 0 && drawPoints.length >= 3}
                eventHandlers={i === 0 && drawPoints.length >= 3 ? { click: (e) => { L.DomEvent.stopPropagation(e); onClose(); } } : {}}
              />
            ))}

            {/* Cursor dot */}
            {cursorPoint && (
              <CircleMarker
                center={cursorPoint}
                radius={5}
                pathOptions={{ color: '#6366f1', fillColor: '#fff', fillOpacity: 1, weight: 2, interactive: false }}
              />
            )}
          </>
        )}

        {/* Event capture layer */}
        <DrawLayer
          active={drawing}
          points={drawPoints}
          onAddPoint={onAddPoint}
          onMovePoint={onMovePoint}
          onClose={onClose}
        />
      </MapContainer>

      {/* Drawing hint bar */}
      {drawing && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 bg-gray-900/90 backdrop-blur text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-xl pointer-events-none border border-indigo-500/40">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse flex-shrink-0" />
          {drawPoints.length === 0
            ? 'Kliko hartën për të filluar poligonin'
            : drawPoints.length === 1
            ? '1 pikë — vazhdo të klikosh'
            : drawPoints.length === 2
            ? '2 pikë — duhen të paktën 3'
            : `${drawPoints.length} pikë — kliko pikën e parë 🟢 për të mbyllur`}
        </div>
      )}
    </div>
  );
}
