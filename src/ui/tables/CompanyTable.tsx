import { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAppStore } from '@/app/store';

export function CompanyTable({ rows = [] }: { rows?: any[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const density = useAppStore((s) => s.density);
  const rowVirtualizer = useVirtualizer({ count: rows.length, getScrollElement: () => parentRef.current, estimateSize: () => density === 'compact' ? 28 : 36 });
  const items = rowVirtualizer.getVirtualItems();
  const total = rowVirtualizer.getTotalSize();
  const flat = useMemo(() => rows, [rows]);
  return <div className="h-[320px] border border-[var(--line0)]"><div className="sticky top-0 grid grid-cols-7 text-[11px] uppercase bg-[var(--bg2)] border-b border-[var(--line0)] px-2 py-1"><span>Name</span><span>Role</span><span className='text-right'>Auth</span><span className='text-right'>Rpt</span><span>Weapons</span><span>Notes</span><span>Prov</span></div><div ref={parentRef} className="h-[286px] overflow-auto relative"><div style={{ height: total, position: 'relative' }}>{items.map(v => { const r = flat[v.index]; return <div key={r.rowId} className="absolute left-0 right-0 grid grid-cols-7 text-xs px-2 border-b border-[var(--line0)] items-center mononum" style={{ transform: `translateY(${v.start}px)`, height: v.size }}><span>{r.name}</span><span>{r.role}</span><span className='text-right'>{r.authorized.personnel ?? '—'}</span><span className='text-right'>{r.reported.personnel ?? '—'}</span><span>{Object.keys(r.weapons).join(', ') || '—'}</span><span>{r.notes?.join('; ') || '—'}</span><span>{r.provenance.generated_by_template ? 'GEN' : 'SRC'}</span></div>; })}</div></div></div>;
}
