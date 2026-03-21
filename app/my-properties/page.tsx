'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Property, ListingType, PropertyCategory, Orientation } from '@/types';
import { KOSOVO_CITIES } from '@/lib/mockData';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false });

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: 'apartment', label: '🏢 Banesë' }, { value: 'house',     label: '🏡 Shtëpi' },
  { value: 'office',    label: '🏬 Zyrë' },   { value: 'store',     label: '🛒 Dyqan' },
  { value: 'land',      label: '🌿 Tokë' },   { value: 'object',    label: '🏗️ Objekt' },
  { value: 'warehouse', label: '🏭 Depo' },   { value: 'business',  label: '💼 Biznes' },
];

const FURNISHING_OPTIONS = [
  { value: 'living_room', label: 'Dhoma ndenje' }, { value: 'kitchen', label: 'Kuzhinë' },
  { value: 'bathroom',    label: 'Banjë' },         { value: 'bedroom', label: 'Dhomë gjumi' },
  { value: 'wc',          label: 'WC' },            { value: 'unfurnished', label: 'Pa mobilim' },
];

const HEATING_OPTIONS = [
  { value: 'wood', label: 'Dru' }, { value: 'pellet', label: 'Pellet' },
  { value: 'gas',  label: 'Gaz' }, { value: 'keds',   label: 'KEDS' },
  { value: 'termokos', label: 'Termokos' }, { value: 'oil', label: 'Mazut' },
];

const EXTRAS_OPTIONS = [
  { value: 'elevator',         label: '🛗 Ashensor' }, { value: 'garage',   label: '🚗 Garazh' },
  { value: 'parking',          label: '🅿️ Parking' },  { value: 'air_conditioning', label: '❄️ Klimë' },
  { value: 'tv',               label: '📺 TV' },        { value: 'internet', label: '🌐 Internet' },
  { value: 'storage',          label: '📦 Depo' },
];

const ORIENTATION_OPTIONS = [
  { value: 'east',  label: 'Lindje' }, { value: 'west',  label: 'Perëndim' },
  { value: 'north', label: 'Veri' },   { value: 'south', label: 'Jug' },
];

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
        active ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

