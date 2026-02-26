import { useMemo } from "react";
import { useAppStore, useSnapshot } from "@/app/store";

export function StatusBar() {
  const snapshotDate = useAppStore((state) => state.snapshotDate);
  const selectedUnitId = useAppStore((state) => state.selectedUnitId);
  const side = useAppStore((state) => state.side);
  const zoom = useAppStore((state) => state.zoom);
  const cursor = useAppStore((state) => state.cursor);
  const snapshot = useSnapshot();

  const stats = useMemo(() => {
    const bySide = snapshot.units.filter((unit) => unit.side === side);
    let fromSource = 0;
    let generated = 0;

    for (const unit of bySide) {
      if (unit.provenance.generated_by_template) {
        generated += 1;
      } else {
        fromSource += 1;
      }

      for (const row of unit.company_details ?? []) {
        if (row.provenance.generated_by_template) {
          generated += 1;
        } else {
          fromSource += 1;
        }
      }
    }

    return { fromSource, generated };
  }, [side, snapshot.units]);

  return (
    <footer className="z-10 hidden h-[var(--status-height)] items-center gap-3 overflow-x-auto border-t border-[var(--line0)] bg-[var(--bg1)] px-3 text-[11px] md:flex">
      <span className="archive-label !text-[10px]">STATUS</span>
      <span className="mononum text-[var(--fg1)]">SNAPSHOT {snapshotDate}</span>
      <span className="mononum text-[var(--fg1)]">SIDE {side.toUpperCase()}</span>
      <span className="mononum text-[var(--fg1)]">UNIT {selectedUnitId ?? "NO_SELECTION"}</span>
      <span className="mononum text-[var(--fg1)]">ZOOM {zoom.toFixed(2)}x</span>
      <span className="mononum text-[var(--fg1)]">
        CURSOR {cursor[0].toFixed(1)} / {cursor[1].toFixed(1)}
      </span>
      <span className="mononum text-[var(--fg1)]">
        FROM SOURCE {stats.fromSource} ITEMS / GENERATED {stats.generated} ITEMS
      </span>
    </footer>
  );
}
