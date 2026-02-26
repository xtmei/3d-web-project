import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { cn } from "./cn";

type DialogProps = {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
  description?: string;
};

export function Dialog({ trigger, title, description, children }: DialogProps) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>{trigger as ReactElement}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[min(92vw,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius6)] border border-[var(--line1)] bg-[var(--bg2)] p-4 shadow-[var(--shadow-popover)]",
            "focus:outline-none"
          )}
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <DialogPrimitive.Title className="text-sm font-semibold text-[var(--fg0)]">{title}</DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-1 text-xs text-[var(--fg1)]">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close className="interactive focus-ring rounded-[var(--radius2)] border border-[var(--line1)] p-1 text-[var(--fg1)] hover:text-[var(--fg0)]">
              <X size={14} />
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
