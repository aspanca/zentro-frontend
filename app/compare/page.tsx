'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Property } from '@/types';
import { useCompareStore } from '@/lib/store';

const CATEGORY_LABELS: Record<string, string> = {
  apartment: 'Apartament', house: 'Shtëpi', office: 'Zyrë',
  store: 'Dyqan', land: 'Tokë', object: 'Objekt',
  warehouse: 'Magazinë', business: 'Biznes',
};
const LISTING_LABELS: Record<string, string> = { sale: 'Shitje', rent: 'Qira' };
const ORIENTATION_LABELS: Record<string, string> = {
  east: 'Lindje', west: 'Perëndim', north: 'Veri', south: 'Jug',
};
const FURNISHING_LABELS: Record<string, string> = {
  living_room: 'Dhoma ndenje', kitchen: 'Kuzhinë', bathroom: 'Banjo',
  bedroom: 'Dhoma gjumi', wc: 'WC', unfurnished: 'Pa mobilim',
};
const HEATING_LABELS: Record<string, string> = {
  wood: 'Dru', pellet: 'Pellet', gas: 'Gaz', keds: 'KEDS', termokos: 'Termokos', oil: 'Naftë',
};
const EXTRAS_LABELS: Record<string, string> = {
  elevator: 'Ashensor', garage: 'Garazh', parking: 'Parkim', air_conditioning: 'Klimë',
  tv: 'TV', internet: 'Internet', storage: 'Depo',
};

