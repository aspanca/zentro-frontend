'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { usePropertyStore, useAuthStore, usePaymentStore, useWishlistStore, useCompareStore } from '@/lib/store';
import { useOptions, toLabels, toIcons } from '@/lib/useOptions';
import { api } from '@/lib/api';
import { Property } from '@/types';
import { formatPrice, formatPricePerSqm, timeAgo } from '@/lib/utils';
import InsightsPaywall from '@/components/InsightsPaywall';

const PropertyInsights = dynamic(() => import('@/components/PropertyInsights'), { ssr: false });

// ─── Label maps ───────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  apartment: 'Banesë', house: 'Shtëpi', office: 'Zyrë', store: 'Dyqan',
  land: 'Tokë', object: 'Objekt', warehouse: 'Depo', business: 'Biznes',
};
const ORIENTATION_LABELS: Record<string, string> = {
  east: 'Lindje', west: 'Perëndim', north: 'Veri', south: 'Jug',
};
const FURNISHING_LABELS: Record<string, string> = {
  living_room: 'Dhoma ndenje', kitchen: 'Kuzhinë', bathroom: 'Banjë',
  bedroom: 'Dhomë gjumi', wc: 'WC', unfurnished: 'Pa mobilim',
};
// Heating + extra labels/icons are now built dynamically from DB data (see useOptions in component)

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ images, startIdx, onClose }: { images: string[]; startIdx: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIdx);
  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowLeft')   prev();
      if (e.key === 'ArrowRight')  next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={onClose}>
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-white/60 text-sm">{idx + 1} / {images.length}</span>
        <button onClick={onClose} className="text-white/70 hover:text-white p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center relative px-12 min-h-0" onClick={(e) => e.stopPropagation()}>
        <img src={images[idx]} alt="" className="max-h-full max-w-full object-contain select-none" draggable={false} />
        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex-shrink-0 flex justify-center gap-2 px-4 py-4 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
          {images.map((img, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${i === idx ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Share button ─────────────────────────────────────────────────────────────

function ShareButton({ title, price }: { title: string; price: string }) {
  const [open, setOpen]   = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const getUrl = () => (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `${title} — ${price} | Zentro`;

  const handleShare = async () => {
    const url = getUrl();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: shareText, url });
        return;
      } catch {
        // user cancelled or not supported — fall through to dropdown
      }
    }
    setOpen((o) => !o);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(getUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  };

  const platforms = [
    {
      label: 'Kopjo linkun',
      icon: copied ? (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      action: copyLink,
      color: 'text-gray-700',
    },
    {
      label: 'WhatsApp',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      action: () => { window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + getUrl())}`); setOpen(false); },
      color: 'text-green-600',
    },
    {
      label: 'Facebook',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      action: () => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`); setOpen(false); },
      color: 'text-blue-600',
    },
    {
      label: 'Viber',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.03 4.451.37 7.375.306 10.988c-.065 3.612-.13 10.384 6.352 12.208h.006l-.007 2.8s-.039.999.623 1.201c.793.246 1.258-.51 2.015-1.325.416-.449.99-1.107 1.424-1.604 3.916.329 6.926-.423 7.272-.534.792-.257 5.277-.831 6.007-6.78.755-6.124-.366-9.989-2.373-11.74l-.002-.002C20.196.718 16.488-.075 11.398.002zm.112 1.97s3.828-.063 6.304 1.633c1.733 1.355 2.588 4.339 1.928 9.282-.593 4.889-4.17 5.17-4.838 5.386-.287.094-2.977.762-6.222.556 0 0-2.47 2.976-3.239 3.748-.119.12-.257.169-.347.149-.129-.028-.165-.178-.164-.39l.031-3.726C4.16 17.205 2.16 13.955 2.214 11.02c.052-2.934.574-5.315 2.173-6.869C6.262 2.483 9.743 1.99 11.51 1.972zM8.358 5.898C8.135 5.89 7.899 5.947 7.69 6.07c-.021.012-.042.025-.063.037-1.195.814-1.462 2.186-1.253 3.554.241 1.548.885 3.117 1.875 4.434 1.017 1.355 2.406 2.467 4.064 3.067 1.075.388 2.162.419 2.968-.112.479-.32.801-.8.874-1.377a.624.624 0 00-.228-.529c-.524-.404-1.04-.782-1.553-1.156-.342-.249-.82-.2-1.111.114-.373.406-.735.835-.889 1.039-.053.07-.138.091-.226.065-1.086-.333-2.021-1.044-2.706-1.977-.649-.879-1.094-1.906-1.255-2.983-.028-.186.02-.284.109-.344.19-.13.595-.321.977-.525.38-.202.604-.622.489-1.028-.199-.703-.434-1.386-.656-2.076-.113-.352-.414-.568-.752-.565z"/>
        </svg>
      ),
      action: () => { window.open(`viber://forward?text=${encodeURIComponent(shareText + ' ' + getUrl())}`); setOpen(false); },
      color: 'text-purple-600',
    },
    {
      label: 'X (Twitter)',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      action: () => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getUrl())}`); setOpen(false); },
      color: 'text-gray-900',
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleShare}
        title="Ndaj pronën"
        className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 overflow-hidden">
          {platforms.map(({ label, icon, action, color }) => (
            <button
              key={label}
              onClick={action}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors text-left ${color}`}
            >
              {icon}
              {copied && label === 'Kopjo linkun' ? 'U kopjua!' : label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Spec card ────────────────────────────────────────────────────────────────

const ACCENT_CLASSES: Record<string, string> = {
  rose: 'bg-rose-50 border-rose-100 text-rose-600',
  blue: 'bg-blue-50 border-blue-100 text-blue-600',
  gray: 'bg-gray-50 border-gray-100 text-gray-700',
};

function SpecCard({ icon, label, value, accent = 'gray' }: {
  icon: string; label: string; value: string | number; accent?: 'rose' | 'blue' | 'gray';
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3.5 ${ACCENT_CLASSES[accent]}`}>
      <span className="text-2xl leading-none flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide opacity-60 leading-none mb-0.5">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Simple sidebar row ───────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-50 last:border-0 text-sm">
      <span className="text-gray-500 flex-shrink-0 mr-4">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { id: string }

type OwnerType = { id: string; name: string; email: string; phone?: string; avatar?: string | null };

export default function PropertyDetail({ id }: Props) {
  const { properties } = usePropertyStore();
  const { currentUser } = useAuthStore();
  const { isUnlocked } = usePaymentStore();
  const { has: inWishlist, toggle: toggleWishlist } = useWishlistStore();
  const { has: inCompare, add: addCompare, remove: removeCompare, ids: compareIds } = useCompareStore();
  const { heatingOptions, amenities: amenityOptions } = useOptions();

  const HEATING_LABELS = toLabels(heatingOptions);
  const EXTRA_LABELS   = toLabels(amenityOptions);
  const EXTRA_ICONS    = toIcons(amenityOptions);
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    // Always fetch from API to get the freshest data including owner info
    api.get(`/api/properties/${id}`)
      .then((data) => { setProperty(data as Property); setUnlocked(isUnlocked(id)); })
      .catch(() => {
        // Fall back to local store
        const local = properties.find((p) => p.id === id);
        if (local) { setProperty(local); setUnlocked(isUnlocked(id)); }
        else setNotFound(true);
      });
  }, [id, isUnlocked]); // eslint-disable-line react-hooks/exhaustive-deps

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Prona nuk u gjet</h1>
        <p className="text-gray-500 mb-6">Kjo pronë nuk ekziston ose është fshirë.</p>
        <Link href="/" className="bg-rose-500 hover:bg-rose-600 text-white font-medium px-6 py-3 rounded-xl">Kthehu në kryefaqe</Link>
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

  const owner  = (property as Property & { owner?: OwnerType }).owner ?? null;
  const isOwner = currentUser?.id === property.userId;
  const images   = property.images    ?? [];
  const extras   = property.extras    ?? [];
  const furnishing = property.furnishing ?? [];
  const heating  = property.heating   ?? [];

  const categoryLabel   = property.category   ? (CATEGORY_LABELS[property.category]   ?? property.category)   : null;
  const isResidential = ['apartment', 'house'].includes(property.category);
  const orientations: string[] = Array.isArray(property.orientation)
    ? property.orientation
    : (property.orientation ? [property.orientation] : []);
  const orientationLabel = orientations.length > 0
    ? orientations.map((o) => ORIENTATION_LABELS[o] ?? o).join(', ')
    : null;
  const balconies = property.balconies ?? (property.hasBalcony ? 1 : 0);
  const listingBadge = property.listingType === 'rent' ? { label: 'Qira', cls: 'bg-blue-500' } : { label: 'Shitje', cls: 'bg-rose-500' };

  return (
    <>
      {lightboxOpen && <Lightbox images={images} startIdx={activeImage} onClose={() => setLightboxOpen(false)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-6 group">
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kthehu
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left column ────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Gallery */}
            <div>
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[16/9] cursor-zoom-in group" onClick={() => setLightboxOpen(true)}>
                <img
                  src={images[activeImage] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`${listingBadge.cls} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow`}>{listingBadge.label}</span>
                  {categoryLabel && (
                    <span className="bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">{categoryLabel}</span>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    {activeImage + 1} / {images.length}
                  </div>
                )}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                  Zgjero
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button key={idx} onClick={() => setActiveImage(idx)}
                      className={`w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === idx ? 'border-rose-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title + location */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                {/* Wishlist + Compare + Share */}
                <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                  <button
                    onClick={() => toggleWishlist(String(property.id))}
                    title={inWishlist(String(property.id)) ? 'Hiq nga lista' : 'Shto në listë dëshirash'}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                      inWishlist(String(property.id))
                        ? 'bg-rose-500 border-rose-500 text-white'
                        : 'bg-white border-gray-200 text-gray-400 hover:border-rose-300 hover:text-rose-500'
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill={inWishlist(String(property.id)) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => inCompare(String(property.id)) ? removeCompare(String(property.id)) : addCompare(String(property.id))}
                    disabled={compareIds.length >= 3 && !inCompare(String(property.id))}
                    title={inCompare(String(property.id)) ? 'Hiq nga krahasimi' : compareIds.length >= 3 ? 'Maksimumi 3 prona' : 'Shto në krahasim'}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      inCompare(String(property.id))
                        ? 'bg-indigo-500 border-indigo-500 text-white'
                        : 'bg-white border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-500'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </button>
                  <ShareButton title={property.title} price={formatPrice(property.totalPrice)} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-gray-500 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{property.neighborhood}, {property.city}</span>
                <span className="text-gray-300">·</span>
                <span>{timeAgo(property.createdAt)}</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: `${property.size} m²`,        label: 'Sipërfaqja', show: true },
                { value: `€${property.pricePerSqm.toLocaleString()}`, label: '/ m²', show: true },
                { value: property.bedrooms ?? '—',     label: 'Dhoma gjumi', show: isResidential },
                { value: property.bathrooms ?? '—',    label: 'Banjo', show: isResidential },
              ].filter((s) => s.show).map(({ value, label }) => (
                <div key={label} className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">Rreth kësaj prone</h2>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{property.description}</p>
            </div>

            {/* Full details — icon grid */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-5">Të dhënat e pronës</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <SpecCard icon="🏷️" label="Listimi"    value={property.listingType === 'rent' ? 'Qira' : 'Shitje'} accent={property.listingType === 'rent' ? 'blue' : 'rose'} />
                {categoryLabel && <SpecCard icon="🏠" label="Kategoria"  value={categoryLabel} />}
                <SpecCard icon="📐" label="Sipërfaqja" value={`${property.size} m²`} />
                <SpecCard icon="💰" label="Çmimi total" value={formatPrice(property.totalPrice)} />
                <SpecCard icon="📊" label="Çmimi / m²" value={formatPricePerSqm(property.pricePerSqm)} />
                {isResidential && (property.bedrooms ?? 0) > 0 && <SpecCard icon="🛏️" label="Dhoma gjumi" value={String(property.bedrooms)} />}
                {isResidential && (property.bathrooms ?? 0) > 0 && <SpecCard icon="🚿" label="Banjo"       value={String(property.bathrooms)} />}
                {(property.wc ?? 0) > 0 && <SpecCard icon="🚽" label="WC" value={String(property.wc)} />}
                {(property.storage ?? 0) > 0 && <SpecCard icon="📦" label="Depo" value={String(property.storage)} />}
                {isResidential && property.floor != null && <SpecCard icon="🏗️" label="Kati" value={property.floor === 0 ? 'Përdhesë' : `Kati ${property.floor}`} />}
                <SpecCard icon="📍" label="Qyteti"    value={property.city} />
                <SpecCard icon="🏘️" label="Lagja"     value={property.neighborhood} />
                {isResidential && <SpecCard icon={balconies > 0 ? '✅' : '❌'} label="Ballkone" value={balconies > 0 ? String(balconies) : 'Pa ballkon'} />}
                {orientationLabel && <SpecCard icon="🧭" label="Orientimi" value={orientationLabel} />}
              </div>
            </div>

            {/* Furnishing / Heating / Extras */}
            {(furnishing.length > 0 || heating.length > 0 || extras.length > 0) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                <h2 className="text-base font-bold text-gray-900">Veçoritë</h2>
                {furnishing.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Mobilimi</p>
                    <div className="flex flex-wrap gap-2">
                      {furnishing.map((v) => (
                        <span key={v} className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-700 text-sm font-medium px-3 py-1.5 rounded-full">
                          🛋️ {FURNISHING_LABELS[v] ?? v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {heating.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sistemi i ngrohjes</p>
                    <div className="flex flex-wrap gap-2">
                      {heating.map((v) => (
                        <span key={v} className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-700 text-sm font-medium px-3 py-1.5 rounded-full">
                          🔥 {HEATING_LABELS[v] ?? v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {extras.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Të tjera</p>
                    <div className="flex flex-wrap gap-2">
                      {extras.map((v) => (
                        <span key={v} className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium px-3 py-1.5 rounded-full">
                          {EXTRA_ICONS[v] ?? '✨'} {EXTRA_LABELS[v] ?? v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Sidebar ───────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20 space-y-5">
              {/* Price */}
              <div>
                <p className="text-3xl font-bold text-gray-900">{formatPrice(property.totalPrice)}</p>
                <p className="text-sm text-gray-500 mt-0.5">{formatPricePerSqm(property.pricePerSqm)}</p>
              </div>

              {/* Key facts */}
              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <DetailRow label="Sipërfaqja" value={`${property.size} m²`} />
                {isResidential && <DetailRow label="Dhoma gjumi" value={property.bedrooms} />}
                {isResidential && <DetailRow label="Banjo"       value={property.bathrooms} />}
                {(property.wc ?? 0) > 0 && <DetailRow label="WC" value={property.wc} />}
                {(property.storage ?? 0) > 0 && <DetailRow label="Depo" value={property.storage} />}
                {isResidential && property.floor != null && <DetailRow label="Kati" value={property.floor === 0 ? 'Përdhesë' : `Kati ${property.floor}`} />}
                {isResidential && <DetailRow label="Ballkone"    value={balconies > 0 ? String(balconies) : 'Jo'} />}
                <DetailRow label="Kategoria"   value={categoryLabel} />
              </div>

              {/* Owner */}
              {owner && !isOwner && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-500 mb-3">Shitësi / Qiradhënësi</p>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-rose-100 flex items-center justify-center text-rose-600 font-semibold flex-shrink-0">
                    {owner.avatar ? (
                      <Image src={owner.avatar} alt={owner.name ?? ''} width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                      owner.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{owner.name}</p>
                      {owner.phone && <p className="text-xs text-gray-500">{owner.phone}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* CTA */}
              {isOwner ? (
                <Link href="/my-properties"
                  className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3.5 rounded-xl text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edito pronën
                </Link>
              ) : (
                <button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3.5 rounded-xl text-sm">
                  Kontakto shitësin
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Analysis (credits) — only logged-in non-owners ─────── */}
        {currentUser && !isOwner && (
          <div className="mt-10">
            {unlocked ? (
              <PropertyInsights property={property} allProperties={properties} />
            ) : (
              <InsightsPaywall propertyId={property.id} onUnlocked={() => setUnlocked(true)} />
            )}
          </div>
        )}
      </div>
    </>
  );
}
