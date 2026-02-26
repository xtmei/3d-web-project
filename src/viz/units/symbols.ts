export function shortLabel(id: string) {
  const parts = id.split("-");
  if (parts.length === 1) {
    return id;
  }
  const last = parts[parts.length - 1];
  const prev = parts[parts.length - 2];
  if (/^Bn\d+$/i.test(last)) {
    return `${prev} / ${last}`;
  }
  return `${prev} / ${last}`;
}
