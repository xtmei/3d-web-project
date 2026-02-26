import { formatNumber } from '@/data/units';
import { Popover } from '@/ui/components/Popover';

export function SummaryTable({ unit }: { unit: any }) {
  const s = unit.summary || {};
  const rows = [
    ['manpower_reported', formatNumber(s.manpower_reported)],
    ['manpower_authorized', formatNumber(s.manpower_authorized)],
    ['combat_rating', s.combat_rating ?? '—'],
    ['fatigue', s.fatigue ?? '—'],
    ['ammo', s.ammo ?? '—'],
    ['morale', s.morale ?? '—'],
    ['weapons_summary', s.weapons_summary ?? '—'],
  ];
  return <table className="w-full text-xs mononum"><tbody>{rows.map(([k,v]) => <tr key={k} className="border-b border-[var(--line0)]"><th className="text-left p-2 text-[var(--fg1)]">{k}</th><td className="text-right p-2">{String(v)}</td><td className='p-2'><Popover trigger={<button className='underline'>source</button>}><div className='text-xs'>SOURCE: {unit.provenance.source_id}<br/>CONF: {unit.provenance.confidence}</div></Popover></td></tr>)}</tbody></table>;
}
