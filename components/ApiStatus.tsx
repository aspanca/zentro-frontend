'use client';

import { useEffect, useState } from 'react';

export default function ApiStatus() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/`)
      .then((r) => r.json())
      .then((d) => { setStatus('ok'); setMessage(d.message ?? 'Connected'); })
      .catch(() => { setStatus('error'); setMessage('Cannot reach API'); });
  }, []);

  const colors = {
    checking: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    ok:       'bg-green-50  border-green-200  text-green-700',
    error:    'bg-red-50    border-red-200    text-red-700',
  };

  const dot = {
    checking: 'bg-yellow-400 animate-pulse',
    ok:       'bg-green-500',
    error:    'bg-red-500',
  };

  return (
    <div className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${colors[status]}`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot[status]}`} />
      {status === 'checking' ? 'Connecting to API…' : message}
    </div>
  );
}