function EditModal({ property, onClose, onSaved }: { property: Property; onClose: () => void; onSaved: (updated: Property) => void }) {
  const [title, setTitle]               = useState(property.title);
  const [description, setDescription]   = useState(property.description);
  const [listingType, setListingType]   = useState<ListingType>(property.listingType ?? 'sale');
  const [category, setCategory]         = useState<PropertyCategory>(property.category ?? 'apartment');
  const [city, setCity]                 = useState(property.city);
  const [neighborhood, setNeighborhood] = useState(property.neighborhood);
  const [size, setSize]                 = useState(String(property.size));
  const [pricePerSqm, setPricePerSqm]   = useState(String(property.pricePerSqm));
  const [bedrooms, setBedrooms]         = useState(String(property.bedrooms ?? 1));
  const [bathrooms, setBathrooms]       = useState(String(property.bathrooms ?? 1));
  const [floor, setFloor]               = useState(property.floor != null ? String(property.floor) : '');
  const [orientation, setOrientation]   = useState<Orientation | ''>(property.orientation ?? '');
  const [furnishing, setFurnishing]     = useState<string[]>(property.furnishing ?? []);
  const [heating, setHeating]           = useState<string[]>(property.heating ?? []);
  const [extras, setExtras]             = useState<string[]>(property.extras ?? []);
  const [hasBalcony, setHasBalcony]     = useState(property.hasBalcony ?? false);
  const [lat, setLat]                   = useState<number | null>(property.lat ?? null);
  const [lng, setLng]                   = useState<number | null>(property.lng ?? null);
  const [images, setImages]             = useState<string[]>(property.images ?? []);
  const [uploading, setUploading]       = useState(false);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');
  const fileRef                         = useRef<HTMLInputElement>(null);

  const totalPrice = size && pricePerSqm ? Number(size) * Number(pricePerSqm) : 0;

  const toggleArr = (list: string[], setList: (v: string[]) => void, val: string) =>
    setList(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);

  const handleAddPhotos = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const data = await api.post('/api/upload', fd) as { url: string };
        setImages((prev) => [...prev, data.url]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ngarkimi dështoi.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) { setError('Duhet të ketë të paktën një foto.'); return; }
    setError('');
    setSaving(true);
    try {
      const updated = await api.put(`/api/properties/${property.id}`, {
        title, description, listingType, category, city, neighborhood,
        size: Number(size), pricePerSqm: Number(pricePerSqm),
        bedrooms: Number(bedrooms), bathrooms: Number(bathrooms),
        floor: floor !== '' ? Number(floor) : null,
        orientation: orientation || null,
        furnishing, heating, extras, hasBalcony, images,
        lat, lng,
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
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">Edito pronën</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}

          {/* Photos */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Fotot</p>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {images.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  {idx === 0 && <div className="absolute bottom-1 left-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Kryesore</div>}
                </div>
              ))}
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-rose-400 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-rose-500 disabled:opacity-50"
              >
                {uploading ? <div className="w-5 h-5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" /> : (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg><span className="text-[10px] font-medium">Shto</span></>
                )}
              </button>
            </div>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && handleAddPhotos(e.target.files)} />
          </div>

          {/* Listing type */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Lloji i listimit</p>
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              {[['sale', '🏷️ Shitje'], ['rent', '🔑 Qira']].map(([v, label]) => (
                <button key={v} type="button" onClick={() => setListingType(v as ListingType)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${listingType === v ? 'bg-white text-rose-500 shadow-sm' : 'text-gray-500'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Kategoria</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(({ value, label }) => (
                <Chip key={value} label={label} active={category === value} onClick={() => setCategory(value as PropertyCategory)} />
              ))}
            </div>
          </div>

          {/* Title + Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titulli</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Përshkrimi</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" />
          </div>

          {/* City + Neighborhood */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Qyteti</label>
              <select value={city} onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                {KOSOVO_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lagja</label>
              <input type="text" required value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
          </div>

          {/* Size + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sipërfaqja (m²)</label>
              <input type="number" min="1" required value={size} onChange={(e) => setSize(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Çmimi/m² (€)</label>
              <input type="number" min="1" required value={pricePerSqm} onChange={(e) => setPricePerSqm(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
          </div>
          {totalPrice > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between">
              <span className="text-sm text-rose-700 font-medium">Çmimi total</span>
              <span className="font-bold text-rose-600">{new Intl.NumberFormat('de-DE').format(totalPrice)} €</span>
            </div>
          )}

          {/* Bedrooms + Bathrooms + Floor */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dhoma gjumi</label>
              <input type="number" min="0" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Banjo</label>
              <input type="number" min="0" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kati</label>
              <input type="number" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="—"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
          </div>

          {/* Balcony toggle */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setHasBalcony(!hasBalcony)}
              className={`relative w-11 h-6 rounded-full transition-colors ${hasBalcony ? 'bg-rose-500' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${hasBalcony ? 'left-5' : 'left-0.5'}`} style={{ left: hasBalcony ? '22px' : '2px' }} />
            </button>
            <label className="text-sm font-semibold text-gray-700">Ka ballkon</label>
          </div>

          {/* Orientation */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Orientimi</p>
            <div className="flex flex-wrap gap-2">
              <Chip label="Pa preferencë" active={!orientation} onClick={() => setOrientation('')} />
              {ORIENTATION_OPTIONS.map(({ value, label }) => (
                <Chip key={value} label={label} active={orientation === value} onClick={() => setOrientation(orientation === value ? '' : value as Orientation)} />
              ))}
            </div>
          </div>

          {/* Furnishing */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Mobilimi</p>
            <div className="flex flex-wrap gap-2">
              {FURNISHING_OPTIONS.map(({ value, label }) => (
                <Chip key={value} label={label} active={furnishing.includes(value)} onClick={() => toggleArr(furnishing, setFurnishing, value)} />
              ))}
            </div>
          </div>

          {/* Heating */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Ngrohja</p>
            <div className="flex flex-wrap gap-2">
              {HEATING_OPTIONS.map(({ value, label }) => (
                <Chip key={value} label={label} active={heating.includes(value)} onClick={() => toggleArr(heating, setHeating, value)} />
              ))}
            </div>
          </div>

          {/* Extras */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Veçori shtesë</p>
            <div className="flex flex-wrap gap-2">
              {EXTRAS_OPTIONS.map(({ value, label }) => (
                <Chip key={value} label={label} active={extras.includes(value)} onClick={() => toggleArr(extras, setExtras, value)} />
              ))}
            </div>
          </div>

          {/* Map */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">Vendndodhja në hartë <span className="text-gray-400 font-normal">(opsionale)</span></p>
            <LocationPicker lat={lat} lng={lng} onChange={(la, ln) => { setLat(la); setLng(ln); }} />
            {lat && lng && (
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
                <button type="button" onClick={() => { setLat(null); setLng(null); }} className="text-xs text-red-500 hover:text-red-700 font-medium">Pastro</button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm">Anulo</button>
            <button type="submit" disabled={saving} className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-3 rounded-xl text-sm">
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
    if (!confirm('A jeni i sigurt?')) return;
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pronat e mia</h1>
          <p className="text-sm text-gray-500 mt-1">{loading ? 'Duke ngarkuar...' : `${properties.length} pronë gjithsej`}</p>
        </div>
        <Link href="/create-listing" className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Shto pronë
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-100" />
              <div className="p-5 space-y-3"><div className="h-4 bg-gray-100 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm text-center">{error}</div>}

      {!loading && !error && properties.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Nuk keni asnjë pronë</h3>
          <p className="text-gray-500 text-sm mb-6">Filloni duke shtuar pronën tuaj të parë.</p>
          <Link href="/create-listing" className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-3 rounded-xl text-sm">Shto pronën e parë</Link>
        </div>
      )}

      {!loading && !error && properties.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="relative h-48 bg-gray-100">
                {property.images?.[0] ? (
                  <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className={`text-white text-xs font-bold px-2.5 py-1 rounded-full ${property.listingType === 'rent' ? 'bg-blue-500' : 'bg-rose-500'}`}>
                    {property.listingType === 'rent' ? 'Qira' : 'Shitje'}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug">{property.title}</h3>
                <p className="text-sm text-gray-500 mb-1">{property.city}, {property.neighborhood}</p>
                <p className="text-sm text-gray-400 mb-3 flex gap-3">
                  <span>{property.size} m²</span>
                  {property.bedrooms > 0 && <span>🛏 {property.bedrooms}</span>}
                  {property.bathrooms > 0 && <span>🚿 {property.bathrooms}</span>}
                </p>
                <p className="text-lg font-bold text-rose-500 mt-auto mb-4">
                  {new Intl.NumberFormat('de-DE').format(property.totalPrice)} €
                </p>

                <div className="flex gap-2">
                  <Link href={`/property/${property.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 py-2.5 rounded-xl"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Shiko
                  </Link>
                  <button onClick={() => setEditing(property)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 py-2.5 rounded-xl"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edito
                  </button>
                  <button onClick={() => handleDelete(property.id)} disabled={deletingId === property.id}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl disabled:opacity-50"
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

      {editing && (
        <EditModal property={editing} onClose={() => setEditing(null)} onSaved={(updated) => { setProperties((prev) => prev.map((p) => p.id === updated.id ? updated : p)); setEditing(null); }} />
      )}
    </div>
  );
}
