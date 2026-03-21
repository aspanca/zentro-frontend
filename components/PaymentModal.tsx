'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePaymentStore } from '@/lib/store';

export type PaymentMode = 'single' | 'bundle';

interface Props {
  propertyId: string;
  mode: PaymentMode;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'form' | 'processing' | 'success';

// ─── card helpers ─────────────────────────────────────────────────────────────

function formatCardNumber(raw: string) {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})(?=.)/g, '$1 ');
}
function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + ' / ' + digits.slice(2);
  return digits;
}
function cardType(num: string): { label: string; color: string } | null {
  const d = num.replace(/\s/g, '');
  if (d.startsWith('4'))  return { label: 'Visa',       color: 'text-blue-600' };
  if (d.startsWith('5'))  return { label: 'Mastercard', color: 'text-red-500'  };
  if (d.startsWith('37')) return { label: 'Amex',       color: 'text-green-600'};
  return null;
}

// ─── component ────────────────────────────────────────────────────────────────

export default function PaymentModal({ propertyId, mode, onClose, onSuccess }: Props) {
  const { unlockProperty, addCredits } = usePaymentStore();
  const [step, setStep]     = useState<Step>('form');
  const [name, setName]     = useState('');
  const [card, setCard]     = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv]       = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const amount  = mode === 'single' ? '0.99' : '9.99';
  const credits = mode === 'bundle' ? 50 : 1;

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!name.trim())                          e.name   = 'Emri është i detyrueshëm';
    if (card.replace(/\s/g,'').length < 16)    e.card   = 'Numri i kartës duhet 16 shifra';
    if (!expiry.includes('/'))                 e.expiry = 'Formati MM / VV';
    if (cvv.length < 3)                        e.cvv    = 'CVV duhet 3–4 shifra';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [name, card, expiry, cvv]);

  const handlePay = async () => {
    if (!validate()) return;
    setStep('processing');
    await new Promise((r) => setTimeout(r, 2200));
    if (mode === 'bundle') {
      addCredits(50);
    }
    unlockProperty(propertyId);
    setStep('success');
    setTimeout(onSuccess, 1800);
  };

  const ct = cardType(card);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* ── Success ── */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5 animate-bounce">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagesa u krye!</h2>
            <p className="text-gray-500 text-sm">
              {mode === 'bundle'
                ? '50 analiza u shtuan në llogarinë tënde.'
                : 'Analiza e pronës është e disponueshme.'}
            </p>
          </div>
        )}

        {/* ── Processing ── */}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin mb-6" />
            <p className="text-gray-700 font-semibold">Duke procesuar pagesën...</p>
            <p className="text-gray-400 text-xs mt-1">Ju lutemi prisni</p>
          </div>
        )}

        {/* ── Form ── */}
        {step === 'form' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                  {mode === 'single' ? 'Analiza — 1 pronë' : 'Paketë — 50 analiza'}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-gray-900">${amount}</span>
                  {mode === 'bundle' && (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Kurseni 90%
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* What you get */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2.5">Çfarë përfshihet</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { icon: '📊', text: `Vlerësim ${mode === 'bundle' ? '50 pronave' : 'pronës'}` },
                  { icon: '📍', text: 'Afërsia me shërbime' },
                  { icon: '💰', text: 'Analiza e çmimit' },
                  { icon: '🏘️', text: 'Profili i lagjes' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{f.icon}</span>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card form */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Emri mbi kartë</label>
                <input
                  type="text"
                  placeholder="Arben Gashi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Numri i kartës</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    value={card}
                    onChange={(e) => setCard(formatCardNumber(e.target.value))}
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all ${errors.card ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  />
                  {ct && (
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold ${ct.color}`}>
                      {ct.label}
                    </span>
                  )}
                </div>
                {errors.card && <p className="text-xs text-red-500 mt-1">{errors.card}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Skadon</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM / VV"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all ${errors.expiry ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  />
                  {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">CVV</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="•••"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))}
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all ${errors.cvv ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  />
                  {errors.cvv && <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={handlePay}
                className="w-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-bold py-4 rounded-2xl transition-colors text-base"
              >
                Paguaj ${amount}
              </button>
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Pagesa e sigurt — encrypted me SSL</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
