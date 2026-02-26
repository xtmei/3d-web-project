import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export function Kbd({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex min-h-5 min-w-5 items-center justify-center rounded-[var(--radius2)] border border-[var(--line1)] bg-[var(--bg2)] px-1.5 font-mono text-[10px] text-[var(--fg1)]",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
