import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type { HTMLAttributes, InputHTMLAttributes } from "react";
import { cn } from "./cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "interactive focus-ring h-8 w-full rounded-[var(--radius4)] border border-[var(--line1)] bg-[var(--bg1)] px-2.5 text-xs text-[var(--fg0)] placeholder:text-[var(--fg2)]",
        "hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--line1))] disabled:cursor-not-allowed disabled:opacity-45",
        className
      )}
      {...props}
    />
  );
}

export type SelectOption = { value: string; label: string };

type SelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
};

export function Select({ value, onValueChange, options, placeholder, className }: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        className={cn(
          "interactive focus-ring inline-flex h-8 items-center justify-between gap-2 rounded-[var(--radius4)] border border-[var(--line1)] bg-[var(--bg1)] px-2.5 text-xs text-[var(--fg0)]",
          "hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--line1))]",
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown size={14} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="z-50 min-w-[12rem] overflow-hidden rounded-[var(--radius4)] border border-[var(--line1)] bg-[var(--bg2)] shadow-[var(--shadow-popover)]"
          sideOffset={6}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="interactive relative flex cursor-pointer select-none items-center rounded-[var(--radius2)] py-1 pl-7 pr-2 text-xs text-[var(--fg0)] data-[highlighted]:bg-[color-mix(in_srgb,var(--accent)_18%,var(--bg2))] data-[highlighted]:outline-none"
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
                  <Check size={12} />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export function InputGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-1", className)} {...props} />;
}
