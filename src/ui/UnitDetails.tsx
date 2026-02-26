import { useSnapshot, useAppStore } from '@/app/store';
import { EmptyUnitState } from './EmptyStates';
import { Badge } from './components/Badge';
import { SummaryTable } from './tables/SummaryTable';
import { CompanyTable } from './tables/CompanyTable';
import { ScrollArea } from './components/ScrollArea';

export function UnitDetails() {
  const snap = useSnapshot();
  const id = useAppStore(s => s.selectedUnitId);
  const unit = id ? snap.unitIndexById[id] : null;
  if (!unit) return <EmptyUnitState />;
  return <ScrollArea><div className="p-3 space-y-3"><div className="border border-[var(--line0)] p-3"><div className="text-sm font-semibold">{unit.name}</div><div className="text-xs text-[var(--fg1)]">{unit.id} · {unit.level} · {unit.type}</div><div className='flex gap-1 mt-2'><Badge type='source' text='from_source' /><Badge type={unit.provenance.generated_by_template?'generated':'source'} text={unit.provenance.generated_by_template?'generated_by_template':'recorded'} /><Badge type={unit.provenance.confidence} text={unit.provenance.confidence} /></div></div><SummaryTable unit={unit} /><CompanyTable rows={unit.company_details ?? []} /></div></ScrollArea>;
}
