import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export function ScrollArea({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "h-full overflow-auto",
        "[scrollbar-width:thin] [scrollbar-color:var(--line1)_transparent]",
        "[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[color-mix(in_srgb,var(--line1)_80%,transparent)]",
        "[&::-webkit-scrollbar-thumb:hover]:bg-[var(--line1)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
