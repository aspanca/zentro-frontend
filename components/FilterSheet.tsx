'use client';

import { useEffect, useState } from 'react';
import { usePropertyStore, defaultFilters } from '@/lib/store';
import { FilterState, ListingType, PropertyCategory, Orientation } from '@/types';
import { KOSOVO_CITIES } from '@/lib/mockData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Chip({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-rose-500 border-rose-500 text-white'
          : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-500'
      }`}
    >
      {label}
    </button>
  );
}

function NumberRow({
  label, options, value, onChange,
}: { label: string; options: (number | 'all')[]; value: number | ''; onChange: (v: number | '') => void }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isAll = opt === 'all';
          const active = isAll ? value === '' : value === opt;
          return (
            <button
              key={String(opt)}
              type="button"
              onClick={() => onChange(isAll ? '' : (opt as number))}
              className={`w-10 h-10 rounded-xl border text-sm font-semibold transition-all ${
                active ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-rose-300'
              }`}
            >
              {isAll ? 'Të g.' : opt === 6 ? '6+' : opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-5 border-b border-gray-100 last:border-0">
      <p className="text-sm font-bold text-gray-900 mb-3">{title}</p>
      {children}
    </div>
  );
}

// ─── Active filter count ──────────────────────────────────────────────────────

export function activeFilterCount(filters: FilterState) {
  let n = 0;
  if (filters.listingType)    n++;
  if (filters.category)       n++;
  if (filters.city)           n++;
  if (filters.minPrice !== '' || filters.maxPrice !== '') n++;
  if (filters.minSize  !== '' || filters.maxSize  !== '') n++;
  if (filters.bedrooms !== '') n++;
  if (filters.bathrooms !== '') n++;
  if (filters.orientation)    n++;
  n += filters.furnishing.length;
  n += filters.heating.length;
  n += filters.extras.length;
  return n;
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { open: boolean; onClose: () => void }

export default function FilterSheet({ open, onClose }: Props) {
  const { filters, setFilter, toggleArrayFilter, resetFilters } = usePropertyStore();

  // Local draft — only apply on "Kërko" click
  const [draft, setDraft] = useState<FilterState>(filters);

  useEffect(() => { if (open) setDraft(filters); }, [open, filters]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  function setD<K extends keyof FilterState>(key: K, val: FilterState[K]) {
    setDraft((d) => ({ ...d, [key]: val }));
  }

  function toggleArr(key: 'furnishing' | 'heating' | 'extras', val: string) {
    setDraft((d) => {
      const cur = d[key] as string[];
      return { ...d, [key]: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val] };
    });
  }

  function applyFilters() {
    Object.entries(draft).forEach(([k, v]) => setFilter(k as keyof FilterState, v as never));
    onClose();
  }

  function clearAll() {
    setDraft(defaultFilters);
    resetFilters();
  }

  if (!open) return null;

  const CATEGORIES: { value: PropertyCategory; label: string; icon: string }[] = [
    { value: 'apartment',  label: 'Banesë',  icon: '🏢' },
    { value: 'house',      label: 'Shtëpi',  icon: '🏡' },
    { value: 'office',     label: 'Zyrë',    icon: '🏬' },
    { value: 'store',      label: 'Dyqan',   icon: '🛒' },
    { value: 'land',       label: 'Tokë',    icon: '🌿' },
    { value: 'object',     label: 'Objekt',  icon: '🏗️' },
    { value: 'warehouse',  label: 'Depo',    icon: '🏭' },
    { value: 'business',   label: 'Biznes',  icon: '💼' },
  ];

  const FURNISHINGS = [
    { value: 'living_room', label: 'Dhoma ndenje' },
    { value: 'kitchen',     label: 'Kuzhinë' },
    { value: 'bathroom',    label: 'Banjë' },
    { value: 'bedroom',     label: 'Dhomë gjumi' },
    { value: 'wc',          label: 'WC' },
    { value: 'unfurnished', label: 'Pa mobilim' },
  ];

  const HEATINGS = [
    { value: 'wood',     label: 'Dru' },
    { value: 'pellet',   label: 'Pellet' },
    { value: 'gas',      label: 'Gaz' },
    { value: 'keds',     label: 'KEDS' },
    { value: 'termokos', label: 'Termokos' },
    { value: 'oil',      label: 'Mazut' },
  ];

  const EXTRAS = [
    { value: 'elevator',         label: 'Ashensor' },
    { value: 'garage',           label: 'Garazh' },
    { value: 'parking',          label: 'Parking' },
    { value: 'air_conditioning', label: 'Klimë' },
    { value: 'tv',               label: 'TV' },
    { value: 'internet',         label: 'Internet' },
    { value: 'storage',          label: 'Depo' },
  ];

  const ORIENTATIONS: { value: Orientation; label: string }[] = [
    { value: 'east',  label: 'Lindje' },
    { value: 'west',  label: 'Perëndim' },
    { value: 'north', label: 'Veri' },
    { value: 'south', label: 'Jug' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet — slides up from bottom on mobile, centered modal on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center md:p-4">
        <div className="bg-white md:rounded-2xl md:shadow-2xl w-full md:max-w-lg md:max-h-[90vh] rounded-t-2xl shadow-2xl flex flex-col max-h-[92vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900">Filtrat</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5">

            {/* Listing type */}
            <Section title="Lloji i listimit">
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                {([['', 'Të gjitha'], ['sale', 'Shitje'], ['rent', 'Qira']] as [ListingType | '', string][]).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setD('listingType', val)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      draft.listingType === val
                        ? 'bg-white text-rose-500 shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Section>

            {/* Category */}
            <Section title="Kategoria">
              <div className="flex flex-wrap gap-2">
                <Chip label="Të gjitha" active={draft.category === ''} onClick={() => setD('category', '')} />
                {CATEGORIES.map(({ value, label, icon }) => (
                  <Chip
                    key={value}
                    label={`${icon} ${label}`}
                    active={draft.category === value}
                    onClick={() => setD('category', draft.category === value ? '' : value)}
                  />
                ))}
              </div>
            </Section>

            {/* City */}
            <Section title="Qyteti">
              <div className="relative">
                <select
                  value={draft.city}
                  onChange={(e) => setD('city', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                  style={{ backgroundImage: 'none' }}
                >
                  <option value="">Të gjitha qytetet</option>
                  {KOSOVO_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </Section>

            {/* Price */}
            <Section title="Çmimi (€)">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number" placeholder="Min" value={draft.minPrice}
                  onChange={(e) => setD('minPrice', e.target.value ? Number(e.target.value) : '')}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <input
                  type="number" placeholder="Max" value={draft.maxPrice}
                  onChange={(e) => setD('maxPrice', e.target.value ? Number(e.target.value) : '')}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </Section>

            {/* Size */}
            <Section title="Sipërfaqja (m²)">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number" placeholder="Min" value={draft.minSize}
                  onChange={(e) => setD('minSize', e.target.value ? Number(e.target.value) : '')}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <input
                  type="number" placeholder="Max" value={draft.maxSize}
                  onChange={(e) => setD('maxSize', e.target.value ? Number(e.target.value) : '')}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </Section>

            {/* Bedrooms / bathrooms */}
            <Section title="Dhoma & Banja">
              <div className="space-y-4">
                <NumberRow
                  label="Dhoma gjumi"
                  options={['all', 1, 2, 3, 4, 5, 6]}
                  value={draft.bedrooms}
                  onChange={(v) => setD('bedrooms', v)}
                />
                <NumberRow
                  label="Banjo"
                  options={['all', 1, 2, 3, 4, 5]}
                  value={draft.bathrooms}
                  onChange={(v) => setD('bathrooms', v)}
                />
              </div>
            </Section>

            {/* Orientation */}
            <Section title="Orientimi">
              <div className="flex flex-wrap gap-2">
                <Chip label="Të gjitha" active={draft.orientation === ''} onClick={() => setD('orientation', '')} />
                {ORIENTATIONS.map(({ value, label }) => (
                  <Chip key={value} label={label} active={draft.orientation === value} onClick={() => setD('orientation', draft.orientation === value ? '' : value)} />
                ))}
              </div>
            </Section>

            {/* Furnishing */}
            <Section title="Mobilimi">
              <div className="flex flex-wrap gap-2">
                {FURNISHINGS.map(({ value, label }) => (
                  <Chip
                    key={value} label={label}
                    active={(draft.furnishing as string[]).includes(value)}
                    onClick={() => setDraft((d) => {
                      const cur = d.furnishing as string[];
                      return { ...d, furnishing: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
                    })}
                  />
                ))}
              </div>
            </Section>

            {/* Heating */}
            <Section title="Sistemi i ngrohjes">
              <div className="flex flex-wrap gap-2">
                {HEATINGS.map(({ value, label }) => (
                  <Chip
                    key={value} label={label}
                    active={(draft.heating as string[]).includes(value)}
                    onClick={() => setDraft((d) => {
                      const cur = d.heating as string[];
                      return { ...d, heating: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
                    })}
                  />
                ))}
              </div>
            </Section>

            {/* Extras */}
            <Section title="Të tjera">
              <div className="flex flex-wrap gap-2">
                {EXTRAS.map(({ value, label }) => (
                  <Chip
                    key={value} label={label}
                    active={(draft.extras as string[]).includes(value)}
                    onClick={() => setDraft((d) => {
                      const cur = d.extras as string[];
                      return { ...d, extras: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
                    })}
                  />
                ))}
              </div>
            </Section>

          </div>

          {/* Footer */}
          <div className="flex gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Pastro filtrat
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Kërko
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
