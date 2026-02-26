import { Filter, ListFilter, RotateCcw } from "lucide-react";
import { useAppStore, useSnapshot } from "@/app/store";
import { Button } from "./components/Button";
import { Popover } from "./components/Popover";
import { ToggleGroup } from "./components/ToggleGroup";

function MultiCheckList({
  values,
  selected,
  onToggle
}: {
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="max-h-48 space-y-1 overflow-auto pr-1 text-xs">
      {values.map((value) => (
        <label key={value} className="interactive flex cursor-pointer items-center gap-2 rounded-[var(--radius2)] px-1 py-0.5 hover:bg-[var(--bg1)]">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 accent-[var(--accent)]"
            checked={selected.includes(value)}
            onChange={() => onToggle(value)}
          />
          <span className="mononum">{value}</span>
        </label>
      ))}
    </div>
  );
}

export function Filters() {
  const snapshot = useSnapshot();
  const oobFilters = useAppStore((state) => state.oobFilters);
  const toggleFilterValue = useAppStore((state) => state.toggleFilterValue);
  const clearFilters = useAppStore((state) => state.clearFilters);

  const levels = Array.from(new Set(snapshot.units.map((unit) => unit.level))).sort();
  const types = Array.from(new Set(snapshot.units.map((unit) => unit.type))).sort();

  return (
    <div className="space-y-2 border-b border-[var(--line0)] p-2">
      <div className="archive-label flex items-center gap-1">
        <Filter size={12} />
        OOB FILTERS
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <Popover
          trigger={
            <Button variant="outline" size="sm">
              <ListFilter size={12} />
              Side ({oobFilters.sides.length})
            </Button>
          }
        >
          <div className="space-y-2">
            <div className="archive-caption">Side filter (multi-select)</div>
            <ToggleGroup
              options={[
                { value: "soviet", label: "Soviet" },
                { value: "axis", label: "German" }
              ]}
              value={oobFilters.sides}
              onToggle={(value) => toggleFilterValue("sides", value)}
            />
          </div>
        </Popover>
        <Popover
          trigger={
            <Button variant="outline" size="sm">
              Levels ({oobFilters.levels.length || "all"})
            </Button>
          }
        >
          <div className="space-y-2">
            <div className="archive-caption">Level filter</div>
            <MultiCheckList
              values={levels}
              selected={oobFilters.levels}
              onToggle={(value) => toggleFilterValue("levels", value)}
            />
          </div>
        </Popover>
        <Popover
          trigger={
            <Button variant="outline" size="sm">
              Type ({oobFilters.types.length || "all"})
            </Button>
          }
        >
          <div className="space-y-2">
            <div className="archive-caption">Unit type filter</div>
            <MultiCheckList
              values={types}
              selected={oobFilters.types}
              onToggle={(value) => toggleFilterValue("types", value)}
            />
          </div>
        </Popover>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <RotateCcw size={12} />
          Reset
        </Button>
      </div>
    </div>
  );
}
