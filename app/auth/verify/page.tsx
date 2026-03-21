'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

function VerifyForm() {
  const { verify } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[idx] = val.slice(-1);
    setDigits(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
    if (next.every((d) => d !== '')) submitCode(next.join(''));
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(''));
      submitCode(text);
    }
  };

  const submitCode = async (code: string) => {
    setError('');
    setLoading(true);
    const result = await verify(email, code);
    setLoading(false);
    if (result.ok) {
      router.push('/');
    } else {
      setError(result.error ?? 'Kodi është i gabuar.');
      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifikoni emailin</h1>
        <p className="text-sm text-gray-500 mb-1">Kemi dërguar një kod 6-shifror tek</p>
        <p className="text-sm font-semibold text-gray-800 mb-7">{email}</p>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mb-7" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:border-rose-500 transition-colors"
              style={{ borderColor: d ? '#e11d48' : undefined }}
              disabled={loading}
            />
          ))}
        </div>

        {loading && (
          <p className="text-sm text-gray-400 animate-pulse">Duke verifikuar...</p>
        )}

        <p className="mt-6 text-xs text-gray-400">
          Nuk e morët emailin?{' '}
          <button
            onClick={() => router.push(`/auth/register`)}
            className="text-rose-500 hover:text-rose-600 font-medium"
          >
            Provoni përsëri
          </button>
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
