'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAdminStore } from '@/lib/store';
import { ZoneType, ZoneRow } from '@/components/admin/ZoneMap';

const ZoneMap = dynamic(() => import('@/components/admin/ZoneMap'), { ssr: false });

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

const TYPE_META: Record<ZoneType, { label: string; icon: string; color: string; bg: string }> = {
  high_traffic: { label: 'Trafik i lartë',     icon: '🚦', color: 'text-red-400',    bg: 'bg-red-500/20 border-red-500/30' },
  construction: { label: 'Ndërtim në progres', icon: '🏗️', color: 'text-amber-400',  bg: 'bg-amber-500/20 border-amber-500/30' },
  price_zone:   { label: 'Zonë çmimesh',       icon: '💰', color: 'text-blue-400',   bg: 'bg-blue-500/20 border-blue-500/30' },
};

const BLANK_FORM = {
  name: '',
  type: 'high_traffic' as ZoneType,
  description: '',
  color: '',
  avgPrice: '',
};

export default function ZonesPage() {
  const { adminToken } = useAdminStore();
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` };

  const [zones, setZones]           = useState<ZoneRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [drawing, setDrawing]       = useState(false);
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);
  const [cursorPoint, setCursorPoint] = useState<[number, number] | null>(null);
  const [form, setForm]             = useState({ ...BLANK_FORM });
  const [panelMode, setPanelMode]   = useState<'list' | 'new' | 'edit'>('list');
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [filter, setFilter]         = useState<ZoneType | 'all'>('all');

  const load = useCallback(async () => {
    const res = await fetch(`${API}/api/admin/zones`, { headers });
    const data = await res.json();
    setZones(Array.isArray(data) ? data : []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken]);

  useEffect(() => { load(); }, [load]);

  const selectedZone = zones.find((z) => z.id === selectedId) ?? null;

  const startNew = () => {
    setForm({ ...BLANK_FORM });
    setDrawPoints([]);
    setDrawing(true);
    setSelectedId(null);
    setPanelMode('new');
    setError('');
  };

  const cancelDraw = () => {
    setDrawing(false);
    setDrawPoints([]);
    setCursorPoint(null);
    setPanelMode('list');
    setError('');
  };

  const handleAddPoint = (p: [number, number]) => {
    setDrawPoints((prev) => [...prev, p]);
  };

  const undoLastPoint = () => {
    setDrawPoints((prev) => prev.slice(0, -1));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Emri është i detyrueshëm.'); return; }
    if (drawPoints.length < 3) { setError('Poligoni duhet të ketë të paktën 3 pika.'); return; }
    setSaving(true);
    setError('');
    try {
      const metadata = form.avgPrice ? { avgPrice: Number(form.avgPrice), unit: 'EUR/m²' } : {};
      const body = {
        name: form.name,
        type: form.type,
        coordinates: drawPoints,
        color: form.color || null,
        description: form.description || null,
        metadata,
      };
      const res = await fetch(`${API}/api/admin/zones`, {
        method: 'POST', headers, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Dështoi.'); return; }
      await load();
      setDrawing(false);
      setDrawPoints([]);
      setCursorPoint(null);
      setPanelMode('list');
      setForm({ ...BLANK_FORM });
    } catch { setError('Gabim rrjeti.'); }
    finally { setSaving(false); }
  };

  const handleEdit = (z: ZoneRow) => {
    setSelectedId(z.id);
    setForm({
      name: z.name,
      type: z.type,
      description: z.description ?? '',
      color: z.color ?? '',
      avgPrice: z.metadata?.avgPrice ? String(z.metadata.avgPrice) : '',
    });
    setPanelMode('edit');
    setError('');
    setDrawing(false);
    setDrawPoints([]);
  };

  const handleUpdate = async () => {
    if (!selectedZone || !form.name.trim()) { setError('Emri është i detyrueshëm.'); return; }
    setSaving(true);
    setError('');
    try {
      const metadata = form.avgPrice ? { avgPrice: Number(form.avgPrice), unit: 'EUR/m²' } : {};
      const res = await fetch(`${API}/api/admin/zones/${selectedZone.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: form.name, type: form.type,
          description: form.description || null, color: form.color || null, metadata,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Dështoi.'); return; }
      await load();
      setPanelMode('list');
    } catch { setError('Gabim rrjeti.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Fshi këtë zonë?')) return;
    await fetch(`${API}/api/admin/zones/${id}`, { method: 'DELETE', headers });
    await load();
    if (selectedId === id) { setSelectedId(null); setPanelMode('list'); }
  };

  const handleToggleActive = async (z: ZoneRow) => {
    await fetch(`${API}/api/admin/zones/${z.id}`, {
      method: 'PUT', headers,
      body: JSON.stringify({ ...z, isActive: !z.isActive }),
    });
    await load();
  };

  const visibleZones = filter === 'all' ? zones : zones.filter((z) => z.type === filter);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8">

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white">Zonat e hartës</h1>
          <span className="text-gray-600 text-sm">{zones.length} zona</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Type filter pills */}
          <div className="hidden sm:flex items-center gap-1.5">
            {(['all', 'high_traffic', 'construction', 'price_zone'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                  filter === t ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {t === 'all' ? 'Të gjitha' : `${TYPE_META[t].icon} ${TYPE_META[t].label}`}
              </button>
            ))}
          </div>
          {!drawing && panelMode !== 'new' && (
            <button
              onClick={startNew}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Shto zonë
            </button>
          )}
        </div>
      </div>

      {/* Body: sidebar + map */}
      <div className="flex flex-1 min-h-0">

        {/* ── Left panel ──────────────────────────────────────────────── */}
        <div className="w-72 xl:w-80 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col overflow-hidden">

          {/* New / Edit form */}
          {(panelMode === 'new' || panelMode === 'edit') && (
            <div className="p-4 border-b border-gray-800 flex-shrink-0 overflow-y-auto max-h-[60vh]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">
                  {panelMode === 'new' ? '🖊️ Zonë e re' : '✏️ Ndrysho zonën'}
                </h3>
                <button onClick={cancelDraw} className="text-gray-600 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && <p className="text-red-400 text-xs mb-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

              <div className="space-y-3">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Emri *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="p.sh. Rruga e Gërmisë"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Lloji</label>
                  <div className="space-y-1.5">
                    {(Object.keys(TYPE_META) as ZoneType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, type: t }))}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors ${
                          form.type === t ? TYPE_META[t].bg + ' ' + TYPE_META[t].color : 'border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <span>{TYPE_META[t].icon}</span>
                        <span className="font-medium">{TYPE_META[t].label}</span>
                        {form.type === t && (
                          <svg className="w-3.5 h-3.5 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Përshkrimi</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={2}
                    placeholder="Shënim opsional…"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                  />
                </div>

                {/* Avg price (for price zones) */}
                {form.type === 'price_zone' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Çmimi mesatar (EUR/m²)</label>
                    <input
                      type="number"
                      value={form.avgPrice}
                      onChange={(e) => setForm((f) => ({ ...f, avgPrice: e.target.value }))}
                      placeholder="p.sh. 850"
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                    />
                  </div>
                )}

                {/* Custom color */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ngjyrë (opsionale)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.color || '#6366f1'}
                      onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                      className="w-8 h-8 rounded-lg border border-gray-700 bg-gray-800 cursor-pointer"
                    />
                    {form.color && (
                      <button onClick={() => setForm((f) => ({ ...f, color: '' }))} className="text-xs text-gray-500 hover:text-gray-300">
                        Hiq ngjyrën
                      </button>
                    )}
                  </div>
                </div>

                {/* Drawing controls (new only) */}
                {panelMode === 'new' && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>Poligoni: {drawPoints.length} pika</span>
                      {drawPoints.length > 0 && (
                        <button onClick={undoLastPoint} className="text-gray-500 hover:text-white transition-colors">
                          ↩ Zhbëj
                        </button>
                      )}
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={saving || drawPoints.length < 3}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      {saving ? 'Duke ruajtur…' : `✓ Mbaro & ruaj poligonin`}
                    </button>
                  </div>
                )}

                {panelMode === 'edit' && (
                  <button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors mt-1"
                  >
                    {saving ? 'Duke ruajtur…' : 'Ruaj ndryshimet'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Zone list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {visibleZones.length === 0 ? (
              <p className="text-gray-600 text-xs text-center py-8">Nuk ka zona.</p>
            ) : visibleZones.map((z) => (
              <div
                key={z.id}
                onClick={() => { setSelectedId(z.id); if (panelMode === 'list') handleEdit(z); }}
                className={`group rounded-xl border p-3 cursor-pointer transition-colors ${
                  selectedId === z.id
                    ? 'border-indigo-500/50 bg-indigo-500/10'
                    : 'border-gray-800 hover:border-gray-700 bg-gray-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-base">{TYPE_META[z.type].icon}</span>
                      <span className="text-white text-sm font-medium truncate">{z.name}</span>
                    </div>
                    <span className={`text-xs font-semibold ${TYPE_META[z.type].color}`}>
                      {TYPE_META[z.type].label}
                    </span>
                    {z.description && (
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{z.description}</p>
                    )}
                    {z.metadata?.avgPrice && (
                      <p className="text-blue-400 text-xs mt-0.5 font-semibold">€{String(z.metadata.avgPrice)}/m²</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleActive(z); }}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                        z.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-500'
                      }`}
                    >
                      {z.isActive ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(z.id); }}
                      className="text-gray-600 hover:text-red-400 p-0.5 rounded transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Map ─────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <ZoneMap
            zones={visibleZones}
            drawing={drawing}
            drawPoints={drawPoints}
            onAddPoint={handleAddPoint}
            onMovePoint={setCursorPoint}
            cursorPoint={cursorPoint}
            onSelectZone={(z) => { setSelectedId(z.id); handleEdit(z); }}
            selectedId={selectedId}
          />
        </div>
      </div>
    </div>
  );
}
