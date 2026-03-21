'use client';

import { useState } from 'react';
import { usePaymentStore } from '@/lib/store';
import PaymentModal, { PaymentMode } from './PaymentModal';

interface Props {
  propertyId: string;
  onUnlocked: () => void;
}

// ─── Static blurred teaser rows ───────────────────────────────────────────────

function BlurRow({ wide = false }: { wide?: boolean }) {
  return (
    <div className={`h-3 rounded-full bg-gray-200 ${wide ? 'w-full' : 'w-2/3'}`} />
  );
}

function TeaserScore() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 select-none">
      <div className="flex items-end justify-between mb-5">
        <div className="space-y-2">
          <div className="h-2.5 w-32 rounded-full bg-gray-200" />
          <div className="flex items-baseline gap-2">
            <div className="h-10 w-14 rounded-xl bg-gray-200" />
            <div className="h-5 w-8 rounded bg-gray-100" />
          </div>
        </div>
        <div className="w-14 h-14 rounded-full bg-gray-200" />
      </div>
      <div className="h-4 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 mb-6" />
      <div className="space-y-2.5">
        <BlurRow />
        <BlurRow wide />
        <BlurRow />
      </div>
    </div>
  );
}

function TeaserAmenity({ emoji }: { emoji: string }) {
  return (
    <div className="py-3.5 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="text-base">{emoji}</span>
          <div className="h-3 w-24 rounded-full bg-gray-200" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-12 rounded-full bg-gray-200" />
          <div className="h-5 w-20 rounded-full bg-gray-100" />
        </div>
      </div>
      <div className="h-2 rounded-full bg-gray-100" />
    </div>
  );
}

function TeaserProfileTile() {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
      <div className="h-5 w-5 rounded bg-gray-200" />
      <div className="h-2 w-12 rounded-full bg-gray-200" />
      <div className="h-3 w-16 rounded-full bg-gray-200" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function InsightsPaywall({ propertyId, onUnlocked }: Props) {
  const { credits, useCredit } = usePaymentStore();
  const [modalMode, setModalMode] = useState<PaymentMode | null>(null);

  const handleUseCredit = () => {
    const ok = useCredit(propertyId);
    if (ok) onUnlocked();
  };

  const handleSuccess = () => {
    setModalMode(null);
    onUnlocked();
  };

  return (
    <>
      <section className="mt-10">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 17, height: 17 }} className="text-rose-500">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Vendndodhja &amp; Analiza</h2>
        </div>

        {/* Blurred teaser */}
        <div className="relative rounded-3xl overflow-hidden">
          {/* Fake content */}
          <div className="space-y-4 pointer-events-none" aria-hidden>
            <TeaserScore />
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
                <div className="h-3 w-28 rounded-full bg-gray-200" />
                <div className="h-3 w-20 rounded-full bg-gray-100" />
              </div>
              <div className="px-6">
                {['🛒','🏥','💊','🚌','🌳','🏫','🧒'].map((e) => (
                  <TeaserAmenity key={e} emoji={e} />
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="h-3 w-32 rounded-full bg-gray-200 mb-1.5" />
                <div className="h-2 w-48 rounded-full bg-gray-100" />
              </div>
              <div className="p-4 grid grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => <TeaserProfileTile key={i} />)}
              </div>
            </div>
          </div>

          {/* Blur gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white" />

          {/* Lock CTA card */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6">

              {/* Lock icon + headline */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Zbulo Analizën e Plotë</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Vlerësimi i pronës, afërsia me shërbime, profili i lagjes dhe analiza e çmimit.
                </p>
              </div>

              {/* Pricing options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {/* Single */}
                <button
                  onClick={() => setModalMode('single')}
                  className="group relative flex flex-col items-start p-4 rounded-2xl border-2 border-gray-200 hover:border-rose-400 hover:bg-rose-50 transition-all text-left"
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Kjo pronë</span>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-rose-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-gray-900">$0.99</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Analizë e vetme, pa kufi kohe</p>
                </button>

                {/* Bundle */}
                <button
                  onClick={() => setModalMode('bundle')}
                  className="group relative flex flex-col items-start p-4 rounded-2xl border-2 border-rose-400 bg-rose-50 hover:bg-rose-100 transition-all text-left"
                >
                  <div className="absolute -top-3 right-3 bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                    Më popular
                  </div>
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="text-xs font-bold text-rose-600 uppercase tracking-wide">50 analiza</span>
                    <svg className="w-4 h-4 text-rose-400 group-hover:text-rose-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-gray-900">$9.99</span>
                    <span className="text-xs font-semibold line-through text-gray-400">$49.50</span>
                  </div>
                  <p className="text-xs text-rose-600 font-semibold mt-1">$0.20 / pronë — kurseni 80%</p>
                </button>
              </div>

              {/* Credits option */}
              {credits > 0 && (
                <button
                  onClick={handleUseCredit}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.077 2.353 1.229V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.228V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-emerald-800">Shfrytëzo 1 kredi</p>
                      <p className="text-xs text-emerald-600">{credits} kredi të mbetura</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Payment modal */}
      {modalMode && (
        <PaymentModal
          propertyId={propertyId}
          mode={modalMode}
          onClose={() => setModalMode(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
