export function shortLabel(id: string) { const p = id.split('-'); return p.length > 1 ? `${p[p.length - 2]}/${p[p.length - 1]}` : id; }
