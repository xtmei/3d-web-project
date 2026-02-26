import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ReactElement, ReactNode } from "react";

export function Popover({
  trigger,
  children,
  side = "bottom"
}: {
  trigger: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{trigger as ReactElement}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          sideOffset={6}
          className="z-50 w-[min(92vw,22rem)] rounded-[var(--radius4)] border border-[var(--line1)] bg-[var(--bg2)] p-3 text-xs text-[var(--fg0)] shadow-[var(--shadow-popover)]"
        >
          {children}
          <PopoverPrimitive.Arrow className="fill-[var(--line1)]" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
