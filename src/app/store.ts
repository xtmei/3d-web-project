import { create } from 'zustand';
import { loadDatapack } from '@/data/loadDatapack';
import { buildIndex } from '@/data/units';

const datapack = loadDatapack();
const defaultSnapshot = datapack.snapshots.find((s: any) => s.date === '1942-11-01') ?? datapack.snapshots[0];

export type Density = 'compact' | 'comfortable';

type AppState = {
  datapack: any;
  snapshotDate: string;
  side: 'soviet' | 'axis';
  selectedUnitId: string | null;
  search: string;
  density: Density;
  layers: { grid: boolean; labels: boolean };
  mobileTab: 'oob' | 'map' | 'details';
  zoom: number;
  cursor: [number, number];
  setSnapshotDate: (date: string) => void;
  setSide: (side: 'soviet' | 'axis') => void;
  setSelectedUnitId: (id: string | null) => void;
  setSearch: (s: string) => void;
  setDensity: (d: Density) => void;
  setLayer: (k: 'grid' | 'labels', v: boolean) => void;
  setMobileTab: (tab: 'oob' | 'map' | 'details') => void;
  setZoom: (z: number) => void;
  setCursor: (c: [number, number]) => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  datapack,
  snapshotDate: defaultSnapshot.date,
  side: 'soviet',
  selectedUnitId: '62A',
  search: '',
  density: 'compact',
  layers: { grid: true, labels: true },
  mobileTab: 'map',
  zoom: 1,
  cursor: [0, 0],
  setSnapshotDate: (snapshotDate) => set({ snapshotDate, selectedUnitId: null }),
  setSide: (side) => set({ side }),
  setSelectedUnitId: (selectedUnitId) => set({ selectedUnitId }),
  setSearch: (search) => set({ search }),
  setDensity: (density) => set({ density }),
  setLayer: (k, v) => set({ layers: { ...get().layers, [k]: v } }),
  setMobileTab: (mobileTab) => set({ mobileTab }),
  setZoom: (zoom) => set({ zoom }),
  setCursor: (cursor) => set({ cursor }),
}));

export const useSnapshot = () => {
  const { datapack, snapshotDate } = useAppStore();
  const snapshot = datapack.snapshots.find((s: any) => s.date === snapshotDate) ?? datapack.snapshots[0];
  return { ...snapshot, unitIndexById: buildIndex(snapshot.units) };
};
