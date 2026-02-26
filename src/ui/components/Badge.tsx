import clsx from 'clsx';
export function Badge({ type, text }: { type: 'source' | 'generated' | 'high' | 'medium' | 'low'; text: string }) {
  const map = { source: 'text-[var(--good)] border-[var(--good)]/40', generated: 'text-[var(--warn)] border-[var(--warn)]/40', high: 'text-[var(--good)] border-[var(--good)]/40', medium: 'text-[var(--warn)] border-[var(--warn)]/40', low: 'text-[var(--bad)] border-[var(--bad)]/40' };
  return <span className={clsx('px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] border rounded-[var(--radius2)]', map[type])}>{text}</span>;
}
