'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false });

// ─── Zod schema ───────────────────────────────────────────────────────────────

const CATEGORIES  = ['apartment', 'house', 'office', 'store', 'land', 'object', 'warehouse', 'business'] as const;
const FURNISHINGS = ['living_room', 'kitchen', 'bathroom', 'bedroom', 'wc', 'unfurnished'] as const;
const HEATINGS    = ['wood', 'pellet', 'gas', 'keds', 'termokos', 'oil'] as const;
const EXTRAS_LIST = ['elevator', 'garage', 'parking', 'air_conditioning', 'tv', 'internet', 'storage'] as const;

const schema = z.object({
  title:        z.string().min(3,  'Titulli duhet të ketë të paktën 3 karaktere.'),
  description:  z.string().min(10, 'Përshkrimi duhet të ketë të paktën 10 karaktere.'),
  listingType:  z.enum(['sale', 'rent']).default('sale'),
  category:     z.enum(CATEGORIES).default('apartment'),
  city:         z.string().min(1,  'Qyteti është i detyrueshëm.'),
  neighborhood: z.string().min(1,  'Lagja është e detyrueshme.'),
  size:         z.coerce.number().positive('Sipërfaqja duhet të jetë pozitive.'),
  pricePerSqm:  z.coerce.number().positive('Çmimi/m² duhet të jetë pozitiv.'),
  bedrooms:     z.coerce.number().int().min(0).default(1),
  bathrooms:    z.coerce.number().int().min(0).default(1),
  floor:        z.coerce.number().int().optional().or(z.literal('')).transform((v) => (v === '' ? null : v)),
  orientation:  z.enum(['east', 'west', 'north', 'south']).optional().or(z.literal('')).transform((v) => v || null),
  furnishing:   z.array(z.enum(FURNISHINGS)).default([]),
  heating:      z.array(z.enum(HEATINGS)).default([]),
  extras:       z.array(z.enum(EXTRAS_LIST)).default([]),
  hasBalcony:   z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

// ─── Labels ───────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: 'apartment', label: '🏢 Banesë' },
  { value: 'house',     label: '🏡 Shtëpi' },
  { value: 'office',    label: '🏬 Zyrë' },
  { value: 'store',     label: '🛒 Dyqan' },
  { value: 'land',      label: '🌿 Tokë' },
  { value: 'object',    label: '🏗️ Objekt' },
  { value: 'warehouse', label: '🏭 Depo' },
  { value: 'business',  label: '💼 Biznes' },
];

const FURNISHING_OPTIONS = [
  { value: 'living_room', label: 'Dhoma ndenje' },
  { value: 'kitchen',     label: 'Kuzhinë' },
  { value: 'bathroom',    label: 'Banjë' },
  { value: 'bedroom',     label: 'Dhomë gjumi' },
  { value: 'wc',          label: 'WC' },
  { value: 'unfurnished', label: 'Pa mobilim' },
];

const HEATING_OPTIONS = [
  { value: 'wood',     label: 'Dru' },
  { value: 'pellet',   label: 'Pellet' },
  { value: 'gas',      label: 'Gaz' },
  { value: 'keds',     label: 'KEDS' },
  { value: 'termokos', label: 'Termokos' },
  { value: 'oil',      label: 'Mazut' },
];

const EXTRAS_OPTIONS = [
  { value: 'elevator',         label: '🛗 Ashensor' },
  { value: 'garage',           label: '🚗 Garazh' },
  { value: 'parking',          label: '🅿️ Parking' },
  { value: 'air_conditioning', label: '❄️ Klimë' },
  { value: 'tv',               label: '📺 TV' },
  { value: 'internet',         label: '🌐 Internet' },
  { value: 'storage',          label: '📦 Depo' },
];

const ORIENTATION_OPTIONS = [
  { value: 'east',  label: 'Lindje' },
  { value: 'west',  label: 'Perëndim' },
  { value: 'north', label: 'Veri' },
  { value: 'south', label: 'Jug' },
];

// ─── Reusable UI pieces ───────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="text-red-500 text-xs mt-1">{msg}</p> : null;
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
        active ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300'
      }`}
    >
      {label}
    </button>
  );
}

function SectionTitle({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 text-sm font-bold flex items-center justify-center flex-shrink-0">{n}</div>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateListingPage() {
  const router = useRouter();
  const { currentUser, _hasHydrated } = useAuthStore();

  const [images, setImages]     = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [lat, setLat]   = useState<number | null>(null);
  const [lng, setLng]   = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register, handleSubmit, control, watch,
    setValue, formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      listingType: 'sale',
      category:    'apartment',
      bedrooms:    1,
      bathrooms:   1,
      furnishing:  [],
      heating:     [],
      extras:      [],
      hasBalcony:  false,
    },
  });

  const watchSize       = watch('size');
  const watchPricePerSqm = watch('pricePerSqm');
  const totalPrice = (watchSize && watchPricePerSqm) ? (watchSize * watchPricePerSqm) : 0;

  useEffect(() => {
    if (_hasHydrated && !currentUser) router.replace('/auth/login');
  }, [_hasHydrated, currentUser, router]);

  if (!_hasHydrated || !currentUser) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-rose-500" /></div>;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setUploadError('');
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('images', file);
        const data = await api.post('/api/upload', fd) as { urls: string[] };
        uploaded.push(data.urls[0]);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch {
      setUploadError('Ngarkimi dështoi. Provo përsëri.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const removeImage = (idx: number) => setImages((p) => p.filter((_, i) => i !== idx));

  const onSubmit = async (values: FormValues) => {
    if (images.length === 0) { setSubmitError('Të paktën një foto është e detyrueshme.'); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.post('/api/properties', {
        ...values,
        images,
        lat, lng,
        totalPrice: totalPrice || values.size * values.pricePerSqm,
      });
      router.push('/my-properties');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Ndodhi një gabim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Regjistro pronë</h1>
          <p className="text-gray-500 text-sm mt-1">Plotëso të gjitha fushat për të listuar pronën tënde.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* ── 1. Photos ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionTitle n={1} title="Fotot e pronës" />
            <div className="grid grid-cols-3 gap-3 mb-4">
              {images.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <Image src={url} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {idx === 0 && <span className="absolute bottom-1 left-1 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">Kryesore</span>}
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-rose-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-rose-400 transition-all"
              >
                {uploading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-rose-300 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs font-medium">Shto foto</span>
                  </>
                )}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
            {uploadError && <p className="text-red-500 text-xs">{uploadError}</p>}
            {images.length === 0 && <p className="text-xs text-gray-400">Shto të paktën 1 foto.</p>}
          </div>

          {/* ── 2. Listing type & Category ─────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionTitle n={2} title="Lloji i pronës" />

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lloji i listimit</label>
              <Controller
                name="listingType"
                control={control}
                render={({ field }) => (
                  <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                    {[['sale', '🏷️ Shitje'], ['rent', '🔑 Qira']].map(([v, label]) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => field.onChange(v)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                          field.value === v ? 'bg-white text-rose-500 shadow-sm' : 'text-gray-500'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kategoria</label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map(({ value, label }) => (
                      <Chip key={value} label={label} active={field.value === value} onClick={() => field.onChange(value)} />
                    ))}
                  </div>
                )}
              />
              <FieldError msg={errors.category?.message} />
            </div>
          </div>

          {/* ── 3. Basic info ──────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionTitle n={3} title="Informacione bazë" />

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titulli *</label>
                <input {...register('title')} placeholder="p.sh. Banesë 3+1 në qendër të Prishtinës" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                <FieldError msg={errors.title?.message} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Përshkrimi *</label>
                <textarea {...register('description')} rows={4} placeholder="Përshkruaj pronën tënde..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
                <FieldError msg={errors.description?.message} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Qyteti *</label>
                  <input {...register('city')} placeholder="Prishtinë" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                  <FieldError msg={errors.city?.message} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lagja *</label>
                  <input {...register('neighborhood')} placeholder="Ulpiana" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                  <FieldError msg={errors.neighborhood?.message} />
                </div>
              </div>
            </div>
          </div>

          {/* ── 4. Price & Size ───────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionTitle n={4} title="Çmimi & Sipërfaqja" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sipërfaqja (m²) *</label>
                <input {...register('size')} type="number" min="1" placeholder="65" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                <FieldError msg={errors.size?.message} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Çmimi/m² (€) *</label>
                <input {...register('pricePerSqm')} type="number" min="1" placeholder="900" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                <FieldError msg={errors.pricePerSqm?.message} />
              </div>
            </div>
            {totalPrice > 0 && (
              <div className="mt-4 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-rose-700 font-medium">Çmimi total</span>
                <span className="text-lg font-bold text-rose-600">€{totalPrice.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* ── 5. Rooms & Details ────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionTitle n={5} title="Detajet e pronës" />
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dhoma gjumi</label>
                  <input {...register('bedrooms')} type="number" min="0" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                  <FieldError msg={errors.bedrooms?.message} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Banjo</label>
                  <input {...register('bathrooms')} type="number" min="0" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                  <FieldError msg={errors.bathrooms?.message} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kati</label>
                  <input {...register('floor')} type="number" placeholder="0 = Përdhesë" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
                <div className="flex items-center gap-3 pt-7">
                  <Controller
                    name="hasBalcony"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <div
                          onClick={() => field.onChange(!field.value)}
                          className={`w-11 h-6 rounded-full relative transition-colors ${field.value ? 'bg-rose-500' : 'bg-gray-200'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${field.value ? 'left-5.5' : 'left-0.5'}`} style={{ left: field.value ? '22px' : '2px' }} />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Ka ballkon</span>
                      </label>
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Orientimi (opsional)</label>
                <Controller
                  name="orientation"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      <Chip label="Pa preferencë" active={!field.value} onClick={() => field.onChange('')} />
                      {ORIENTATION_OPTIONS.map(({ value, label }) => (
                        <Chip key={value} label={label} active={field.value === value} onClick={() => field.onChange(field.value === value ? '' : value)} />
                      ))}
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          {/* ── 6. Furnishing ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionTitle n={6} title="Mobilimi" />
            <Controller
              name="furnishing"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {FURNISHING_OPTIONS.map(({ value, label }) => (
                    <Chip
                      key={value} label={label}
                      active={field.value.includes(value as never)}
                      onClick={() => {
                        const cur = field.value as string[];
                        field.onChange(cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]);
                      }}
                    />
                  ))}
                </div>
              )}
            />
          </div>

          {/* ── 7. Heating ───────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionTitle n={7} title="Sistemi i ngrohjes" />
            <Controller
              name="heating"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {HEATING_OPTIONS.map(({ value, label }) => (
                    <Chip
                      key={value} label={label}
                      active={field.value.includes(value as never)}
                      onClick={() => {
                        const cur = field.value as string[];
                        field.onChange(cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]);
                      }}
                    />
                  ))}
                </div>
              )}
            />
          </div>

          {/* ── 8. Extras ────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionTitle n={8} title="Veçori shtesë" />
            <Controller
              name="extras"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {EXTRAS_OPTIONS.map(({ value, label }) => (
                    <Chip
                      key={value} label={label}
                      active={field.value.includes(value as never)}
                      onClick={() => {
                        const cur = field.value as string[];
                        field.onChange(cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]);
                      }}
                    />
                  ))}
                </div>
              )}
            />
          </div>

          {/* ── 9. Location ──────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionTitle n={9} title="Vendndodhja në hartë (opsionale)" />
            <LocationPicker lat={lat} lng={lng} onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }} />
            {lat && lng && (
              <p className="text-xs text-gray-400 mt-2">📍 {lat.toFixed(5)}, {lng.toFixed(5)}</p>
            )}
          </div>

          {/* ── Submit ───────────────────────────────────────────────── */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-bold rounded-2xl text-base transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> Duke regjistuar...</>
            ) : 'Regjistro pronën'}
          </button>
        </form>
      </div>
    </div>
  );
}
