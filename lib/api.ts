const BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Set by the auth store after initialization to avoid circular imports
let _getToken: (() => string | null) | null = null;
let _refreshToken: (() => Promise<boolean>) | null = null;
let _getNewToken: (() => string | null) | null = null;

export function registerAuthHandlers(
  getToken: () => string | null,
  refreshToken: () => Promise<boolean>,
  getNewToken: () => string | null
) {
  _getToken = getToken;
  _refreshToken = refreshToken;
  _getNewToken = getNewToken;
}

async function request(path: string, options: RequestInit = {}, retry = true): Promise<unknown> {
  const token = _getToken?.();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Don't set Content-Type for FormData — let the browser set it with boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  // Auto-refresh on 401 then retry once
  if (res.status === 401 && retry && _refreshToken) {
    const refreshed = await _refreshToken();
    if (refreshed) {
      return request(path, options, false);
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Request failed');
  return data;
}

export const api = {
  post: (path: string, body: unknown, headers?: Record<string, string>) =>
    request(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    }),

  get: (path: string, headers?: Record<string, string>) =>
    request(path, { method: 'GET', headers }),
};
