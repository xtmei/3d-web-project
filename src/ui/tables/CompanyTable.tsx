import { useEffect, useMemo, useRef, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown, ChevronRight, Copy, MinusSquare, PlusSquare } from "lucide-react";
import { useAppStore } from "@/app/store";
import type { CompanyRow } from "@/data/schema";
import { formatNumber } from "@/data/units";
import { NoDataState } from "@/ui/EmptyStates";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { Popover } from "@/ui/components/Popover";
import { Tooltip } from "@/ui/components/Tooltip";
import { cn } from "@/ui/components/cn";

type VisibleRow = {
  row: CompanyRow;
  depth: number;
  hasChildren: boolean;
};

function sumRecord(record: Record<string, number>) {
  return Object.values(record).reduce((acc, value) => acc + value, 0);
}

function toWeaponSummary(weapons: Record<string, number>) {
  const parts = Object.entries(weapons)
    .slice(0, 3)
    .map(([name, value]) => `${name}:${value}`);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function CompanyTable({ rows = [] }: { rows?: CompanyRow[] }) {
  const density = useAppStore((state) => state.density);
  const query = useAppStore((state) => state.search).trim().toLowerCase();
  const parentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { rootRows, childrenMap } = useMemo(() => {
    const lookup = new Map(rows.map((row) => [row.rowId, row]));
    const childBuckets = new Map<string, CompanyRow[]>();
    const roots: CompanyRow[] = [];
    for (const row of rows) {
      const parentId = row.parentRowId && lookup.has(row.parentRowId) ? row.parentRowId : "__root__";
      if (!childBuckets.has(parentId)) {
        childBuckets.set(parentId, []);
      }
      childBuckets.get(parentId)?.push(row);
      if (parentId === "__root__") {
        roots.push(row);
      }
    }
    return { rootRows: roots, childrenMap: childBuckets };
  }, [rows]);

  useEffect(() => {
    const withChildren = new Set<string>();
    for (const row of rows) {
      if ((childrenMap.get(row.rowId)?.length ?? 0) > 0) {
        withChildren.add(row.rowId);
      }
    }
    setExpanded(withChildren);
  }, [childrenMap, rows]);

  const includeByQuery = useMemo(() => {
    const cache = new Map<string, boolean>();
    const rowLookup = new Map(rows.map((row) => [row.rowId, row]));
    const passesSelf = (row: CompanyRow) => {
      if (!query) {
        return true;
      }
      return `${row.name} ${row.role} ${row.notes.join(" ")} ${Object.keys(row.weapons).join(" ")}`.toLowerCase().includes(query);
    };

    const walk = (rowId: string): boolean => {
      if (cache.has(rowId)) {
        return cache.get(rowId) ?? false;
      }
      const row = rowLookup.get(rowId);
      if (!row) {
        cache.set(rowId, false);
        return false;
      }
      const self = passesSelf(row);
      const child = (childrenMap.get(row.rowId) ?? []).some((childRow) => walk(childRow.rowId));
      const result = self || child;
      cache.set(rowId, result);
      return result;
    };

    for (const row of rows) {
      walk(row.rowId);
    }
    return cache;
  }, [childrenMap, query, rows]);

  const visibleRows = useMemo(() => {
    const result: VisibleRow[] = [];
    const walk = (row: CompanyRow, depth: number) => {
      if (!includeByQuery.get(row.rowId)) {
        return;
      }
      const children = childrenMap.get(row.rowId) ?? [];
      const hasChildren = children.length > 0;
      result.push({ row, depth, hasChildren });
      if (hasChildren && expanded.has(row.rowId)) {
        for (const child of children) {
          walk(child, depth + 1);
        }
      }
    };

    for (const root of rootRows) {
      walk(root, 0);
    }
    return result;
  }, [childrenMap, expanded, includeByQuery, rootRows]);

  const expandAll = () => {
    const next = new Set<string>();
    for (const [rowId, list] of childrenMap) {
      if (rowId !== "__root__" && list.length > 0) {
        next.add(rowId);
      }
    }
    setExpanded(next);
  };

  const collapseAll = () => setExpanded(new Set());

  const toggleBranch = (rowId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const columns = useMemo<ColumnDef<VisibleRow>[]>(
    () => [
      {
        id: "name",
        accessorFn: (value) => value.row.name,
        header: "Name",
        size: 330,
        cell: ({ row }) => {
          const item = row.original;
          const rowId = item.row.rowId;
          const isExpanded = expanded.has(rowId);
          return (
            <div className="group flex min-w-0 items-center gap-1" style={{ paddingLeft: item.depth * 14 }}>
              {item.hasChildren ? (
                <button
                  type="button"
                  className="interactive focus-ring rounded-[var(--radius2)] border border-[var(--line1)] p-[1px] text-[var(--fg1)] hover:text-[var(--fg0)]"
                  onClick={() => toggleBranch(rowId)}
                  aria-label={isExpanded ? "Collapse branch" : "Expand branch"}
                >
                  {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                </button>
              ) : (
                <span className="w-4" />
              )}
              <div className="min-w-0">
                <div className="truncate text-[var(--fg0)]">{item.row.name}</div>
                <div className="archive-caption truncate">{item.row.echelon}</div>
              </div>
              <div className="ml-auto hidden items-center gap-0.5 group-hover:flex">
                <Tooltip content="Copy row JSON">
                  <button
                    type="button"
                    className="interactive focus-ring rounded-[var(--radius2)] border border-[var(--line1)] p-1 text-[var(--fg2)] hover:text-[var(--fg0)]"
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(item.row, null, 2))}
                  >
                    <Copy size={11} />
                  </button>
                </Tooltip>
                <Tooltip content="Expand all rows">
                  <button
                    type="button"
                    className="interactive focus-ring rounded-[var(--radius2)] border border-[var(--line1)] p-1 text-[var(--fg2)] hover:text-[var(--fg0)]"
                    onClick={expandAll}
                  >
                    <PlusSquare size={11} />
                  </button>
                </Tooltip>
                <Tooltip content="Collapse all rows">
                  <button
                    type="button"
                    className="interactive focus-ring rounded-[var(--radius2)] border border-[var(--line1)] p-1 text-[var(--fg2)] hover:text-[var(--fg0)]"
                    onClick={collapseAll}
                  >
                    <MinusSquare size={11} />
                  </button>
                </Tooltip>
              </div>
            </div>
          );
        }
      },
      {
        id: "role",
        accessorFn: (value) => value.row.role,
        header: "Role",
        size: 110,
        cell: ({ row }) => <span className="text-[var(--fg1)]">{row.original.row.role}</span>
      },
      {
        id: "authorized",
        accessorFn: (value) => sumRecord(value.row.authorized),
        header: "Authorized",
        size: 110,
        cell: ({ row }) => <span className="mononum">{formatNumber(sumRecord(row.original.row.authorized))}</span>
      },
      {
        id: "reported",
        accessorFn: (value) => sumRecord(value.row.reported),
        header: "Reported",
        size: 100,
        cell: ({ row }) => <span className="mononum">{formatNumber(sumRecord(row.original.row.reported))}</span>
      },
      {
        id: "weapons",
        accessorFn: (value) => toWeaponSummary(value.row.weapons),
        header: "Weapons",
        size: 200,
        cell: ({ row }) => <span className="mononum text-[11px] text-[var(--fg1)]">{toWeaponSummary(row.original.row.weapons)}</span>
      },
      {
        id: "notes",
        accessorFn: (value) => value.row.notes.join("; "),
        header: "Notes",
        size: 220,
        cell: ({ row }) => <span className="text-[var(--fg1)]">{row.original.row.notes.join("; ") || "—"}</span>
      },
      {
        id: "provenance",
        accessorFn: (value) => value.row.provenance.source_id,
        header: "Provenance",
        size: 150,
        cell: ({ row }) => (
          <Popover
            trigger={
              <span>
                <Badge
                  kind={row.original.row.provenance.generated_by_template ? "generated_by_template" : "from_source"}
                  label={row.original.row.provenance.generated_by_template ? "generated_by_template" : "from_source"}
                />
              </span>
            }
          >
            <div className="space-y-1">
              <div className="archive-label">ROW SOURCE</div>
              <div className="mononum text-[11px] text-[var(--fg1)]">{row.original.row.provenance.source_id}</div>
              <div className="text-xs text-[var(--fg1)]">confidence: {row.original.row.provenance.confidence}</div>
              {row.original.row.provenance.source_url ? (
                <a href={row.original.row.provenance.source_url} target="_blank" rel="noreferrer" className="text-xs text-[var(--accent)] hover:underline">
                  open citation
                </a>
              ) : null}
            </div>
          </Popover>
        )
      }
    ],
    [childrenMap, expanded]
  );

  const table = useReactTable({
    data: visibleRows,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (density === "compact" ? 30 : 38),
    overscan: 10
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const tableRows = table.getRowModel().rows;
  const totalSize = rowVirtualizer.getTotalSize();
  const gridTemplate = table
    .getVisibleLeafColumns()
    .map((column) => `${column.getSize()}px`)
    .join(" ");

  return (
    <section className="rounded-[var(--radius4)] border border-[var(--line0)] bg-[var(--bg1)]">
      <header className="flex h-9 items-center justify-between border-b border-[var(--line0)] px-2">
        <div className="archive-label">COMPANY / PLATOON DETAIL TABLE</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={expandAll}>
            Expand all
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll}>
            Collapse all
          </Button>
        </div>
      </header>
      {rows.length === 0 ? (
        <div className="p-2">
          <NoDataState field="COMPANY DETAIL" />
        </div>
      ) : (
        <div className="h-[340px] min-h-0">
          <div
            className="sticky top-0 z-20 grid border-b border-[var(--line0)] bg-[var(--bg2)] px-2 py-1 text-[11px] uppercase tracking-[0.08em] text-[var(--fg1)]"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers.map((header, idx) => (
                <div
                  key={header.id}
                  className={cn("truncate pr-2", idx === 0 ? "sticky left-0 z-30 bg-[var(--bg2)]" : "", header.id === "authorized" || header.id === "reported" ? "text-right" : "")}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </div>
              ))
            )}
          </div>
          <div ref={parentRef} className="h-[300px] overflow-auto">
            <div style={{ height: totalSize, position: "relative" }}>
              {virtualRows.map((virtualRow) => {
                const row = tableRows[virtualRow.index];
                if (!row) {
                  return null;
                }
                return (
                  <div
                    key={row.id}
                    className={cn(
                      "table-grid absolute left-0 right-0 border-b border-[var(--line0)] px-2 text-xs hover:bg-[color-mix(in_srgb,var(--accent)_6%,var(--bg1))]",
                      density === "compact" ? "h-[30px]" : "h-[38px]"
                    )}
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                      gridTemplateColumns: gridTemplate
                    }}
                  >
                    {row.getVisibleCells().map((cell, idx) => (
                      <div
                        key={cell.id}
                        className={cn(
                          "truncate pr-2",
                          idx === 0 ? "sticky left-0 z-10 bg-[var(--bg1)]" : "",
                          cell.column.id === "authorized" || cell.column.id === "reported" ? "text-right" : ""
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
