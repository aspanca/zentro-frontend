'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER: [number, number] = [42.6629, 21.1655];

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onChange(e.latlng.lat, e.latlng.lng); } });
  return null;
}

function MapContent({ lat, lng, onChange }: Props) {
  return (
    <MapContainer
      center={lat && lng ? [lat, lng] : DEFAULT_CENTER}
      zoom={lat && lng ? 14 : 9}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onChange={onChange} />
      {lat && lng && <Marker position={[lat, lng]} />}
    </MapContainer>
  );
}

export default function LocationPicker({ lat, lng, onChange }: Props) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      {/* Inline compact map */}
      <div className="relative rounded-xl overflow-hidden border border-gray-200" style={{ height: 240 }}>
        <MapContent lat={lat} lng={lng} onChange={onChange} />
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          title="Zgjero hartën"
          className="absolute top-2 right-2 z-[400] bg-white border border-gray-200 shadow rounded-lg p-1.5 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl" style={{ height: '80vh' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">
                {lat && lng
                  ? `Lokacioni: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
                  : 'Kliko mbi hartë për të vendosur lokacionin'}
              </p>
              <div className="flex items-center gap-2">
                {lat && lng && (
                  <button
                    type="button"
                    onClick={() => onChange(0, 0)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Pastro
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFullscreen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Full map */}
            <div style={{ height: 'calc(100% - 53px)' }}>
              <MapContent lat={lat} lng={lng} onChange={onChange} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
