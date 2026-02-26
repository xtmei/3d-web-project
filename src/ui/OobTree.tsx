import { useEffect, useMemo, useState } from "react";
import {
  Binoculars,
  ChevronDown,
  ChevronRight,
  Flag,
  Pin,
  Radar,
  Shield,
  Swords,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore, useSnapshot } from "@/app/store";
import { matchesSearch } from "@/data/units";
import type { Unit } from "@/data/schema";
import { Filters } from "./Filters";
import { TreeSkeleton } from "./EmptyStates";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { ScrollArea } from "./components/ScrollArea";
import { Tooltip } from "./components/Tooltip";
import { cn } from "./components/cn";

function levelIcon(level: string) {
  switch (level) {
    case "army":
      return <Swords size={12} />;
    case "corps":
      return <Shield size={12} />;
    case "division":
      return <Flag size={12} />;
    case "regiment":
      return <Users size={12} />;
    case "battalion":
      return <Radar size={12} />;
    default:
      return <Binoculars size={12} />;
  }
}

function useUnitVisibility() {
  const snapshot = useSnapshot();
  const query = useAppStore((state) => state.search).trim().toLowerCase();
  const filters = useAppStore((state) => state.oobFilters);

  const passesFilter = (unit: Unit) => {
    if (!filters.sides.includes(unit.side)) {
      return false;
    }
    if (filters.levels.length > 0 && !filters.levels.includes(unit.level)) {
      return false;
    }
    if (filters.types.length > 0 && !filters.types.includes(unit.type)) {
      return false;
    }
    return true;
  };

  const visibility = useMemo(() => {
    const cache = new Map<string, boolean>();
    const isVisible = (unitId: string): boolean => {
      if (cache.has(unitId)) {
        return cache.get(unitId) ?? false;
      }
      const unit = snapshot.unitIndexById[unitId];
      if (!unit) {
        cache.set(unitId, false);
        return false;
      }
      const selfVisible = passesFilter(unit) && matchesSearch(unit, query);
      const childVisible = unit.childrenIds.some((childId) => isVisible(childId));
      const result = selfVisible || childVisible;
      cache.set(unitId, result);
      return result;
    };

    for (const unit of snapshot.units) {
      isVisible(unit.id);
    }
    return cache;
  }, [query, snapshot, filters.levels, filters.sides, filters.types]);

  return visibility;
}

type TreeNodeProps = {
  unitId: string;
  depth: number;
  expanded: Set<string>;
  onToggleExpand: (unitId: string) => void;
  visibility: Map<string, boolean>;
};

