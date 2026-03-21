'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePropertyStore, useAuthStore, usePaymentStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Property } from '@/types';
import { formatPrice, formatPricePerSqm, propertyTypeLabel, propertyTypeColor, timeAgo } from '@/lib/utils';
import InsightsPaywall from '@/components/InsightsPaywall';

const PropertyInsights = dynamic(() => import('@/components/PropertyInsights'), { ssr: false });

interface Props { id: string }

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ images, startIdx, onClose }: { images: string[]; startIdx: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIdx);

  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={onClose}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-white/60 text-sm">{idx + 1} / {images.length}</span>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main image */}
      <div className="flex-1 flex items-center justify-center relative px-12 min-h-0" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[idx]}
          alt=""
          className="max-h-full max-w-full object-contain select-none"
          draggable={false}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex-shrink-0 flex justify-center gap-2 px-4 py-4 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                i === idx ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PropertyDetail({ id }: Props) {
  const { properties } = usePropertyStore();
  const { currentUser } = useAuthStore();
  const { isUnlocked } = usePaymentStore();
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const local = properties.find((p) => p.id === id);
    if (local) {
      setProperty(local);
      setUnlocked(isUnlocked(id));
      return;
    }
    api.get(`/api/properties/${id}`)
      .then((data) => { setProperty(data as Property); setUnlocked(isUnlocked(id)); })
      .catch(() => setNotFound(true));
  }, [id, properties, isUnlocked]);

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Prona nuk u gjet</h1>
        <p className="text-gray-500 mb-6">Kjo pronë nuk ekziston ose është fshirë.</p>
        <Link href="/" className="bg-rose-500 hover:bg-rose-600 text-white font-medium px-6 py-3 rounded-xl transition-colors">
          Kthehu në kryefaqe
        </Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="h-80 bg-gray-200 rounded-2xl mb-6" />
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    );
  }

  const owner = (property as Property & { owner?: { id: string; name: string; email: string } }).owner ?? null;
  const isOwner = currentUser?.id === property.userId;

  return (
    <>
      {lightboxOpen && (
        <Lightbox
          images={property.images}
          startIdx={activeImage}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kthehu
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Main image — click to open lightbox */}
            <div
              className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[16/9] mb-3 cursor-zoom-in group"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={property.images[activeImage] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'}
                alt={property.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-[1.02] duration-300"
              />
              <div className="absolute top-4 left-4">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${propertyTypeColor(property.type)}`}>
                  {propertyTypeLabel(property.type)}
                </span>
              </div>
              {/* Expand hint */}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Zgjero
              </div>
              {/* Image counter */}
              {property.images.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  {activeImage + 1} / {property.images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {property.images.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImage === idx ? 'border-rose-500' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Title */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{property.neighborhood}, {property.city}</span>
                <span className="text-gray-300">·</span>
                <span>{timeAgo(property.createdAt)}</span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { value: property.size, label: 'm² total' },
                { value: property.pricePerSqm.toLocaleString(), label: '€ / m²' },
                { value: propertyTypeLabel(property.type), label: 'Lloji' },
                { value: property.hasBalcony ? '✓' : '✗', label: 'Ballkon' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Rreth kësaj prone</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{property.description}</p>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
              <div className="mb-5">
                <p className="text-3xl font-bold text-gray-900">{formatPrice(property.totalPrice)}</p>
                <p className="text-sm text-gray-500 mt-0.5">{formatPricePerSqm(property.pricePerSqm)}</p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { label: 'Sipërfaqja', value: `${property.size} m²` },
                  { label: 'Qyteti',     value: property.city },
                  { label: 'Lagja',      value: property.neighborhood },
                  { label: 'Lloji',      value: propertyTypeLabel(property.type) },
                  { label: 'Ballkon',    value: property.hasBalcony ? 'Po' : 'Jo' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>

              {owner && !isOwner && (
                <div className="border-t border-gray-100 pt-5 mb-5">
                  <p className="text-xs font-medium text-gray-500 mb-3">Shitësi</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold">
                      {owner.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{owner.name}</p>
                      <p className="text-xs text-gray-500">{owner.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {isOwner ? (
                <Link
                  href="/my-properties"
                  className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edito pronën
                </Link>
              ) : (
                <>
                  <button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm mb-2">
                    Kontakto shitësin
                  </button>
                  <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Shto te preferencat
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Insights — only for non-owners */}
        {!isOwner && (
          unlocked ? (
            <PropertyInsights property={property} allProperties={properties} />
          ) : (
            <div className="mt-8">
              <InsightsPaywall propertyId={property.id} onUnlocked={() => setUnlocked(true)} />
            </div>
          )
        )}
      </div>
    </>
  );
}
