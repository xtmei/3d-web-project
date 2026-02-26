import { useAppStore } from '@/app/store';
import { Button } from './components/Button';
import { Input } from './components/Input';

export function CommandBar() {
  const s = useAppStore();
  const dates = ['1942-10-01', '1942-11-01', '1942-11-18'];
  return <header className="h-12 border-b border-[var(--line0)] bg-[var(--bg1)] px-3 flex items-center gap-2 text-xs">
    <select className="focus-ring bg-[var(--bg2)] border border-[var(--line1)] px-2 py-1" value={s.snapshotDate} onChange={e => s.setSnapshotDate(e.target.value)}>{dates.map(d => <option key={d}>{d}</option>)}</select>
    <div className="flex border border-[var(--line1)] rounded-[var(--radius4)] overflow-hidden"><Button variant={s.side==='soviet'?'solid':'ghost'} onClick={()=>s.setSide('soviet')}>62A</Button><Button variant={s.side==='axis'?'solid':'ghost'} onClick={()=>s.setSide('axis')}>6A</Button></div>
    <div className="w-64"><Input placeholder="Global archive search ( / )" value={s.search} onChange={e=>s.setSearch(e.target.value)} /></div>
    <Button variant={s.density==='compact'?'solid':'outline'} onClick={()=>s.setDensity(s.density==='compact'?'comfortable':'compact')}>{s.density}</Button>
    <Button variant={s.layers.grid?'solid':'outline'} onClick={()=>s.setLayer('grid', !s.layers.grid)}>Grid</Button>
    <Button variant={s.layers.labels?'solid':'outline'} onClick={()=>s.setLayer('labels', !s.layers.labels)}>Labels</Button>
  </header>
}
