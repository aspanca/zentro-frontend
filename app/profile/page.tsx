'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { z } from 'zod';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

const profileSchema = z.object({
  name:  z.string().min(2, 'Emri duhet të ketë të paktën 2 karaktere.'),
  phone: z.string().min(6, 'Numri duhet të ketë të paktën 6 karaktere.').optional().or(z.literal('')),
});

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, _hasHydrated, updateMe, logout } = useAuthStore();

  const [name, setName]       = useState('');
  const [phone, setPhone]     = useState('');
  const [avatar, setAvatar]   = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string }>({});
  const avatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!currentUser) { router.replace('/auth/login'); return; }
    setName(currentUser.name ?? '');
    setPhone(currentUser.phone ?? '');
    setAvatar(currentUser.avatar ?? null);
  }, [_hasHydrated, currentUser, router]);

  if (!_hasHydrated || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-rose-500" />
      </div>
    );
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('images', file);
      const data = await api.post('/api/upload', fd) as { urls: string[] };
      setAvatar(data.urls[0]);
    } catch {
      setError('Ngarkimi i fotografisë dështoi.');
    } finally {
      setUploadingAvatar(false);
      if (avatarRef.current) avatarRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setFieldErrors({});

    const parsed = profileSchema.safeParse({ name, phone });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach((err) => { if (err.path[0]) errs[err.path[0] as string] = err.message; });
      setFieldErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const result = await updateMe({ name: name.trim(), phone: phone.trim() || '', avatar });
      if (!result.ok) { setError(result.error ?? 'Ndodhi një gabim.'); return; }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Ndodhi një gabim gjatë ruajtjes.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const initials = currentUser.name
    ? currentUser.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-lg mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profili im</h1>
          <p className="text-gray-500 text-sm mt-1">Përditëso informacionet e llogarisë tënde.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-rose-100 flex items-center justify-center ring-4 ring-white shadow-md">
                {avatar ? (
                  <Image src={avatar} alt="Avatar" fill className="object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-rose-500">{initials}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-60 transition-colors"
              >
                {uploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <p className="text-sm text-gray-500">{currentUser.email}</p>
            {avatar && (
              <button type="button" onClick={() => setAvatar(null)} className="text-xs text-red-500 hover:text-red-700 mt-1.5 font-medium">
                Hiq fotografinë
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Emri i plotë *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Numri i telefonit</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+383 44 000 000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Feedback */}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Profili u ruajt me sukses!
          </div>}

          <button
            type="submit"
            disabled={saving || uploadingAvatar}
            className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Duke ruajtur...</> : 'Ruaj ndryshimet'}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors"
          >
            Dilni nga llogaria
          </button>
        </form>
      </div>
    </div>
  );
}
