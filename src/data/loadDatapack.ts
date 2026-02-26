import raw from "../../data/stalingrad_datapack.json";
import { expandTemplates } from "./expandTemplates";
import { datapackSchema } from "./schema";

export function loadDatapack() {
  const validation = datapackSchema.safeParse(raw);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    throw new Error(`Datapack validation failed at ${firstIssue?.path.join(".") ?? "unknown"}: ${firstIssue?.message ?? "invalid payload"}`);
  }
  return expandTemplates(validation.data);
}
