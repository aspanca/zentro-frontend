'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, usePropertyStore } from '@/lib/store';
import { KOSOVO_CITIES } from '@/lib/mockData';
import { PropertyType } from '@/types';

const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
];

export default function CreateListingPage() {
  const { currentUser, _hasHydrated } = useAuthStore();
  const { addProperty } = usePropertyStore();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<PropertyType>('flat');
  const [city, setCity] = useState(KOSOVO_CITIES[0]);
  const [neighborhood, setNeighborhood] = useState('');
  const [size, setSize] = useState('');
  const [pricePerSqm, setPricePerSqm] = useState('');
  const [hasBalcony, setHasBalcony] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalPrice = size && pricePerSqm ? Number(size) * Number(pricePerSqm) : 0;

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!currentUser) router.push('/auth/login');
  }, [currentUser, _hasHydrated, router]);

  if (!_hasHydrated || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title || !description || !neighborhood || !size || !pricePerSqm) {
      setError('Ju lutem plotësoni të gjitha fushat e detyrueshme.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    addProperty({
      title,
      description,
      type,
      city,
      neighborhood,
      size: Number(size),
      pricePerSqm: Number(pricePerSqm),
      totalPrice,
      hasBalcony,
      images: [MOCK_IMAGES[selectedImageIdx]],
      userId: currentUser.id,
    });

    setLoading(false);
    router.push('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Shto një pronë të re</h1>
        <p className="text-gray-500 text-sm mt-1">Plotëso detajet e pronës tënde</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Informata bazike</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Titulli <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="p.sh. Banesë luksoze me 2 dhoma gjumi"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Përshkrimi <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Përshkruaj pronën tënde në detaje..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lloji i pronës <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['flat', 'house'] as PropertyType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    type === t
                      ? 'border-rose-500 bg-rose-50 text-rose-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {t === 'flat' ? '🏢 Banesë' : t === 'house' ? '🏡 Shtëpi' : '🌿 Truall'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Vendndodhja</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Qyteti <span className="text-red-400">*</span>
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white"
              >
                {KOSOVO_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lagja <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="p.sh. Qendra, Dardania"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Detajet & çmimi</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Sipërfaqja (m²) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="p.sh. 85"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Çmimi për m² (€) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={pricePerSqm}
                onChange={(e) => setPricePerSqm(e.target.value)}
                placeholder="p.sh. 1500"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>

          {totalPrice > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
              <p className="text-sm text-rose-700">
                <span className="font-medium">Çmimi total: </span>
                <span className="text-lg font-bold">
                  {new Intl.NumberFormat('de-DE').format(totalPrice)} €
                </span>
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHasBalcony(!hasBalcony)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                hasBalcony ? 'bg-rose-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  hasBalcony ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <label className="text-sm font-medium text-gray-700">Ka ballkon</label>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Zgjidh imazhin</h2>
          <p className="text-xs text-gray-500 mb-3">Zgjidh një foto nga koleksioni ynë demo:</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {MOCK_IMAGES.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImageIdx(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImageIdx === idx ? 'border-rose-500 scale-95' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img src={img} alt={`Option ${idx + 1}`} className="w-full h-full object-cover" />
                {selectedImageIdx === idx && (
                  <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl transition-colors text-sm"
          >
            Anulo
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
          >
            {loading ? 'Duke publikuar...' : 'Publiko pronën'}
          </button>
        </div>
      </form>
    </div>
  );
}