function Row({ label, values, highlight }: { label: string; values: (string | number | null | undefined)[]; highlight?: boolean }) {
  return (
    <div className={`grid border-b border-gray-100 ${values.length === 3 ? 'grid-cols-4' : 'grid-cols-3'}`}>
      <div className={`px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50 border-r border-gray-100 flex items-center ${highlight ? 'bg-rose-50 text-rose-700' : ''}`}>
        {label}
      </div>
      {values.map((v, i) => (
        <div key={i} className={`px-4 py-3 text-sm text-gray-800 border-r border-gray-100 last:border-r-0 ${highlight ? 'font-semibold' : ''}`}>
          {v ?? <span className="text-gray-300">—</span>}
        </div>
      ))}
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  if (!items?.length) return <span className="text-gray-300 text-sm">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <span key={item} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{item}</span>
      ))}
    </div>
  );
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { ids: storeIds, add, remove, has } = useCompareStore();
  const [properties, setProperties] = useState<(Property | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const idsParam = searchParams.get('ids') ?? '';
  const ids = idsParam ? idsParam.split(',').filter(Boolean).slice(0, 3) : [];

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const results = await Promise.all(
      ids.map((id) => api.get(`/api/properties/${id}`).catch(() => null))
    );
    setProperties(results as (Property | null)[]);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsParam]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const removeFromUrl = (id: string) => {
    const next = ids.filter((i) => i !== id);
    if (next.length === 0) { router.push('/'); return; }
    router.push(`/compare?ids=${next.join(',')}`);
  };

  const priceOf = (p: Property) =>
    p.price ? `€${Number(p.price).toLocaleString('sq-XK')}` : null;

  const cols = properties.filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Duke ngarkuar pronat…</p>
        </div>
      </div>
    );
  }

  if (!ids.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Nuk ka prona për krahasim</h2>
          <p className="text-gray-500 mb-6">Shto prona nga faqja kryesore për t'i krahasuar.</p>
          <Link href="/" className="bg-rose-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-rose-600 transition-colors">
            Shko tek pronat
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Krahasim pronash</h1>
            <p className="text-gray-500 text-sm mt-1">{cols} prona të zgjedhura</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={copyUrl}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              {copied ? (
                <><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> U kopjua!</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Kopjo & ndaj</>
              )}
            </button>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              ← Kthehu
            </Link>
          </div>
        </div>

        {/* Compare table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Property header cards */}
          <div className={`grid border-b border-gray-200 ${cols === 3 ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <div className="bg-gray-50 border-r border-gray-200" />
            {properties.map((p, i) => (
              p ? (
                <div key={p.id} className="p-4 border-r border-gray-100 last:border-r-0">
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-gray-100">
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-3xl">🏠</div>
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/property/${p.id}`} className="font-semibold text-gray-900 hover:text-rose-500 transition-colors text-sm line-clamp-2">
                        {p.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">{p.city}</p>
                    </div>
                    <button
                      onClick={() => removeFromUrl(String(p.id))}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      title="Hiq nga krahasimi"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div key={i} className="p-4 flex items-center justify-center text-gray-400 text-sm border-r border-gray-100 last:border-r-0">
                  Pronë e pa gjendur
                </div>
              )
            ))}
          </div>

          {/* Comparison rows */}
          <div className="overflow-x-auto">
            {/* Price */}
            <Row label="Çmimi" values={properties.map((p) => p ? priceOf(p) : null)} highlight />
            <Row label="Lloji" values={properties.map((p) => p ? LISTING_LABELS[p.listingType ?? ''] ?? '—' : null)} />
            <Row label="Kategoria" values={properties.map((p) => p ? CATEGORY_LABELS[p.category ?? ''] ?? '—' : null)} />
            <Row label="Sipërfaqja" values={properties.map((p) => p?.size ? `${p.size} m²` : null)} />
            <Row label="Dhoma gjumi" values={properties.map((p) => p?.bedrooms ?? null)} />
            <Row label="Banjo" values={properties.map((p) => p?.bathrooms ?? null)} />
            <Row label="Kati" values={properties.map((p) => p?.floor != null ? `Kati ${p.floor}` : null)} />
            <Row label="Orientimi" values={properties.map((p) => p ? ORIENTATION_LABELS[p.orientation ?? ''] ?? '—' : null)} />
            <Row label="Qyteti" values={properties.map((p) => p?.city ?? null)} />
            <Row label="Lagjja" values={properties.map((p) => p?.neighborhood ?? null)} />

            {/* Array fields */}
            <div className={`grid border-b border-gray-100 ${cols === 3 ? 'grid-cols-4' : 'grid-cols-3'}`}>
              <div className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50 border-r border-gray-100 flex items-center">
                Mobilimi
              </div>
              {properties.map((p, i) => (
                <div key={i} className="px-4 py-3 border-r border-gray-100 last:border-r-0">
                  <TagList items={(p?.furnishing ?? []).map((f: string) => FURNISHING_LABELS[f] ?? f)} />
                </div>
              ))}
            </div>

            <div className={`grid border-b border-gray-100 ${cols === 3 ? 'grid-cols-4' : 'grid-cols-3'}`}>
              <div className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50 border-r border-gray-100 flex items-center">
                Ngrohja
              </div>
              {properties.map((p, i) => (
                <div key={i} className="px-4 py-3 border-r border-gray-100 last:border-r-0">
                  <TagList items={(p?.heating ?? []).map((h: string) => HEATING_LABELS[h] ?? h)} />
                </div>
              ))}
            </div>

            <div className={`grid border-b border-gray-100 ${cols === 3 ? 'grid-cols-4' : 'grid-cols-3'}`}>
              <div className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50 border-r border-gray-100 flex items-center">
                Ekstrat
              </div>
              {properties.map((p, i) => (
                <div key={i} className="px-4 py-3 border-r border-gray-100 last:border-r-0">
                  <TagList items={(p?.extras ?? []).map((e: string) => EXTRAS_LABELS[e] ?? e)} />
                </div>
              ))}
            </div>

            {/* View button row */}
            <div className={`grid ${cols === 3 ? 'grid-cols-4' : 'grid-cols-3'} bg-gray-50`}>
              <div className="px-4 py-4 border-r border-gray-100" />
              {properties.map((p, i) => (
                <div key={i} className="px-4 py-4 border-r border-gray-100 last:border-r-0">
                  {p ? (
                    <Link
                      href={`/property/${p.id}`}
                      className="block w-full text-center bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      Shiko pronën
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
