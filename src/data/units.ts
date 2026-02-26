import type { Unit } from './schema';

export const levelOrder = ['army', 'corps', 'division', 'regiment', 'battalion'];

export function buildIndex(units: Unit[]) {
  return Object.fromEntries(units.map((u) => [u.id, u]));
}

export const formatNumber = (v: number | null | undefined) => (v == null ? '—' : new Intl.NumberFormat().format(v));
