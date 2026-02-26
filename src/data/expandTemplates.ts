import type { CompanyRow, Unit } from './schema';

const infantryTypes = new Set(['rifle_regiment', 'infantry_regiment']);

function companyRowsFor(side: 'soviet' | 'axis', source_id: string): CompanyRow[] {
  const names = side === 'soviet'
    ? ['1st Rifle Company', '2nd Rifle Company', '3rd Rifle Company', 'MG Company']
    : ['1. Kompanie', '2. Kompanie', '3. Kompanie', 'Schwere Kompanie'];
  return names.map((name, i) => ({
    rowId: `${name}-${i}`,
    parentRowId: null,
    echelon: 'company',
    name,
    role: i === 3 ? 'support' : 'rifle',
    authorized: { personnel: side === 'soviet' ? 120 : 150 },
    reported: { personnel: side === 'soviet' ? 75 : 88 },
    weapons: side === 'soviet' ? { rifles: 80, smg: 10 } : { rifles: 95, mg34: 10 },
    notes: ['GENERATED FROM TEMPLATE'],
    provenance: { source_id, confidence: 'medium', generated_by_template: true },
  }));
}

export function expandTemplates(datapack: any) {
  datapack.snapshots = datapack.snapshots.map((snapshot: any) => {
    const units: Unit[] = [...snapshot.units];
    const newUnits: Unit[] = [];
    units.forEach((u) => {
      if (u.level === 'regiment' && infantryTypes.has(u.type)) {
        for (let i = 1; i <= 3; i++) {
          const id = `${u.id}-Bn${i}`;
          newUnits.push({
            ...u,
            id,
            name: `${u.name} Battalion ${i}`,
            level: 'battalion',
            type: 'battalion',
            parentId: u.id,
            childrenIds: [],
            position: [u.position[0] + i * 0.8, u.position[1] - i * 0.4],
            summary: {
              manpower_reported: 350 - i * 20,
              manpower_authorized: 550,
              combat_rating: 0.5 + i * 0.1,
              fatigue: 0.4,
              morale: 0.55,
              ammo: 0.52,
              weapons_summary: 'rifles, MG, mortar',
            },
            company_details: companyRowsFor(u.side, u.provenance.source_id),
            provenance: { ...u.provenance, generated_by_template: true },
          });
          u.childrenIds.push(id);
        }
      }
    });
    return { ...snapshot, units: [...units, ...newUnits] };
  });
  return datapack;
}
