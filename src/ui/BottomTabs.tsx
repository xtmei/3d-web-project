import { List, Map, Table2 } from "lucide-react";
import { useAppStore } from "@/app/store";
import { cn } from "./components/cn";

const tabs = [
  { id: "oob", label: "OOB", icon: List },
  { id: "map", label: "MAP", icon: Map },
  { id: "details", label: "DETAILS", icon: Table2 }
] as const;

export function BottomTabs() {
  const mobileTab = useAppStore((state) => state.mobileTab);
  const setMobileTab = useAppStore((state) => state.setMobileTab);

  return (
    <nav className="z-10 grid h-11 grid-cols-3 border-t border-[var(--line0)] bg-[var(--bg1)] md:hidden">
      {tabs.map((tab) => {
        const selected = mobileTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMobileTab(tab.id)}
            className={cn(
              "interactive focus-ring flex items-center justify-center gap-1 text-[11px] uppercase tracking-[0.08em]",
              selected
                ? "bg-[color-mix(in_srgb,var(--accent)_16%,var(--bg2))] text-[var(--fg0)]"
                : "text-[var(--fg2)] hover:bg-[var(--bg2)]"
            )}
            aria-current={selected ? "page" : undefined}
          >
            <Icon size={12} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
