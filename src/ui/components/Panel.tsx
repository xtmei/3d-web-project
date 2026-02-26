import type { ReactNode } from 'react';
export function Panel({ title, tools, children }: { title: string; tools?: ReactNode; children: ReactNode }) {
  return <section className="h-full border border-[var(--line0)] bg-[var(--bg1)] flex flex-col"><header className="h-10 px-3 border-b border-[var(--line0)] flex items-center justify-between"><h3 className="text-xs tracking-[0.09em] uppercase text-[var(--fg1)]">{title}</h3><div>{tools}</div></header><div className="min-h-0 flex-1 overflow-hidden">{children}</div></section>;
}
