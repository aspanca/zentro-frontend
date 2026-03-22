'use client';

import { useState } from 'react';
import {
  MapContainer, TileLayer, Polygon, Polyline, CircleMarker,
  Tooltip, Marker, useMapEvents,
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
function vertexIcon(n: number, isFirst: boolean) {
  return L.divIcon({
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: `<div style="
      width:22px;height:22px;border-radius:50%;
      background:${isFirst ? '#22c55e' : '#6366f1'};
      border:2.5px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,.5);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-size:9px;font-weight:700;line-height:1;
    ">${n}</div>`,
  });
}

// ─── Drawing layer — handles clicks, mouse move, renders in-progress polygon ──

function DrawLayer({
  active, points, onAddPoint, onMovePoint,
}: {
  active: boolean;
  points: [number, number][];
  onAddPoint: (p: [number, number]) => void;
  onMovePoint: (p: [number, number] | null) => void;
}) {
  useMapEvents({
    click(e) { if (active) onAddPoint([e.latlng.lat, e.latlng.lng]); },
    mousemove(e) { if (active) onMovePoint([e.latlng.lat, e.latlng.lng]); },
    mouseout() { onMovePoint(null); },
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
  cursorPoint: [number, number] | null;
  onSelectZone: (z: ZoneRow) => void;
  selectedId: number | null;
}

export default function ZoneMap({
  zones, drawing, drawPoints, onAddPoint, onMovePoint,
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
                icon={vertexIcon(i + 1, i === 0)}
                interactive={false}
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
            : `${drawPoints.length} pikë — kliko "Mbaro" ose vazhdo`}
        </div>
      )}
    </div>
  );
}
