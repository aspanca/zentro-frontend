'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FilterState, Property, User } from '@/types';
import { api, registerAuthHandlers } from './api';

// ─── Auth store ───────────────────────────────────────────────────────────────

interface AuthState {
  currentUser: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; unverified?: boolean }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ ok: boolean; error?: string; email?: string }>;
  verify: (email: string, code: string) => Promise<{ ok: boolean; error?: string }>;
  updateMe: (data: { name?: string; phone?: string; avatar?: string | null }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      accessToken: null,
      refreshToken: null,
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),

      login: async (email, password) => {
        try {
          const data = await api.post('/api/auth/login', { email, password }) as { user: User; accessToken: string; refreshToken: string };
          set({ currentUser: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
          return { ok: true };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Login failed';
          return { ok: false, error: msg, unverified: msg.includes('verify your email') };
        }
      },

      register: async (name, email, password, phone = '') => {
        try {
          const data = await api.post('/api/auth/register', { name, email, password, phone }) as { email: string };
          return { ok: true, email: data.email };
        } catch (err: unknown) {
          return { ok: false, error: err instanceof Error ? err.message : 'Registration failed' };
        }
      },

      verify: async (email, code) => {
        try {
          const data = await api.post('/api/auth/verify', { email, code }) as { user: User; accessToken: string; refreshToken: string };
          set({ currentUser: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
          return { ok: true };
        } catch (err: unknown) {
          return { ok: false, error: err instanceof Error ? err.message : 'Verification failed' };
        }
      },

      updateMe: async (updates) => {
        try {
          const data = await api.put('/api/auth/me', updates) as { user: User };
          set({ currentUser: data.user });
          return { ok: true };
        } catch (err: unknown) {
          return { ok: false, error: err instanceof Error ? err.message : 'Update failed' };
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) await api.post('/api/auth/logout', { refreshToken }).catch(() => {});
        set({ currentUser: null, accessToken: null, refreshToken: null });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const data = await api.post('/api/auth/refresh', { refreshToken }) as { accessToken: string; refreshToken: string };
          set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
          return true;
        } catch {
          set({ currentUser: null, accessToken: null, refreshToken: null });
          return false;
        }
      },
    }),
    {
      name: 'kosova-prona-auth',
      onRehydrateStorage: () => (state) => { state?.setHasHydrated(true); },
    }
  )
);

registerAuthHandlers(
  () => useAuthStore.getState().accessToken,
  () => useAuthStore.getState().refreshAccessToken(),
  () => useAuthStore.getState().accessToken,
);

// ─── Payment store ────────────────────────────────────────────────────────────

interface PaymentState {
  unlockedProperties: string[];
  credits: number;
  isUnlocked: (id: string) => boolean;
  unlockProperty: (id: string) => void;
  addCredits: (n: number) => void;
  useCredit: (id: string) => boolean;
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      unlockedProperties: [],
      credits: 0,
      isUnlocked: (id) => get().unlockedProperties.includes(id),
      unlockProperty: (id) =>
        set((s) => ({ unlockedProperties: s.unlockedProperties.includes(id) ? s.unlockedProperties : [...s.unlockedProperties, id] })),
      addCredits: (n) => set((s) => ({ credits: s.credits + n })),
      useCredit: (id) => {
        if (get().credits <= 0) return false;
        set((s) => ({ credits: s.credits - 1 }));
        get().unlockProperty(id);
        return true;
      },
    }),
    { name: 'kosova-prona-payments-v1' }
  )
);

// ─── Compare store ────────────────────────────────────────────────────────────

interface CompareState {
  ids: string[];
  add:    (id: string) => void;
  remove: (id: string) => void;
  clear:  () => void;
  has:    (id: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      add:    (id) => set((s) => ({ ids: s.ids.includes(id) || s.ids.length >= 3 ? s.ids : [...s.ids, id] })),
      remove: (id) => set((s) => ({ ids: s.ids.filter((i) => i !== id) })),
      clear:  ()   => set({ ids: [] }),
      has:    (id) => get().ids.includes(id),
    }),
    { name: 'zentro-compare-v1' }
  )
);

// ─── Wishlist store ───────────────────────────────────────────────────────────

interface WishlistState {
  ids: string[];
  toggle: (id: string) => void;
  has:    (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((i) => i !== id) : [...s.ids, id] })),
      has:    (id) => get().ids.includes(id),
    }),
    { name: 'zentro-wishlist-v1' }
  )
);

// ─── Property store ───────────────────────────────────────────────────────────

interface PropertyState {
  properties: Property[];
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: unknown) => void;
  toggleArrayFilter: (key: 'furnishing' | 'heating' | 'extras', value: string) => void;
  resetFilters: () => void;
}

export const defaultFilters: FilterState = {
  searchQuery: '',
  city: '',
  listingType: '',
  category: '',
  minPrice: '',
  maxPrice: '',
  minSize: '',
  maxSize: '',
  bedrooms: '',
  bathrooms: '',
  orientation: '',
  furnishing: [],
  heating: [],
  extras: [],
};

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set) => ({
      properties: [],
      filters: defaultFilters,
      setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
      toggleArrayFilter: (key, value) =>
        set((s) => {
          const current = s.filters[key] as string[];
          const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
          return { filters: { ...s.filters, [key]: next } };
        }),
      resetFilters: () => set({ filters: defaultFilters }),
    }),
    { name: 'kosova-prona-filters-v1' }
  )
);
