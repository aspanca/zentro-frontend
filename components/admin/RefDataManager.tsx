'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/lib/store';
import IconPicker from './IconPicker';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

interface Item { id: number; name: string; slug: string; icon: string; isActive: boolean }
interface Props {
  title: string;
  endpoint: string;     // e.g. /api/admin/cities
  defaultIcon: string;
}

function toSlug(s: string) {
  return s.toLowerCase().trim()
    .replace(/ë/g,'e').replace(/ç/g,'c').replace(/ä/g,'a')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

export default function RefDataManager({ title, endpoint, defaultIcon }: Props) {
  const { adminToken } = useAdminStore();
  const [items, setItems]       = useState<Item[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const blank = { id: 0, name: '', slug: '', icon: defaultIcon, isActive: true };
  const [form, setForm] = useState<Item>(blank);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` };

  const load = async () => {
    setLoading(true);
    const res = await fetch(`${API}${endpoint}`, { headers });
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditItem(null);
    setForm(blank);
    setError('');
    setShowForm(true);
  };

  const openEdit = (item: Item) => {
    setEditItem(item);
    setForm({ ...item });
    setError('');
    setShowForm(true);
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: editItem ? f.slug : toSlug(name) }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) { setError('Emri dhe slug-u janë të detyrueshëm.'); return; }
    setSaving(true);
    setError('');
    try {
      const url  = editItem ? `${API}${endpoint}/${editItem.id}` : `${API}${endpoint}`;
      const method = editItem ? 'PUT' : 'POST';
      const res  = await fetch(url, { method, headers, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Dështoi.'); return; }
      await load();
      setShowForm(false);
    } catch {
      setError('Gabim rrjeti.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Je i sigurt që dëshiron ta fshish këtë element?')) return;
    await fetch(`${API}${endpoint}/${id}`, { method: 'DELETE', headers });
    await load();
  };

  const toggleActive = async (item: Item) => {
    await fetch(`${API}${endpoint}/${item.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...item, isActive: !item.isActive }),
    });
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} rekorde</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Shto
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">{defaultIcon}</p>
          <p>Nuk ka të dhëna akoma.</p>
          <button onClick={openAdd} className="mt-4 text-rose-400 hover:text-rose-300 text-sm font-medium transition-colors">+ Shto të parën</button>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 font-medium px-6 py-4">Ikona</th>
                <th className="text-left text-gray-500 font-medium px-6 py-4">Emri</th>
                <th className="text-left text-gray-500 font-medium px-6 py-4 hidden sm:table-cell">Slug</th>
                <th className="text-left text-gray-500 font-medium px-6 py-4 hidden md:table-cell">Statusi</th>
                <th className="text-right text-gray-500 font-medium px-6 py-4">Veprimet</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} className={`border-b border-gray-800 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-800/30'}`}>
                  <td className="px-6 py-3">
                    <span className="text-2xl">{item.icon}</span>
                  </td>
                  <td className="px-6 py-3 text-white font-medium">{item.name}</td>
                  <td className="px-6 py-3 text-gray-500 font-mono text-xs hidden sm:table-cell">{item.slug}</td>
                  <td className="px-6 py-3 hidden md:table-cell">
                    <button
                      onClick={() => toggleActive(item)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                        item.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-gray-700 text-gray-500 hover:bg-gray-600'
                      }`}
                    >
                      {item.isActive ? 'Aktiv' : 'Joaktiv'}
                    </button>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                        title="Ndrysho"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Fshi"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
              <h3 className="text-white font-semibold">{editItem ? 'Ndrysho' : 'Shto të re'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

              {/* Icon picker */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Ikona</label>
                <IconPicker value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon }))} />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Emri</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="p.sh. Prishtinë"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500 placeholder-gray-600"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="p.sh. prishtine"
                  className="w-full bg-gray-800 border border-gray-700 text-white font-mono rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500 placeholder-gray-600"
                />
                <p className="text-gray-600 text-xs mt-1.5">Gjenerohet automatikisht nga emri. Mund ta ndryshosh.</p>
              </div>

              {/* Active */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className={`w-10 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-emerald-500' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm text-gray-300">Aktiv</span>
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800">
              <button
                onClick={() => setShowForm(false)}
                className="text-sm text-gray-500 hover:text-white px-4 py-2 rounded-xl transition-colors"
              >
                Anulo
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                {saving ? 'Duke ruajtur…' : editItem ? 'Ruaj ndryshimet' : 'Shto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
