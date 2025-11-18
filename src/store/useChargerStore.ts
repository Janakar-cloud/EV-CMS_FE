/**
 * Charger Store
 * Zustand store for charger-related state management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Charger {
  id: string;
  name: string;
  status: string;
  location: string;
  connectors: number;
  power: number;
}

interface ChargerFilters {
  status?: string;
  location?: string;
  search?: string;
}

interface ChargerState {
  chargers: Charger[];
  selectedCharger: Charger | null;
  filters: ChargerFilters;
  isLoading: boolean;
  
  // Actions
  setChargers: (chargers: Charger[]) => void;
  setSelectedCharger: (charger: Charger | null) => void;
  updateCharger: (id: string, updates: Partial<Charger>) => void;
  setFilters: (filters: ChargerFilters) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
}

export const useChargerStore = create<ChargerState>()(
  devtools(
    (set) => ({
      chargers: [],
      selectedCharger: null,
      filters: {},
      isLoading: false,

      setChargers: (chargers) => set({ chargers }),

      setSelectedCharger: (charger) => set({ selectedCharger: charger }),

      updateCharger: (id, updates) =>
        set((state) => ({
          chargers: state.chargers.map((charger) =>
            charger.id === id ? { ...charger, ...updates } : charger
          ),
        })),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      resetFilters: () => set({ filters: {} }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'ChargerStore',
    }
  )
);
