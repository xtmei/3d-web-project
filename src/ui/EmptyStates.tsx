import { motion } from "framer-motion";

export function EmptyUnitState() {
  return (
    <motion.div
      className="grid h-full place-items-center p-4 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="max-w-sm rounded-[var(--radius4)] border border-[var(--line0)] bg-[var(--bg1)] p-4">
        <div className="archive-label">NO UNIT SELECTED</div>
        <p className="mt-2 text-xs text-[var(--fg1)]">
          Select a battalion node from the OOB tree or map symbols to open the archival dossier.
        </p>
      </div>
    </motion.div>
  );
}

export function NoDataState({ field = "THIS SNAPSHOT" }: { field?: string }) {
  return (
    <div className="rounded-[var(--radius4)] border border-dashed border-[var(--line1)] bg-[var(--bg1)] p-3 text-xs text-[var(--fg1)]">
      <div className="archive-label text-[10px]">NO DATA FOR {field}</div>
      <div className="mt-1">FIELD UNVERIFIED. Complete `data/strength_schema.csv` and merge source citations.</div>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="skeleton h-7 rounded-[var(--radius2)] border border-[var(--line0)]" />
      ))}
    </div>
  );
}

export function TreeSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className="skeleton h-6 rounded-[var(--radius2)] border border-[var(--line0)]" />
      ))}
    </div>
  );
}
