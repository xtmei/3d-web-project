import raw from '../../data/stalingrad_datapack.json';
import { datapackSchema } from './schema';
import { expandTemplates } from './expandTemplates';

export function loadDatapack() {
  const parsed = datapackSchema.parse(raw);
  return expandTemplates(parsed);
}
