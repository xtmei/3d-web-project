import { HelpCircle, PanelLeftClose, PanelRightClose, Search, SlidersHorizontal } from "lucide-react";
import { useAppStore } from "@/app/store";
import { Button } from "./components/Button";
import { Dialog } from "./components/Dialog";
import { Input, InputGroup, Select } from "./components/Input";
import { Kbd } from "./components/Kbd";
import { ToggleGroup } from "./components/ToggleGroup";

type CommandBarProps = {
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
  leftCollapsed?: boolean;
  rightCollapsed?: boolean;
};

export function CommandBar({
  onToggleLeftPanel,
  onToggleRightPanel,
  leftCollapsed = false,
  rightCollapsed = false
}: CommandBarProps) {
  const snapshotDate = useAppStore((state) => state.snapshotDate);
  const setSnapshotDate = useAppStore((state) => state.setSnapshotDate);
  const side = useAppStore((state) => state.side);
  const setSide = useAppStore((state) => state.setSide);
  const search = useAppStore((state) => state.search);
  const setSearch = useAppStore((state) => state.setSearch);
  const density = useAppStore((state) => state.density);
  const setDensity = useAppStore((state) => state.setDensity);
  const layers = useAppStore((state) => state.layers);
  const setLayer = useAppStore((state) => state.setLayer);

  const snapshotOptions = [
    { value: "1942-10-01", label: "1942-10-01" },
    { value: "1942-11-01", label: "1942-11-01" },
    { value: "1942-11-18", label: "1942-11-18" }
  ];

  return (
    <header className="relative z-10 flex h-[var(--command-height)] items-center gap-1 border-b border-[var(--line0)] bg-[var(--bg1)] px-2 md:px-3">
      <div className="hidden items-center gap-1 md:flex">
        <Button
          variant="ghost"
          size="sm"
          active={!leftCollapsed}
          onClick={onToggleLeftPanel}
          aria-label="Toggle OOB panel"
        >
          <PanelLeftClose size={12} />
        </Button>
      </div>

      <Select value={snapshotDate} onValueChange={setSnapshotDate} options={snapshotOptions} className="w-[8.75rem]" />

      <InputGroup className="rounded-[var(--radius4)] border border-[var(--line1)] bg-[var(--bg1)] p-0.5">
        <Button variant={side === "soviet" ? "solid" : "ghost"} size="sm" onClick={() => setSide("soviet")} aria-label="Switch to Soviet side">
          62A
        </Button>
        <Button variant={side === "axis" ? "solid" : "ghost"} size="sm" onClick={() => setSide("axis")} aria-label="Switch to German side">
          6A
        </Button>
      </InputGroup>

      <div className="flex min-w-0 flex-1 items-center gap-1">
        <div className="relative min-w-0 flex-1">
          <Search size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--fg2)]" />
          <Input
            className="pl-6"
            placeholder="Global archive search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Global search"
          />
        </div>
        <Kbd className="hidden md:inline-flex">/</Kbd>
      </div>

      <div className="hidden items-center gap-1 lg:flex">
        <ToggleGroup
          options={[
            { value: "compact", label: "Compact" },
            { value: "comfortable", label: "Comfortable" }
          ]}
          value={[density]}
          onToggle={(value) => setDensity(value === "compact" ? "compact" : "comfortable")}
        />
        <ToggleGroup
          options={[
            { value: "grid", label: "Grid" },
            { value: "labels", label: "Labels" },
            { value: "frontline", label: "Frontline" }
          ]}
          value={(Object.keys(layers) as Array<keyof typeof layers>).filter((key) => layers[key])}
          onToggle={(value) => {
            const key = value as keyof typeof layers;
            setLayer(key, !layers[key]);
          }}
        />
      </div>

      <Dialog
        trigger={
          <Button variant="ghost" size="sm" aria-label="Keyboard hints">
            <HelpCircle size={12} />
            <span className="hidden sm:inline">Keys</span>
          </Button>
        }
        title="Command Shortcuts"
        description="Archive console keyboard navigation"
      >
        <div className="space-y-2 text-xs text-[var(--fg1)]">
          <div className="flex items-center justify-between">
            <span>Focus global search</span>
            <Kbd>/</Kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Switch to MAP</span>
            <Kbd>g</Kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Switch to OOB</span>
            <Kbd>o</Kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Switch to DETAILS</span>
            <Kbd>d</Kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Clear selection</span>
            <Kbd>Esc</Kbd>
          </div>
        </div>
      </Dialog>

      <Button variant="ghost" size="sm" className="hidden md:inline-flex lg:hidden" aria-label="Open display controls">
        <SlidersHorizontal size={12} />
      </Button>

      <div className="hidden items-center gap-1 md:flex">
        <Button
          variant="ghost"
          size="sm"
          active={!rightCollapsed}
          onClick={onToggleRightPanel}
          aria-label="Toggle details panel"
        >
          <PanelRightClose size={12} />
        </Button>
      </div>
    </header>
  );
}
