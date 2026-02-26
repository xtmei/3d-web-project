import { useAppStore, useSnapshot } from '@/app/store';
export function StatusBar() {
  const { snapshotDate, selectedUnitId, side, zoom, cursor } = useAppStore();
  const snap = useSnapshot();
  const counts = snap.units.reduce((a: any, u: any) => { u.provenance.generated_by_template ? a.gen++ : a.src++; return a; }, { src: 0, gen: 0 });
  return <footer className="h-8 border-t border-[var(--line0)] bg-[var(--bg1)] px-3 text-[11px] flex items-center gap-4 mononum"><span>{snapshotDate}</span><span>{side}</span><span>{selectedUnitId ?? 'NO_SELECTION'}</span><span>zoom {zoom.toFixed(2)}x</span><span>{cursor[0].toFixed(1)}, {cursor[1].toFixed(1)}</span><span>source {counts.src} / generated {counts.gen}</span></footer>
}
