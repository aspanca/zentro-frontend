'use client';

import { useState } from 'react';

const ICON_CATEGORIES = {
  'Qytete & vende': ['🏙️','🏰','🏔️','🏛️','🌉','🚉','🌆','🏘️','🏡','🌳','🍇','🏞️','🌄','🌿','⛰️','🌊','🏕️','🌻','🛤️','⚡','🗺️','🧭','🌍','🏟️','🎡'],
  'Ngrohja & energji': ['🔥','🪵','🟤','🔵','⚡','🌡️','🛢️','☀️','💨','🌬️','🏭','🔋','💡','🕯️','♨️'],
  'Amenitete & comfort': ['🛗','🚗','🅿️','❄️','📺','🌐','📦','🏊','🌳','🌿','☀️','🔔','🏋️','🎮','🍳','🛁','🚿','🛋️','🛏️','🧺','🔐','📡'],
  'Kategori prone': ['🏠','🏢','🏬','🏗️','🌾','🏚️','🏦','🏥','🏫','🏪','🏩','🏨','🏤','🏣','⛺','🏯','🏟️','🗼','🗽'],
  'Simbole të tjera': ['✨','⭐','🌟','💎','🔑','🎯','📍','📌','🏷️','🎪','🎨','🎭','🎬','🎤','🏆','🥇','🎖️','🌺','🌸','🍀'],
};

interface Props {
  value: string;
  onChange: (icon: string) => void;
}

export default function IconPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const allIcons = Object.values(ICON_CATEGORIES).flat();
  const filteredCategories = search
    ? { 'Rezultatet': allIcons.filter((i) => i.includes(search)) }
    : ICON_CATEGORIES;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm transition-colors"
      >
        <span className="text-2xl leading-none">{value || '❓'}</span>
        <span className="text-gray-400">Ndrysho ikonën</span>
        <svg className="w-4 h-4 text-gray-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 z-50 w-80 max-h-80 overflow-y-auto bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl">
            <div className="sticky top-0 bg-gray-900 p-3 border-b border-gray-800">
              <input
                type="text"
                placeholder="Kërko ikonë…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500 placeholder-gray-600"
                autoFocus
              />
            </div>
            <div className="p-3 space-y-4">
              {Object.entries(filteredCategories).map(([cat, icons]) => (
                <div key={cat}>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 px-1">{cat}</p>
                  <div className="grid grid-cols-8 gap-1">
                    {icons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => { onChange(icon); setOpen(false); setSearch(''); }}
                        className={`text-xl p-1.5 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center ${value === icon ? 'bg-rose-500/20 ring-1 ring-rose-500' : ''}`}
                        title={icon}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