function TreeNode({ unitId, depth, expanded, onToggleExpand, visibility }: TreeNodeProps) {
  const snapshot = useSnapshot();
  const unit = snapshot.unitIndexById[unitId];
  const selectedUnitId = useAppStore((state) => state.selectedUnitId);
  const pinnedUnitIds = useAppStore((state) => state.pinnedUnitIds);
  const setSelectedUnitId = useAppStore((state) => state.setSelectedUnitId);
  const setFocusedUnitId = useAppStore((state) => state.setFocusedUnitId);
  const togglePinnedUnitId = useAppStore((state) => state.togglePinnedUnitId);
  const setMobileTab = useAppStore((state) => state.setMobileTab);

  if (!unit || !visibility.get(unit.id)) {
    return null;
  }

  const hasChildren = unit.childrenIds.some((childId) => visibility.get(childId));
  const isExpanded = expanded.has(unit.id);
  const selected = selectedUnitId === unit.id;
  const pinned = pinnedUnitIds.includes(unit.id);

  return (
    <div>
      <motion.div
        className={cn(
          "group relative flex items-center gap-1 border-l-2 px-1 py-0.5",
          selected ? "border-l-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,var(--bg1))]" : "border-l-transparent hover:bg-[var(--bg2)]"
        )}
        style={{ paddingLeft: 6 + depth * 12 }}
        layout
        transition={{ duration: 0.12 }}
      >
        <button
          type="button"
          className="interactive focus-ring flex h-5 w-5 items-center justify-center rounded-[var(--radius2)] text-[var(--fg1)] hover:bg-[var(--bg2)] hover:text-[var(--fg0)]"
          onClick={() => hasChildren && onToggleExpand(unit.id)}
          aria-label={isExpanded ? "Collapse node" : "Expand node"}
          disabled={!hasChildren}
        >
          {hasChildren ? (isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : null}
        </button>
        <button
          type="button"
          className="interactive focus-ring flex min-w-0 flex-1 items-center gap-1 rounded-[var(--radius2)] px-1 py-0.5 text-left text-xs"
          onClick={() => setSelectedUnitId(unit.id)}
        >
          <span className="text-[var(--fg2)]">{levelIcon(unit.level)}</span>
          <span className="mononum text-[var(--fg1)]">{unit.id}</span>
          <span className="truncate text-[var(--fg0)]">{unit.name}</span>
          <span className="archive-caption ml-auto hidden lg:inline">{unit.level}</span>
        </button>
        <div className="pointer-events-none absolute right-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
          <Tooltip content="Pin symbol on map">
            <button
              type="button"
              onClick={() => togglePinnedUnitId(unit.id)}
              className={cn(
                "interactive focus-ring rounded-[var(--radius2)] border px-1 py-0.5",
                pinned ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--line1)] text-[var(--fg2)]"
              )}
              aria-label="Pin unit"
            >
              <Pin size={11} />
            </button>
          </Tooltip>
          <Tooltip content="Focus unit on map">
            <button
              type="button"
              onClick={() => {
                setFocusedUnitId(unit.id);
                setSelectedUnitId(unit.id);
                setMobileTab("map");
              }}
              className="interactive focus-ring rounded-[var(--radius2)] border border-[var(--line1)] px-1 py-0.5 text-[var(--fg2)] hover:text-[var(--fg0)]"
              aria-label="Focus on map"
            >
              <Radar size={11} />
            </button>
          </Tooltip>
        </div>
      </motion.div>
      {hasChildren && isExpanded
        ? unit.childrenIds.map((childId) => (
            <TreeNode
              key={childId}
              unitId={childId}
              depth={depth + 1}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              visibility={visibility}
            />
          ))
        : null}
    </div>
  );
}

export function OobTree() {
  const snapshot = useSnapshot();
  const search = useAppStore((state) => state.search);
  const setSearch = useAppStore((state) => state.setSearch);
  const loadState = useAppStore((state) => state.loadState);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(snapshot.roots));
  const visibility = useUnitVisibility();

  useEffect(() => {
    setExpanded(new Set(snapshot.roots));
  }, [snapshot.date, snapshot.roots]);

  const rootNodes = useMemo(() => {
    const roots = snapshot.roots.filter((rootId) => visibility.get(rootId));
    if (roots.length > 0) {
      return roots;
    }
    return snapshot.units.filter((unit) => unit.parentId == null).map((unit) => unit.id);
  }, [snapshot, visibility]);

  const onToggleExpand = (unitId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-[var(--line0)] p-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search unit id / name / level / type"
          aria-label="OOB search"
        />
        <div className="mt-1 flex items-center justify-between">
          <span className="archive-caption">Live filter shared with map/details</span>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(new Set(snapshot.roots))}>
            Expand roots
          </Button>
        </div>
      </div>
      <Filters />
      <ScrollArea>
        {loadState === "loading" ? (
          <TreeSkeleton />
        ) : (
          <div className="space-y-0.5 p-1">
            {rootNodes.length > 0 ? rootNodes.map((rootId) => <TreeNode key={rootId} unitId={rootId} depth={0} expanded={expanded} onToggleExpand={onToggleExpand} visibility={visibility} />) : <div className="p-2 text-xs text-[var(--fg1)]">NO DATA FOR THIS SNAPSHOT</div>}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
