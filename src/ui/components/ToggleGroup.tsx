import { cn } from "./cn";

export type ToggleOption = {
  value: string;
  label: string;
};

type ToggleGroupProps = {
  options: ToggleOption[];
  value: string[];
  onToggle: (value: string) => void;
  className?: string;
};

export function ToggleGroup({ options, value, onToggle, className }: ToggleGroupProps) {
  return (
    <div className={cn("inline-flex items-center rounded-[var(--radius4)] border border-[var(--line1)] bg-[var(--bg1)] p-0.5", className)}>
      {options.map((option) => {
        const selected = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            className={cn(
              "interactive focus-ring h-7 rounded-[var(--radius2)] px-2 text-[11px] uppercase tracking-[0.07em]",
              selected
                ? "bg-[color-mix(in_srgb,var(--accent)_18%,var(--bg2))] text-[var(--fg0)]"
                : "text-[var(--fg2)] hover:bg-[var(--bg2)] hover:text-[var(--fg0)]"
            )}
            aria-pressed={selected}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
