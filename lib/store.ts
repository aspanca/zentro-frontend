'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FilterState, Property, PropertyType, User } from '@/types';
import { mockProperties, mockUsers } from './mockData';

interface AuthState {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  register: (fullName: string, email: string, password: string, companyName?: string) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<Omit<User, 'id' | 'password'>>) => void;
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
      users: mockUsers,
      login: (email, password) => {
        const user = get().users.find(
          (u) => u.email === email && u.password === password
        );
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },
      register: (fullName, email, password, companyName) => {
        const existing = get().users.find((u) => u.email === email);
        if (existing) return false;
        const newUser: User = {
          id: `user-${Date.now()}`,
          fullName,
          email,
          password,
          companyName,
        };
        set((state) => ({
          users: [...state.users, newUser],
          currentUser: newUser,
        }));
        return true;
      },
      logout: () => set({ currentUser: null }),
      updateProfile: (data) => {
        set((state) => {
          if (!state.currentUser) return state;
          const updated = { ...state.currentUser, ...data };
          return {
            currentUser: updated,
            users: state.users.map((u) =>
              u.id === updated.id ? updated : u
            ),
          };
        });
      },
    }),
    { name: 'kosova-prona-auth' }
  )
);

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set, get) => ({
      properties: mockProperties,
      filters: defaultFilters,
      addProperty: (propertyData) => {
        const newProperty: Property = {
          ...propertyData,
          id: `prop-${Date.now()}`,
          createdAt: new Date().toISOString(),
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
    { name: 'kosova-prona-properties' }
  )
);
