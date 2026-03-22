'use client';

import { useEffect, useState } from 'react';
import { usePropertyStore, defaultFilters } from '@/lib/store';
import { FilterState, ListingType, PropertyCategory, Orientation } from '@/types';
import { useOptions } from '@/lib/useOptions';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Chip({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`touch-manipulation max-w-full rounded-full border px-3 py-2 text-left text-sm font-medium break-words whitespace-normal transition-all sm:py-1.5 sm:whitespace-nowrap ${
        active
          ? 'border-rose-500 bg-rose-500 text-white'
          : 'border-gray-200 bg-white text-gray-600 hover:border-rose-300 hover:text-rose-500'
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
              className={`touch-manipulation flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold transition-all sm:h-10 sm:w-10 ${
                active ? 'border-rose-500 bg-rose-500 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-rose-300'
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
  n += filters.orientation.length;
  n += filters.furnishing.length;
  n += filters.heating.length;
  n += filters.extras.length;
  return n;
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { open: boolean; onClose: () => void }

export default function FilterSheet({ open, onClose }: Props) {
  const { filters, setFilter, toggleArrayFilter, resetFilters } = usePropertyStore();
  const { cities, heatingOptions, amenities } = useOptions();

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

  // heating + extras come from DB via useOptions()

  const ORIENTATIONS: { value: Orientation; label: string }[] = [
    { value: 'east',  label: 'Lindje' },
    { value: 'west',  label: 'Perëndim' },
    { value: 'north', label: 'Veri' },
    { value: 'south', label: 'Jug' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center md:items-center md:p-4">
      {/* Backdrop — min-h covers iOS URL bar resize gaps */}
      <div
        className="absolute inset-0 min-h-[100dvh] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel — min-h-0 + flex-1 scroll fixes iOS/Android sheet scroll */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sheet-title"
        className="relative z-10 flex max-h-[92dvh] w-full max-w-full min-h-0 flex-col rounded-t-2xl bg-white shadow-2xl md:max-h-[min(90dvh,56rem)] md:max-w-lg md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pb-1 pt-[max(0.75rem,env(safe-area-inset-top))] md:hidden">
          <div className="h-1.5 w-10 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-5 py-3 md:py-4">
          <h2 id="filter-sheet-title" className="text-lg font-bold text-gray-900">Filtrat</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 [touch-action:pan-y] [-webkit-overflow-scrolling:touch]">

            {/* Listing type */}
            <Section title="Lloji i listimit">
              <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
                {([['', 'Të gjitha'], ['sale', 'Shitje'], ['rent', 'Qira']] as [ListingType | '', string][]).map(([val, label]) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setD('listingType', val)}
                    className={`touch-manipulation min-h-[44px] flex-1 rounded-lg px-1 py-2 text-center text-xs font-semibold transition-all sm:text-sm ${
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
                  className="min-h-[44px] w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 md:text-sm"
                  style={{ backgroundImage: 'none' }}
                >
                  <option value="">Të gjitha qytetet</option>
                  {cities.map((c) => <option key={c.slug} value={c.name}>{c.icon} {c.name}</option>)}
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
                  type="number" inputMode="numeric" placeholder="Min" value={draft.minPrice}
                  onChange={(e) => setD('minPrice', e.target.value ? Number(e.target.value) : '')}
                  className="min-h-[44px] rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 md:text-sm"
                />
                <input
                  type="number" inputMode="numeric" placeholder="Max" value={draft.maxPrice}
                  onChange={(e) => setD('maxPrice', e.target.value ? Number(e.target.value) : '')}
                  className="min-h-[44px] rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 md:text-sm"
                />
              </div>
            </Section>

            {/* Size */}
            <Section title="Sipërfaqja (m²)">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number" inputMode="numeric" placeholder="Min" value={draft.minSize}
                  onChange={(e) => setD('minSize', e.target.value ? Number(e.target.value) : '')}
                  className="min-h-[44px] rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 md:text-sm"
                />
                <input
                  type="number" inputMode="numeric" placeholder="Max" value={draft.maxSize}
                  onChange={(e) => setD('maxSize', e.target.value ? Number(e.target.value) : '')}
                  className="min-h-[44px] rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 md:text-sm"
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

            {/* Orientation (multi-select) */}
            <Section title="Orientimi">
              <div className="flex flex-wrap gap-2">
                {ORIENTATIONS.map(({ value, label }) => {
                  const sel = draft.orientation ?? [];
                  const active = sel.includes(value);
                  return (
                    <Chip key={value} label={label} active={active}
                      onClick={() => setD('orientation', active ? sel.filter((v: string) => v !== value) : [...sel, value])} />
                  );
                })}
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
            {heatingOptions.length > 0 && (
              <Section title="Sistemi i ngrohjes">
                <div className="flex flex-wrap gap-2">
                  {heatingOptions.map((opt) => (
                    <Chip
                      key={opt.slug} label={`${opt.icon} ${opt.name}`}
                      active={(draft.heating as string[]).includes(opt.slug)}
                      onClick={() => setDraft((d) => {
                        const cur = d.heating as string[];
                        return { ...d, heating: cur.includes(opt.slug) ? cur.filter((v) => v !== opt.slug) : [...cur, opt.slug] };
                      })}
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* Extras */}
            {amenities.length > 0 && (
              <Section title="Të tjera">
                <div className="flex flex-wrap gap-2">
                  {amenities.map((opt) => (
                    <Chip
                      key={opt.slug} label={`${opt.icon} ${opt.name}`}
                      active={(draft.extras as string[]).includes(opt.slug)}
                      onClick={() => setDraft((d) => {
                        const cur = d.extras as string[];
                        return { ...d, extras: cur.includes(opt.slug) ? cur.filter((v) => v !== opt.slug) : [...cur, opt.slug] };
                      })}
                    />
                  ))}
                </div>
              </Section>
            )}

          </div>

          {/* Footer — safe-area for home indicator / gesture bar */}
          <div className="flex flex-shrink-0 gap-3 border-t border-gray-100 bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:rounded-b-2xl">
            <button
              type="button"
              onClick={clearAll}
              className="touch-manipulation min-h-[48px] flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              Pastro filtrat
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="touch-manipulation min-h-[48px] flex-1 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
            >
              Kërko
            </button>
          </div>
      </div>
    </div>
  );
}
