import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "./cn";

const badgeStyles = cva(
  "interactive inline-flex items-center gap-1 rounded-[var(--radius2)] border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em]",
  {
    variants: {
      kind: {
        from_source: "border-[color-mix(in_srgb,var(--good)_45%,transparent)] text-[var(--good)]",
        generated_by_template: "border-[color-mix(in_srgb,var(--warn)_45%,transparent)] text-[var(--warn)]",
        high: "border-[color-mix(in_srgb,var(--good)_45%,transparent)] text-[var(--good)]",
        medium: "border-[color-mix(in_srgb,var(--warn)_45%,transparent)] text-[var(--warn)]",
        low: "border-[color-mix(in_srgb,var(--bad)_45%,transparent)] text-[var(--bad)]"
      },
      interactive: {
        true: "cursor-pointer hover:bg-[var(--bg2)] active:bg-[color-mix(in_srgb,var(--bg2)_85%,black)]",
        false: ""
      }
    },
    defaultVariants: {
      kind: "from_source",
      interactive: false
    }
  }
);

type BadgeProps = VariantProps<typeof badgeStyles> &
  HTMLAttributes<HTMLSpanElement> & {
    label: string;
  };

export function Badge({ kind, interactive, className, label, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeStyles({ kind, interactive }), className)} {...props}>
      {label}
    </span>
  );
}

type BadgeButtonProps = VariantProps<typeof badgeStyles> &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    label: string;
  };

export function BadgeButton({ kind, interactive = true, className, label, ...props }: BadgeButtonProps) {
  return (
    <button type="button" className={cn(badgeStyles({ kind, interactive }), className)} {...props}>
      {label}
    </button>
  );
}
