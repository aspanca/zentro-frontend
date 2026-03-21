const BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data;
}

export const api = {
  post: (path: string, body: unknown, headers?: Record<string, string>) =>
    request(path, { method: 'POST', body: JSON.stringify(body), headers }),

  get: (path: string, headers?: Record<string, string>) =>
    request(path, { method: 'GET', headers }),
};
