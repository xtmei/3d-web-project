import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

const buttonStyles = cva(
  "interactive focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap border text-xs font-medium uppercase tracking-[0.08em] select-none",
  {
    variants: {
      variant: {
        solid:
          "border-[var(--line1)] bg-[color-mix(in_srgb,var(--accent)_18%,var(--bg2))] text-[var(--fg0)] hover:bg-[color-mix(in_srgb,var(--accent)_25%,var(--bg2))] active:bg-[color-mix(in_srgb,var(--accent)_30%,var(--bg2))]",
        ghost:
          "border-transparent bg-transparent text-[var(--fg1)] hover:text-[var(--fg0)] hover:bg-[var(--bg2)] active:bg-[color-mix(in_srgb,var(--bg2)_86%,black)]",
        outline:
          "border-[var(--line1)] bg-[var(--bg1)] text-[var(--fg1)] hover:border-[var(--accent)] hover:text-[var(--fg0)] active:bg-[var(--bg2)]"
      },
      size: {
        sm: "h-7 px-2.5 rounded-[var(--radius2)]",
        md: "h-8 px-3 rounded-[var(--radius4)]"
      },
      selected: {
        true: "border-[var(--accent)] text-[var(--fg0)]",
        false: ""
      }
    },
    defaultVariants: {
      variant: "outline",
      size: "sm",
      selected: false
    }
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles> & {
    active?: boolean;
  };

export function Button({ className, variant, size, selected, active, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonStyles({ variant, size, selected: selected ?? active }), className)}
      data-active={active ? "true" : "false"}
      {...props}
    />
  );
}
