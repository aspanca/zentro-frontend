'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useAuthStore } from '@/lib/store';

const schema = z.object({
  name:     z.string().min(2,  'Emri duhet të ketë të paktën 2 karaktere.'),
  email:    z.string().email('Email adresa nuk është e vlefshme.'),
  phone:    z.string().min(6,  'Numri duhet të ketë të paktën 6 karaktere.').optional().or(z.literal('')),
  password: z.string().min(6,  'Fjalëkalimi duhet të ketë të paktën 6 karaktere.'),
});

export default function RegisterPage() {
  const { register } = useAuthStore();
  const router = useRouter();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const parsed = schema.safeParse({ name, email, phone, password });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach((err) => { if (err.path[0]) errs[String(err.path[0])] = err.message; });
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    const result = await register(name, email, password, phone);
    setLoading(false);
    if (result.ok) {
      router.push(`/auth/verify?email=${encodeURIComponent(result.email ?? email)}`);
    } else {
      setError(result.error ?? 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Krijo llogari</h1>
        <p className="text-sm text-gray-500 mb-6">Regjistrohu falas.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Emri i plotë *</label>
            <input
              type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Astrit Spanca"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Numri i telefonit</label>
            <input
              type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+383 44 000 000"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fjalëkalimi *</label>
            <input
              type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 karaktere"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-2.5 rounded-xl text-sm"
          >
            {loading ? 'Duke u regjistruar...' : 'Regjistrohu'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Ke llogari?{' '}
          <Link href="/auth/login" className="text-rose-500 hover:text-rose-600 font-medium">Hyr</Link>
        </p>
      </div>
    </div>
  );
}
