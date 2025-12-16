/**
 * Global App Store
 * 
 * Manages global application state including simulation, network, and UI preferences.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Simulation
  simulationRunning: boolean;
  simulationSpeed: number;
  
  // Network simulation
  networkOnline: boolean;
  networkLatency: number; // ms
  
  // UI
  sidebarCollapsed: boolean;
  selectedFloor: number;
  
  // Developer tools
  devToolsOpen: boolean;
  
  // Actions
  setSimulationRunning: (running: boolean) => void;
  setSimulationSpeed: (speed: number) => void;
  setNetworkOnline: (online: boolean) => void;
  setNetworkLatency: (latency: number) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSelectedFloor: (floor: number) => void;
  setDevToolsOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      simulationRunning: false,
      simulationSpeed: 1,
      networkOnline: true,
      networkLatency: 300,
      sidebarCollapsed: false,
      selectedFloor: 2,
      devToolsOpen: false,

      setSimulationRunning: (running) => set({ simulationRunning: running }),
      setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
      setNetworkOnline: (online) => set({ networkOnline: online }),
      setNetworkLatency: (latency) => set({ networkLatency: latency }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSelectedFloor: (floor) => set({ selectedFloor: floor }),
      setDevToolsOpen: (open) => set({ devToolsOpen: open }),
    }),
    {
      name: 'healthcare-robot-app',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        selectedFloor: state.selectedFloor,
        simulationSpeed: state.simulationSpeed,
      }),
    }
  )
);
