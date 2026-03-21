'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, usePropertyStore } from '@/lib/store';
import { KOSOVO_CITIES } from '@/lib/mockData';
import { PropertyType } from '@/types';

interface UploadedImage {
  url: string;
  previewUrl: string;
  uploading: boolean;
  error?: string;
}

export default function CreateListingPage() {
  const { currentUser, accessToken, _hasHydrated } = useAuthStore();
  const { addProperty } = usePropertyStore();
  const router = useRouter();

  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [type, setType]               = useState<PropertyType>('flat');
  const [city, setCity]               = useState(KOSOVO_CITIES[0]);
  const [neighborhood, setNeighborhood] = useState('');
  const [size, setSize]               = useState('');
  const [pricePerSqm, setPricePerSqm] = useState('');
  const [hasBalcony, setHasBalcony]   = useState(false);
  const [images, setImages]           = useState<UploadedImage[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalPrice = size && pricePerSqm ? Number(size) * Number(pricePerSqm) : 0;

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!currentUser) router.push('/auth/login');
  }, [currentUser, _hasHydrated, router]);

  if (!_hasHydrated || !currentUser) return null;

  // ── Image upload ─────────────────────────────────────────────────────────────

  const handleFiles = async (files: FileList) => {
    const newImages: UploadedImage[] = Array.from(files).map((file) => ({
      url: '',
      previewUrl: URL.createObjectURL(file),
      uploading: true,
    }));

    setImages((prev) => [...prev, ...newImages]);
    const startIdx = images.length;

    await Promise.all(
      Array.from(files).map(async (file, i) => {
        const idx = startIdx + i;
        try {
          const formData = new FormData();
          formData.append('images', file);

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || ''}/api/upload`,
            {
              method: 'POST',
              headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
              body: formData,
            }
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? 'Upload failed');

          setImages((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], url: data.urls[0], uploading: false };
            return next;
          });
        } catch (err: unknown) {
          setImages((prev) => {
            const next = [...prev];
            next[idx] = {
              ...next[idx],
              uploading: false,
              error: err instanceof Error ? err.message : 'Upload failed',
            };
            return next;
          });
        }
      })
    );
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !neighborhood || !size || !pricePerSqm) {
      setError('Ju lutem plotësoni të gjitha fushat e detyrueshme.');
      return;
    }

    const readyImages = images.filter((img) => img.url && !img.uploading);
    if (readyImages.length === 0) {
      setError('Ju lutem ngarkoni të paktën një foto.');
      return;
    }

    if (images.some((img) => img.uploading)) {
      setError('Prisni derisa të gjitha fotot të ngarkohen.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/properties`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title, description, type, city, neighborhood,
            size: Number(size),
            pricePerSqm: Number(pricePerSqm),
            totalPrice,
            hasBalcony,
            images: readyImages.map((img) => img.url),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create property');

      // Also add to local store so it shows up instantly
      addProperty({
        ...data,
        images: readyImages.map((img) => img.url),
        userId: currentUser.id,
      });

      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ndodhi një gabim.');
    } finally {
      setLoading(false);
    }
  };

  const uploading = images.some((img) => img.uploading);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Shto një pronë të re</h1>
        <p className="text-gray-500 text-sm mt-1">Plotëso detajet e pronës tënde</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>
        )}

        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Informata bazike</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Titulli <span className="text-red-400">*</span>
            </label>
            <input
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="p.sh. Banesë luksoze me 2 dhoma gjumi"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Përshkrimi <span className="text-red-400">*</span>
            </label>
            <textarea
              required value={description} onChange={(e) => setDescription(e.target.value)}
              rows={4} placeholder="Përshkruaj pronën tënde në detaje..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lloji i pronës <span className="text-red-400">*</span>
            </label>
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
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Vendndodhja</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Qyteti <span className="text-red-400">*</span></label>
              <select value={city} onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                {KOSOVO_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lagja <span className="text-red-400">*</span></label>
              <input type="text" required value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="p.sh. Qendra, Dardania"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Price & details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Detajet & çmimi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sipërfaqja (m²) <span className="text-red-400">*</span></label>
              <input type="number" required min="1" value={size} onChange={(e) => setSize(e.target.value)}
                placeholder="p.sh. 85"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Çmimi për m² (€) <span className="text-red-400">*</span></label>
              <input type="number" required min="1" value={pricePerSqm} onChange={(e) => setPricePerSqm(e.target.value)}
                placeholder="p.sh. 1500"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>

          {totalPrice > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
              <p className="text-sm text-rose-700">
                <span className="font-medium">Çmimi total: </span>
                <span className="text-lg font-bold">{new Intl.NumberFormat('de-DE').format(totalPrice)} €</span>
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
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Fotot <span className="text-red-400">*</span></h2>
          <p className="text-xs text-gray-500 mb-4">Ngarko deri në 10 foto. Madhësia maksimale: 10MB secila.</p>

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-all mb-4"
          >
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-rose-500">Kliko për të ngarkuar</span> ose tërhiq fotot këtu
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</p>
            <input
              ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
          </div>

          {/* Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                  <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />

                  {img.uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {img.error && (
                    <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center p-1">
                      <span className="text-white text-[10px] text-center leading-tight">{img.error}</span>
                    </div>
                  )}

                  {!img.uploading && (
                    <button
                      type="button" onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full items-center justify-center text-xs hidden group-hover:flex transition-all"
                    >
                      ×
                    </button>
                  )}

                  {idx === 0 && img.url && (
                    <div className="absolute bottom-1 left-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      Kryesore
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl transition-colors text-sm"
          >
            Anulo
          </button>
          <button type="submit" disabled={loading || uploading}
            className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
          >
            {uploading ? 'Duke ngarkuar fotot...' : loading ? 'Duke publikuar...' : 'Publiko pronën'}
          </button>
        </div>
      </form>
    </div>
  );
}
