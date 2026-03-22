'use client';

import { useEffect, useState } from 'react';

export interface OptionItem {
  id: number;
  name: string;
  slug: string;
  icon: string;
  isActive: boolean;
}

interface OptionsState {
  cities: OptionItem[];
  heatingOptions: OptionItem[];
  amenities: OptionItem[];
  loading: boolean;
}

// Module-level cache — fetched once, shared across all components
let _cache: OptionsState | null = null;
let _promise: Promise<void> | null = null;
const _listeners: Array<() => void> = [];

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

async function loadAll() {
  try {
    const [cities, heatingOptions, amenities] = await Promise.all([
      fetch(`${API}/api/options/cities`).then((r) => r.json()),
      fetch(`${API}/api/options/heating-options`).then((r) => r.json()),
      fetch(`${API}/api/options/amenities`).then((r) => r.json()),
    ]);
    _cache = {
      cities:         Array.isArray(cities)         ? cities         : [],
      heatingOptions: Array.isArray(heatingOptions) ? heatingOptions : [],
      amenities:      Array.isArray(amenities)      ? amenities      : [],
      loading: false,
    };
  } catch {
    _cache = { cities: [], heatingOptions: [], amenities: [], loading: false };
  }
  _listeners.forEach((fn) => fn());
}

export function useOptions(): OptionsState {
  const [, rerender] = useState(0);

  useEffect(() => {
    if (_cache) return;
    if (!_promise) _promise = loadAll();
    const notify = () => rerender((n) => n + 1);
    _listeners.push(notify);
    _promise.then(() => rerender((n) => n + 1));
    return () => { const i = _listeners.indexOf(notify); if (i >= 0) _listeners.splice(i, 1); };
  }, []);

  return _cache ?? { cities: [], heatingOptions: [], amenities: [], loading: true };
}

/** Build a slug → label map from an OptionItem array */
export function toLabels(items: OptionItem[]): Record<string, string> {
  return Object.fromEntries(items.map((i) => [i.slug, i.name]));
}

/** Build a slug → icon map from an OptionItem array */
export function toIcons(items: OptionItem[]): Record<string, string> {
  return Object.fromEntries(items.map((i) => [i.slug, i.icon]));
}
