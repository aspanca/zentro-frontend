'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FilterState, Property, PropertyType, User } from '@/types';
import { mockProperties } from './mockData';
import { generateMockNearby, generateMockProfile } from './insights';
import { api } from './api';

interface AuthState {
  currentUser: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; unverified?: boolean }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string; email?: string }>;
  verify: (email: string, code: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
}

interface PropertyState {
  properties: Property[];
  filters: FilterState;
  addProperty: (property: Omit<Property, 'id' | 'createdAt'>) => void;
  setFilter: (key: keyof FilterState, value: string | number | PropertyType | '') => void;
  resetFilters: () => void;
  getFilteredProperties: () => Property[];
}

const defaultFilters: FilterState = {
  city: '',
  minPrice: '',
  maxPrice: '',
  propertyType: '',
  searchQuery: '',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      accessToken: null,
      refreshToken: null,

      login: async (email, password) => {
        try {
          const data = await api.post('/api/auth/login', { email, password });
          set({ currentUser: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
          return { ok: true };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Login failed';
          const unverified = msg.includes('verify your email');
          return { ok: false, error: msg, unverified };
        }
      },

      register: async (name, email, password) => {
        try {
          const data = await api.post('/api/auth/register', { name, email, password });
          return { ok: true, email: data.email };
        } catch (err: unknown) {
          return { ok: false, error: err instanceof Error ? err.message : 'Registration failed' };
        }
      },

      verify: async (email, code) => {
        try {
          const data = await api.post('/api/auth/verify', { email, code });
          set({ currentUser: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
          return { ok: true };
        } catch (err: unknown) {
          return { ok: false, error: err instanceof Error ? err.message : 'Verification failed' };
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
          await api.post('/api/auth/logout', { refreshToken }).catch(() => {});
        }
        set({ currentUser: null, accessToken: null, refreshToken: null });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const data = await api.post('/api/auth/refresh', { refreshToken });
          set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
          return true;
        } catch {
          set({ currentUser: null, accessToken: null, refreshToken: null });
          return false;
        }
      },
    }),
    { name: 'kosova-prona-auth' }
  )
);

// ─── Payment store ────────────────────────────────────────────────────────────

interface PaymentState {
  unlockedProperties: string[];
  credits: number;
  isUnlocked: (id: string) => boolean;
  unlockProperty: (id: string) => void;
  addCredits: (n: number) => void;
  useCredit: (id: string) => boolean; // returns false if no credits
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      unlockedProperties: [],
      credits: 0,
      isUnlocked: (id) => get().unlockedProperties.includes(id),
      unlockProperty: (id) =>
        set((s) => ({
          unlockedProperties: s.unlockedProperties.includes(id)
            ? s.unlockedProperties
            : [...s.unlockedProperties, id],
        })),
      addCredits: (n) => set((s) => ({ credits: s.credits + n })),
      useCredit: (id) => {
        const { credits } = get();
        if (credits <= 0) return false;
        set((s) => ({ credits: s.credits - 1 }));
        get().unlockProperty(id);
        return true;
      },
    }),
    { name: 'kosova-prona-payments-v1' }
  )
);

// ─── Property store ───────────────────────────────────────────────────────────

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set, get) => ({
      properties: mockProperties,
      filters: defaultFilters,
      addProperty: (propertyData) => {
        const seed = Date.now() % 4;
        const newProperty: Property = {
          ...propertyData,
          id: `prop-${Date.now()}`,
          createdAt: new Date().toISOString(),
          nearby: propertyData.nearby ?? generateMockNearby(seed),
          neighborhoodProfile: propertyData.neighborhoodProfile ?? generateMockProfile(seed),
        };
        set((state) => ({ properties: [newProperty, ...state.properties] }));
      },
      setFilter: (key, value) => {
        set((state) => ({ filters: { ...state.filters, [key]: value } }));
      },
      resetFilters: () => set({ filters: defaultFilters }),
      getFilteredProperties: () => {
        const { properties, filters } = get();
        return properties.filter((p) => {
          if (filters.city && p.city !== filters.city) return false;
          if (filters.propertyType && p.type !== filters.propertyType) return false;
          if (filters.minPrice !== '' && p.totalPrice < Number(filters.minPrice)) return false;
          if (filters.maxPrice !== '' && p.totalPrice > Number(filters.maxPrice)) return false;
          if (filters.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            return (
              p.title.toLowerCase().includes(q) ||
              p.city.toLowerCase().includes(q) ||
              p.neighborhood.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q)
            );
          }
          return true;
        });
      },
    }),
    { name: 'kosova-prona-properties-v6' }
  )
);
