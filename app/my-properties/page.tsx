'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Property, PropertyType } from '@/types';
import { KOSOVO_CITIES } from '@/lib/mockData';

// ─── Edit modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
  property: Property;
  onClose: () => void;
  onSaved: (updated: Property) => void;
}

function EditModal({ property, onClose, onSaved }: EditModalProps) {
  const [title, setTitle]               = useState(property.title);
  const [description, setDescription]   = useState(property.description);
  const [type, setType]                 = useState<PropertyType>(property.type);
  const [city, setCity]                 = useState(property.city);
  const [neighborhood, setNeighborhood] = useState(property.neighborhood);
  const [size, setSize]                 = useState(String(property.size));
  const [pricePerSqm, setPricePerSqm]   = useState(String(property.pricePerSqm));
  const [hasBalcony, setHasBalcony]     = useState(property.hasBalcony);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');

  const totalPrice = size && pricePerSqm ? Number(size) * Number(pricePerSqm) : 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const updated = await api.put(`/api/properties/${property.id}`, {
        title, description, type, city, neighborhood,
        size: Number(size),
        pricePerSqm: Number(pricePerSqm),
        hasBalcony,
      }) as Property;
      onSaved(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ndodhi një gabim.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Edito pronën</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Titulli</label>
            <input
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Përshkrimi</label>
            <textarea
              required value={description} onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['flat', 'house'] as PropertyType[]).map((t) => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                  type === t ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {t === 'flat' ? '🏢 Banesë' : '🏡 Shtëpi'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Qyteti</label>
              <select value={city} onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                {KOSOVO_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lagja</label>
              <input type="text" required value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sipërfaqja (m²)</label>
              <input type="number" required min="1" value={size} onChange={(e) => setSize(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Çmimi për m² (€)</label>
              <input type="number" required min="1" value={pricePerSqm} onChange={(e) => setPricePerSqm(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>

          {totalPrice > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
              <p className="text-sm text-rose-700">
                <span className="font-medium">Çmimi total: </span>
                <span className="font-bold">{new Intl.NumberFormat('de-DE').format(totalPrice)} €</span>
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setHasBalcony(!hasBalcony)}
              className={`relative w-11 h-6 rounded-full transition-colors ${hasBalcony ? 'bg-rose-500' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hasBalcony ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <label className="text-sm font-medium text-gray-700">Ka ballkon</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Anulo
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {saving ? 'Duke ruajtur...' : 'Ruaj ndryshimet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MyPropertiesPage() {
  const { currentUser, _hasHydrated } = useAuthStore();
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [editing, setEditing]       = useState<Property | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!currentUser) { router.push('/auth/login'); return; }
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    api.get('/api/properties/mine')
      .then((data) => setProperties((data as { properties: Property[] }).properties))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Gabim gjatë ngarkimit.'))
      .finally(() => setLoading(false));
  }, [_hasHydrated, currentUser, router]);

  const handleDelete = async (id: string) => {
    if (!confirm('A jeni i sigurt që dëshironi të fshini këtë pronë?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/properties/${id}`);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Fshirja dështoi.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!_hasHydrated || !currentUser) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pronat e mia</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Duke ngarkuar...' : `${properties.length} pronë gjithsej`}
          </p>
        </div>
        <Link
          href="/create-listing"
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Shto pronë
        </Link>
      </div>

      {/* States */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-100" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      {!loading && !error && properties.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Nuk keni asnjë pronë</h3>
          <p className="text-gray-500 text-sm mb-6">Filloni duke shtuar pronën tuaj të parë.</p>
          <Link
            href="/create-listing"
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Shto pronën e parë
          </Link>
        </div>
      )}

      {!loading && !error && properties.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Type badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                    {property.type === 'flat' ? '🏢 Banesë' : '🏡 Shtëpi'}
                  </span>
                </div>
                {/* Image count */}
                {property.images?.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full">
                    +{property.images.length - 1}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug">{property.title}</h3>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.city}, {property.neighborhood}
                </p>
                <p className="text-sm text-gray-500 mb-3">{property.size} m² · {property.pricePerSqm} €/m²</p>

                <p className="text-lg font-bold text-rose-500 mt-auto mb-4">
                  {new Intl.NumberFormat('de-DE').format(property.totalPrice)} €
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/property/${property.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 py-2.5 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Shiko
                  </Link>
                  <button
                    onClick={() => setEditing(property)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 py-2.5 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edito
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    disabled={deletingId === property.id}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Fshij pronën"
                  >
                    {deletingId === property.id ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <EditModal
          property={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
