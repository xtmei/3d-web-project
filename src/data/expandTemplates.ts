import type {
  CompanyRow,
  Datapack,
  Provenance,
  Snapshot,
  SourceReference,
  TemplateRow,
  Unit,
  UnitSummary
} from "./schema";

const regimentTemplateTypes = new Set(["rifle_regiment", "infantry_regiment"]);

const TEMPLATE_BY_SIDE_1942 = {
  soviet: "soviet_rifle_battalion_1942_jul",
  axis: "german_infantry_battalion_1942_standard"
} as const;

function cloneDatapack(datapack: Datapack): Datapack {
  return JSON.parse(JSON.stringify(datapack)) as Datapack;
}

function lookupSource(sourceId: string, sourceIndex: Record<string, SourceReference>) {
  return sourceIndex[sourceId];
}

function enrichProvenance(
  provenance: Provenance,
  sourceIndex: Record<string, SourceReference>,
  generatedByTemplate?: boolean
): Provenance {
  const source = lookupSource(provenance.source_id, sourceIndex);
  return {
    ...provenance,
    source_title: provenance.source_title ?? source?.source_title,
    source_url: provenance.source_url ?? source?.source_url,
    generated_by_template: generatedByTemplate ?? provenance.generated_by_template
  };
}

function templateKeyForSide(side: Unit["side"], year: number): string {
  if (year >= 1942) {
    return TEMPLATE_BY_SIDE_1942[side];
  }
  return TEMPLATE_BY_SIDE_1942[side];
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function deriveReportedValue(authorized: Record<string, number>): Record<string, number> {
  const reported: Record<string, number> = {};
  for (const [key, value] of Object.entries(authorized)) {
    reported[key] = Math.max(0, Math.round(value * 0.72));
  }
  return reported;
}

function flattenTemplateRows(
  unitId: string,
  templateRows: TemplateRow[],
  provenance: Provenance
): CompanyRow[] {
  const rows: CompanyRow[] = [];

  const walk = (row: TemplateRow, idxPath: number[], parentRowId: string | null) => {
    const rowKey = row.row_key ?? `${idxPath.join(".")}-${slug(row.name)}`;
    const rowId = `${unitId}::${rowKey}`;
    const normalizedAuthorized = row.authorized ?? {};
    rows.push({
      rowId,
      parentRowId,
      echelon: row.echelon,
      name: row.name,
      role: row.role,
      authorized: normalizedAuthorized,
      reported: row.reported ?? deriveReportedValue(normalizedAuthorized),
      weapons: row.weapons ?? {},
      notes: row.notes ?? ["GENERATED FROM TEMPLATE"],
      provenance
    });

    row.children?.forEach((child, childIndex) => {
      walk(child, [...idxPath, childIndex + 1], rowId);
    });
  };

  templateRows.forEach((row, index) => walk(row, [index + 1], row.parent_key ?? null));
  return rows;
}

function buildSummaryFromRows(rows: CompanyRow[]): UnitSummary {
  const manpowerAuthorized = rows.reduce((acc, row) => acc + (row.authorized.personnel ?? 0), 0);
  const manpowerReported = rows.reduce((acc, row) => acc + (row.reported.personnel ?? 0), 0);
  const ratio = manpowerAuthorized > 0 ? manpowerReported / manpowerAuthorized : null;

  return {
    manpower_authorized: manpowerAuthorized > 0 ? manpowerAuthorized : null,
    manpower_reported: manpowerReported > 0 ? manpowerReported : null,
    combat_rating: ratio == null ? null : Number(Math.max(0.2, Math.min(0.95, ratio)).toFixed(2)),
    fatigue: ratio == null ? null : Number(Math.max(0.1, Math.min(0.9, 1 - ratio * 0.7)).toFixed(2)),
    morale: ratio == null ? null : Number(Math.max(0.25, Math.min(0.9, ratio + 0.1)).toFixed(2)),
    ammo: ratio == null ? null : Number(Math.max(0.2, Math.min(0.88, ratio * 0.92)).toFixed(2)),
    weapons_summary: rows
      .flatMap((row) => Object.keys(row.weapons))
      .filter((value, index, all) => all.indexOf(value) === index)
      .slice(0, 5)
      .join(", ")
  };
}

function shouldExpandRegiment(unit: Unit): boolean {
  return unit.level === "regiment" && regimentTemplateTypes.has(unit.type);
}

function buildBattalionUnit(
  parentRegiment: Unit,
  ordinal: number,
  snapshotYear: number,
  templateRows: TemplateRow[],
  sourceIndex: Record<string, SourceReference>
): Unit {
  const battalionId = `${parentRegiment.id}-Bn${ordinal}`;
  const battalionProvenance = enrichProvenance(parentRegiment.provenance, sourceIndex, true);
  const companyDetails = flattenTemplateRows(battalionId, templateRows, battalionProvenance);
  const summary = buildSummaryFromRows(companyDetails);

  return {
    ...parentRegiment,
    id: battalionId,
    name: `${parentRegiment.name} Battalion ${ordinal}`,
    level: "battalion",
    type: "battalion",
    parentId: parentRegiment.id,
    childrenIds: [],
    notes: [...parentRegiment.notes, `Auto-expanded battalion node (${snapshotYear})`],
    position: [parentRegiment.position[0] + ordinal * 1.3, parentRegiment.position[1] - ordinal * 0.8],
    summary,
    company_details: companyDetails,
    provenance: battalionProvenance
  };
}

function normalizeUnit(
  unit: Unit,
  snapshotYear: number,
  templates: Datapack["templates"],
  sourceIndex: Record<string, SourceReference>
): Unit {
  const normalizedProvenance = enrichProvenance(unit.provenance, sourceIndex);
  const normalized: Unit = {
    ...unit,
    childrenIds: [...unit.childrenIds],
    tags: [...unit.tags],
    notes: [...unit.notes],
    provenance: normalizedProvenance
  };

  if (normalized.level === "battalion" && (!normalized.company_details || normalized.company_details.length === 0)) {
    const templateKey = templateKeyForSide(normalized.side, snapshotYear);
    const templateRows = templates[templateKey]?.rows ?? [];
    const details = flattenTemplateRows(normalized.id, templateRows, enrichProvenance(normalized.provenance, sourceIndex, true));
    normalized.company_details = details;
    normalized.summary = normalized.summary ?? buildSummaryFromRows(details);
    normalized.provenance.generated_by_template = true;
  }

  return normalized;
}

function expandSnapshot(
  snapshot: Snapshot,
  templates: Datapack["templates"],
  sourceIndex: Record<string, SourceReference>
): Snapshot {
  const snapshotYear = Number(snapshot.date.slice(0, 4)) || 1942;
  const baseUnits = snapshot.units.map((unit) => normalizeUnit(unit, snapshotYear, templates, sourceIndex));
  const nextUnits: Unit[] = [...baseUnits];
  const existingIds = new Set(nextUnits.map((unit) => unit.id));

  for (const unit of nextUnits) {
    if (!shouldExpandRegiment(unit)) {
      continue;
    }

    const hasBattalionChild = unit.childrenIds.some((childId) => childId.includes("-Bn"));
    if (hasBattalionChild) {
      continue;
    }

    const templateKey = templateKeyForSide(unit.side, snapshotYear);
    const templateRows = templates[templateKey]?.rows ?? [];

    for (let ordinal = 1; ordinal <= 3; ordinal += 1) {
      const battalionId = `${unit.id}-Bn${ordinal}`;
      if (existingIds.has(battalionId)) {
        continue;
      }
      const battalion = buildBattalionUnit(unit, ordinal, snapshotYear, templateRows, sourceIndex);
      nextUnits.push(battalion);
      existingIds.add(battalionId);
      unit.childrenIds.push(battalionId);
    }
  }

  return {
    ...snapshot,
    units: nextUnits
  };
}

export function expandTemplates(datapack: Datapack): Datapack {
  const cloned = cloneDatapack(datapack);
  const sourceIndex = Object.fromEntries(cloned.meta.sources.map((source) => [source.source_id, source]));
  cloned.snapshots = cloned.snapshots.map((snapshot) => expandSnapshot(snapshot, cloned.templates, sourceIndex));
  return cloned;
}
