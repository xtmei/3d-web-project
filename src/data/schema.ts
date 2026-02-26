import { z } from 'zod';

export const provenanceSchema = z.object({
  source_id: z.string(),
  source_title: z.string().optional(),
  source_url: z.string().optional(),
  confidence: z.enum(['high', 'medium', 'low']),
  generated_by_template: z.boolean(),
});

export const companyRowSchema = z.object({
  rowId: z.string(),
  parentRowId: z.string().nullable(),
  echelon: z.enum(['company', 'platoon', 'squad']),
  name: z.string(),
  role: z.string(),
  authorized: z.record(z.number()).default({}),
  reported: z.record(z.number()).default({}),
  weapons: z.record(z.number()).default({}),
  notes: z.array(z.string()).default([]),
  provenance: provenanceSchema,
});

export const unitSchema = z.object({
  id: z.string(), name: z.string(), side: z.enum(['soviet', 'axis']), level: z.string(), type: z.string(),
  parentId: z.string().nullable(), childrenIds: z.array(z.string()), tags: z.array(z.string()), notes: z.array(z.string()),
  position: z.tuple([z.number(), z.number()]).default([0, 0]),
  summary: z.object({
    manpower_reported: z.number().nullable().optional(), manpower_authorized: z.number().nullable().optional(),
    combat_rating: z.number().nullable().optional(), fatigue: z.number().nullable().optional(), morale: z.number().nullable().optional(), ammo: z.number().nullable().optional(), weapons_summary: z.string().nullable().optional(),
  }).optional(),
  company_details: z.array(companyRowSchema).optional(),
  provenance: provenanceSchema,
});

export const snapshotSchema = z.object({ date: z.string(), units: z.array(unitSchema), roots: z.array(z.string()) });
export const datapackSchema = z.object({ meta: z.object({ sources: z.array(z.any()) }), templates: z.record(z.any()), snapshots: z.array(snapshotSchema) });

export type Unit = z.infer<typeof unitSchema>;
export type Snapshot = z.infer<typeof snapshotSchema>;
export type CompanyRow = z.infer<typeof companyRowSchema>;
