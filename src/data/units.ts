import type { Datapack, Snapshot, Unit } from "./schema";

export const levelOrder = ["army", "corps", "division", "regiment", "battalion"];

export function buildIndex(units: Unit[]): Record<string, Unit> {
  return Object.fromEntries(units.map((unit) => [unit.id, unit]));
}

export function snapshotForDate(datapack: Datapack, snapshotDate: string): Snapshot {
  return datapack.snapshots.find((snapshot) => snapshot.date === snapshotDate) ?? datapack.snapshots[0];
}

export function rootForSide(snapshot: Snapshot, side: Unit["side"]): string | null {
  for (const rootId of snapshot.roots) {
    const unit = snapshot.units.find((candidate) => candidate.id === rootId);
    if (unit?.side === side) {
      return rootId;
    }
  }
  const fallback = snapshot.units.find((unit) => unit.side === side && unit.parentId == null);
  return fallback?.id ?? null;
}

export function trailToRoot(unitId: string, unitIndexById: Record<string, Unit>): Unit[] {
  const chain: Unit[] = [];
  let cursor: Unit | undefined = unitIndexById[unitId];
  while (cursor) {
    chain.unshift(cursor);
    cursor = cursor.parentId ? unitIndexById[cursor.parentId] : undefined;
  }
  return chain;
}

export function formatNumber(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }
  return `${Math.round(value * 100)}%`;
}

export function matchesSearch(unit: Unit, query: string) {
  if (!query) {
    return true;
  }
  const normalized = query.toLowerCase().trim();
  const haystack = `${unit.id} ${unit.name} ${unit.level} ${unit.type} ${unit.notes.join(" ")} ${unit.tags.join(" ")}`.toLowerCase();
  return haystack.includes(normalized);
}
