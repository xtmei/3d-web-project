import * as React from "react";
import { create } from "zustand";
import { loadDatapack } from "@/data/loadDatapack";
import type { Datapack, Side, Snapshot, Unit } from "@/data/schema";
import { buildIndex, rootForSide, snapshotForDate } from "@/data/units";

export type Density = "compact" | "comfortable";
export type MobileTab = "oob" | "map" | "details";

type OobFilters = {
  sides: Side[];
  levels: string[];
  types: string[];
};

type LoadState = "loading" | "ready" | "error";

type BootPayload = {
  datapack: Datapack;
  loadState: LoadState;
  error: string | null;
};

function getFallbackDatapack(error: unknown): BootPayload {
  return {
    datapack: {
      meta: { title: "Unavailable datapack", sources: [] },
      templates: {},
      snapshots: [{ date: "N/A", units: [], roots: [] }]
    },
    loadState: "error",
    error: error instanceof Error ? error.message : "Unknown datapack load failure"
  };
}

function bootstrapDatapack(): BootPayload {
  try {
    return {
      datapack: loadDatapack(),
      loadState: "loading",
      error: null
    };
  } catch (error) {
    return getFallbackDatapack(error);
  }
}

const boot = bootstrapDatapack();
const defaultSnapshot = snapshotForDate(boot.datapack, "1942-11-01");
const defaultSide: Side = "soviet";

function unitExists(snapshot: Snapshot, unitId: string | null): boolean {
  if (!unitId) {
    return false;
  }
  return snapshot.units.some((unit) => unit.id === unitId);
}

type AppState = {
  datapack: Datapack;
  loadState: LoadState;
  error: string | null;
  snapshotDate: string;
  side: Side;
  selectedUnitId: string | null;
  focusedUnitId: string | null;
  pinnedUnitIds: string[];
  search: string;
  density: Density;
  layers: { grid: boolean; labels: boolean; frontline: boolean };
  mobileTab: MobileTab;
  zoom: number;
  cursor: [number, number];
  oobFilters: OobFilters;
  panelCollapsed: { left: boolean; right: boolean };
  setLoadState: (loadState: LoadState) => void;
  setSnapshotDate: (date: string) => void;
  setSide: (side: Side) => void;
  setSelectedUnitId: (unitId: string | null) => void;
  setFocusedUnitId: (unitId: string | null) => void;
  togglePinnedUnitId: (unitId: string) => void;
  setSearch: (search: string) => void;
  setDensity: (density: Density) => void;
  setLayer: (layer: "grid" | "labels" | "frontline", value: boolean) => void;
  setMobileTab: (tab: MobileTab) => void;
  setZoom: (zoom: number) => void;
  setCursor: (cursor: [number, number]) => void;
  toggleFilterValue: (bucket: keyof OobFilters, value: string) => void;
  clearFilters: () => void;
  togglePanelCollapsed: (panel: "left" | "right") => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  datapack: boot.datapack,
  loadState: boot.loadState,
  error: boot.error,
  snapshotDate: defaultSnapshot.date,
  side: defaultSide,
  selectedUnitId: "62A",
  focusedUnitId: null,
  pinnedUnitIds: [],
  search: "",
  density: "compact",
  layers: { grid: true, labels: true, frontline: true },
  mobileTab: "map",
  zoom: 1.1,
  cursor: [0, 0],
  oobFilters: { sides: ["soviet", "axis"], levels: [], types: [] },
  panelCollapsed: { left: false, right: false },
  setLoadState: (loadState) => set({ loadState }),
  setSnapshotDate: (snapshotDate) => {
    const snapshot = snapshotForDate(get().datapack, snapshotDate);
    const selectedUnitId = unitExists(snapshot, get().selectedUnitId) ? get().selectedUnitId : rootForSide(snapshot, get().side);
    set({
      snapshotDate,
      selectedUnitId,
      focusedUnitId: null
    });
  },
  setSide: (side) => {
    const snapshot = snapshotForDate(get().datapack, get().snapshotDate);
    const selected = get().selectedUnitId ? snapshot.units.find((unit) => unit.id === get().selectedUnitId) : undefined;
    const selectedUnitId = selected && selected.side === side ? selected.id : rootForSide(snapshot, side);
    set({
      side,
      selectedUnitId,
      focusedUnitId: selectedUnitId
    });
  },
  setSelectedUnitId: (selectedUnitId) => set({ selectedUnitId }),
  setFocusedUnitId: (focusedUnitId) => set({ focusedUnitId }),
  togglePinnedUnitId: (unitId) => {
    const next = new Set(get().pinnedUnitIds);
    if (next.has(unitId)) {
      next.delete(unitId);
    } else {
      next.add(unitId);
    }
    set({ pinnedUnitIds: Array.from(next) });
  },
  setSearch: (search) => set({ search }),
  setDensity: (density) => set({ density }),
  setLayer: (layer, value) => set({ layers: { ...get().layers, [layer]: value } }),
  setMobileTab: (mobileTab) => set({ mobileTab }),
  setZoom: (zoom) => set({ zoom: Math.max(0.45, Math.min(3.2, zoom)) }),
  setCursor: (cursor) => set({ cursor }),
  toggleFilterValue: (bucket, value) => {
    const current = get().oobFilters[bucket] as string[];
    const next = new Set(current);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    set({ oobFilters: { ...get().oobFilters, [bucket]: Array.from(next) as OobFilters[keyof OobFilters] } });
  },
  clearFilters: () => set({ oobFilters: { sides: ["soviet", "axis"], levels: [], types: [] } }),
  togglePanelCollapsed: (panel) =>
    set({
      panelCollapsed: {
        ...get().panelCollapsed,
        [panel]: !get().panelCollapsed[panel]
      }
    })
}));

export type SnapshotWithIndex = Snapshot & { unitIndexById: Record<string, Unit> };

export function useSnapshot(): SnapshotWithIndex {
  const datapack = useAppStore((state) => state.datapack);
  const snapshotDate = useAppStore((state) => state.snapshotDate);

  return React.useMemo(() => {
    const snapshot = snapshotForDate(datapack, snapshotDate);
    return {
      ...snapshot,
      unitIndexById: buildIndex(snapshot.units)
    };
  }, [datapack, snapshotDate]);
}
