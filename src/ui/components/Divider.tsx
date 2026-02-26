import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export function Divider({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn("border-0 border-t border-[var(--line0)]", className)} {...props} />;
}
