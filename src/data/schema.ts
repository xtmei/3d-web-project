import { z } from "zod";

export const sideSchema = z.enum(["soviet", "axis"]);
export type Side = z.infer<typeof sideSchema>;

export const confidenceSchema = z.enum(["high", "medium", "low"]);
export type Confidence = z.infer<typeof confidenceSchema>;

export const provenanceSchema = z.object({
  source_id: z.string(),
  source_title: z.string().optional(),
  source_url: z.string().optional(),
  confidence: confidenceSchema,
  generated_by_template: z.boolean()
});
export type Provenance = z.infer<typeof provenanceSchema>;

export const sourceSchema = z.object({
  source_id: z.string(),
  source_title: z.string().optional(),
  source_url: z.string().optional(),
  confidence: confidenceSchema.optional()
});
export type SourceReference = z.infer<typeof sourceSchema>;

export const summarySchema = z.object({
  manpower_reported: z.number().nullable().optional(),
  manpower_authorized: z.number().nullable().optional(),
  combat_rating: z.number().nullable().optional(),
  fatigue: z.number().nullable().optional(),
  ammo: z.number().nullable().optional(),
  morale: z.number().nullable().optional(),
  weapons_summary: z.string().nullable().optional()
});
export type UnitSummary = z.infer<typeof summarySchema>;

type TemplateRowInput = {
  echelon: "company" | "platoon" | "squad";
  name: string;
  role: string;
  authorized?: Record<string, number>;
  reported?: Record<string, number>;
  weapons?: Record<string, number>;
  notes?: string[];
  parent_key?: string | null;
  row_key?: string;
  children?: TemplateRowInput[];
};

export const templateRowSchema: z.ZodType<TemplateRowInput> = z.lazy(() =>
  z.object({
    echelon: z.enum(["company", "platoon", "squad"]),
    name: z.string(),
    role: z.string(),
    authorized: z.record(z.number()).optional(),
    reported: z.record(z.number()).optional(),
    weapons: z.record(z.number()).optional(),
    notes: z.array(z.string()).optional(),
    parent_key: z.string().nullable().optional(),
    row_key: z.string().optional(),
    children: z.array(templateRowSchema).optional()
  })
);

export const templateSchema = z.object({
  rows: z.array(templateRowSchema)
});
export type TemplateRow = z.infer<typeof templateRowSchema>;

export const companyRowSchema = z.object({
  rowId: z.string(),
  parentRowId: z.string().nullable(),
  echelon: z.enum(["company", "platoon", "squad"]),
  name: z.string(),
  role: z.string(),
  authorized: z.record(z.number()).default({}),
  reported: z.record(z.number()).default({}),
  weapons: z.record(z.number()).default({}),
  notes: z.array(z.string()).default([]),
  provenance: provenanceSchema
});
export type CompanyRow = z.infer<typeof companyRowSchema>;

export const unitSchema = z.object({
  id: z.string(),
  name: z.string(),
  side: sideSchema,
  level: z.string(),
  type: z.string(),
  parentId: z.string().nullable(),
  childrenIds: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  notes: z.array(z.string()).default([]),
  position: z.tuple([z.number(), z.number()]).default([0, 0]),
  summary: summarySchema.optional(),
  company_details: z.array(companyRowSchema).optional(),
  provenance: provenanceSchema
});

export type Unit = z.infer<typeof unitSchema>;

export const snapshotSchema = z.object({
  date: z.string(),
  units: z.array(unitSchema),
  roots: z.array(z.string())
});
export type Snapshot = z.infer<typeof snapshotSchema>;

export const datapackSchema = z.object({
  meta: z.object({
    title: z.string().optional(),
    version: z.string().optional(),
    generated_at: z.string().optional(),
    sources: z.array(sourceSchema)
  }),
  templates: z.record(templateSchema),
  snapshots: z.array(snapshotSchema)
});

export type Datapack = z.infer<typeof datapackSchema>;
