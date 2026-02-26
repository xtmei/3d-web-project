import { useAppStore, useSnapshot } from '@/app/store';
import { ScrollArea } from './components/ScrollArea';

function Node({ id, depth = 0 }: { id: string; depth?: number }) {
  const snap = useSnapshot();
  const { setSelectedUnitId, selectedUnitId, search, side } = useAppStore();
  const u = snap.unitIndexById[id];
  if (!u || u.side !== side) return null;
  const q = search.toLowerCase();
  if (q && !`${u.id} ${u.name} ${u.type} ${u.level}`.toLowerCase().includes(q)) {
    const hasVisible = u.childrenIds.some((c: string) => {
      const x = snap.unitIndexById[c]; return x && `${x.id} ${x.name}`.toLowerCase().includes(q);
    });
    if (!hasVisible) return null;
  }
  return <div>
    <button className={`w-full text-left px-2 py-1 text-xs border-l-2 ${selectedUnitId===u.id?'bg-[var(--bg2)] border-l-[var(--accent)]':'border-l-transparent'}`} style={{ paddingLeft: 8 + depth * 12 }} onClick={() => setSelectedUnitId(u.id)}>{u.id} · {u.name}</button>
    {u.childrenIds.map((c: string) => <Node key={c} id={c} depth={depth + 1} />)}
  </div>;
}

export function OobTree() { const snap = useSnapshot(); return <ScrollArea><div className="p-2">{snap.roots.map((r: string) => <Node key={r} id={r} />)}</div></ScrollArea>; }
