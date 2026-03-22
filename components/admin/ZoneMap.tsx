'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, useMapEvents } from 'react-leaflet';
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

const TYPE_DEFAULTS: Record<ZoneType, { color: string; fill: string; label: string; icon: string }> = {
  high_traffic: { color: '#ef4444', fill: '#ef444440', label: 'Trafik i lartë',        icon: '🚦' },
  construction: { color: '#f59e0b', fill: '#f59e0b40', label: 'Ndërtim në progres',    icon: '🏗️' },
  price_zone:   { color: '#3b82f6', fill: '#3b82f640', label: 'Zonë çmimesh',          icon: '💰' },
};

function zoneColor(z: ZoneRow) {
  return z.color ?? TYPE_DEFAULTS[z.type].color;
}
function zoneFill(z: ZoneRow) {
  const c = z.color ?? TYPE_DEFAULTS[z.type].color;
  return c + '40';
}

// ─── Click-to-draw layer ───────────────────────────────────────────────────────

function DrawLayer({
  active,
  points,
  onAddPoint,
}: {
  active: boolean;
  points: [number, number][];
  onAddPoint: (p: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      if (!active) return;
      onAddPoint([e.latlng.lat, e.latlng.lng]);
    },
  });

  if (points.length < 2) return null;

  return (
    <Polygon
      positions={points}
      pathOptions={{ color: '#6366f1', fillColor: '#6366f130', weight: 2, dashArray: '6 4' }}
    />
  );
}

// ─── Main map component ───────────────────────────────────────────────────────

interface Props {
  zones: ZoneRow[];
  drawing: boolean;
  drawPoints: [number, number][];
  onAddPoint: (p: [number, number]) => void;
  onSelectZone: (z: ZoneRow) => void;
  selectedId: number | null;
}

export default function ZoneMap({
  zones, drawing, drawPoints, onAddPoint, onSelectZone, selectedId,
}: Props) {
  const KOSOVO_CENTER: [number, number] = [42.6629, 21.1655];

  return (
    <div className="relative w-full h-full" style={{ cursor: drawing ? 'crosshair' : 'default' }}>
      <MapContainer
        center={KOSOVO_CENTER}
        zoom={11}
        className="w-full h-full"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />

        {/* Existing zones */}
        {zones.map((z) => (
          <Polygon
            key={z.id}
            positions={z.coordinates}
            pathOptions={{
              color: zoneColor(z),
              fillColor: zoneFill(z),
              weight: selectedId === z.id ? 3 : 2,
              opacity: z.isActive ? 1 : 0.4,
              fillOpacity: z.isActive ? 0.35 : 0.15,
            }}
            eventHandlers={{ click: () => onSelectZone(z) }}
          >
            <Tooltip sticky>
              <div className="text-xs font-semibold">
                {TYPE_DEFAULTS[z.type].icon} {z.name}
              </div>
              {z.description && <div className="text-xs text-gray-600 mt-0.5">{z.description}</div>}
              {z.metadata?.avgPrice && (
                <div className="text-xs font-bold mt-0.5">€{String(z.metadata.avgPrice)}/m²</div>
              )}
            </Tooltip>
          </Polygon>
        ))}

        {/* In-progress drawing polygon */}
        <DrawLayer active={drawing} points={drawPoints} onAddPoint={onAddPoint} />
      </MapContainer>

      {/* Drawing hint */}
      {drawing && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg pointer-events-none">
          {drawPoints.length === 0
            ? 'Kliko hartën për të shtuar pikat e poligonit'
            : `${drawPoints.length} pikë — Shto më shumë ose kliko "Mbaro"`}
        </div>
      )}
    </div>
  );
}
