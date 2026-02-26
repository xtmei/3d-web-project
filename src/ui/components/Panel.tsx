import type { ReactNode } from "react";
import { cn } from "./cn";

type PanelProps = {
  title: string;
  subtitle?: string;
  tools?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function Panel({ title, subtitle, tools, children, className, bodyClassName }: PanelProps) {
  return (
    <section className={cn("flex h-full min-h-0 flex-col border border-[var(--line0)] bg-[var(--bg1)]", className)}>
      <header className="flex h-10 items-center justify-between gap-2 border-b border-[var(--line0)] px-3">
        <div className="min-w-0">
          <div className="archive-label truncate">{title}</div>
          {subtitle ? <div className="archive-caption truncate">{subtitle}</div> : null}
        </div>
        {tools ? <div className="flex items-center gap-1">{tools}</div> : null}
      </header>
      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}
