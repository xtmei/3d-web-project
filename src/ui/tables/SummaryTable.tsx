import { useMemo, useState } from "react";
import type { ColumnDef, SortingState, VisibilityState } from "@tanstack/react-table";
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { ChevronsUpDown, Eye } from "lucide-react";
import type { Unit } from "@/data/schema";
import { formatNumber, formatPercent } from "@/data/units";
import { useAppStore } from "@/app/store";
import { NoDataState } from "@/ui/EmptyStates";
import { Button } from "@/ui/components/Button";
import { Popover } from "@/ui/components/Popover";
import { Tooltip } from "@/ui/components/Tooltip";
import { cn } from "@/ui/components/cn";

type SummaryRow = {
  field: string;
  label: string;
  value: number | string | null | undefined;
  numeric: boolean;
  description: string;
  provenance: Unit["provenance"];
};

function fieldRows(unit: Unit): SummaryRow[] {
  const summary = unit.summary ?? {};
  return [
    {
      field: "manpower_reported",
      label: "Manpower Reported",
      value: summary.manpower_reported,
      numeric: true,
      description: "Observed effective strength reported during the snapshot interval.",
      provenance: unit.provenance
    },
    {
      field: "manpower_authorized",
      label: "Manpower Authorized",
      value: summary.manpower_authorized,
      numeric: true,
      description: "Authorized wartime establishment (TO&E reference strength).",
      provenance: unit.provenance
    },
    {
      field: "combat_rating",
      label: "Combat Rating",
      value: summary.combat_rating,
      numeric: true,
      description: "Composite indicator for operational effectiveness and cohesion.",
      provenance: unit.provenance
    },
    {
      field: "fatigue",
      label: "Fatigue",
      value: summary.fatigue,
      numeric: true,
      description: "Operational fatigue index (0-1), higher means degraded readiness.",
      provenance: unit.provenance
    },
    {
      field: "ammo",
      label: "Ammo",
      value: summary.ammo,
      numeric: true,
      description: "Estimated ammunition sufficiency level (0-1).",
      provenance: unit.provenance
    },
    {
      field: "morale",
      label: "Morale",
      value: summary.morale,
      numeric: true,
      description: "Estimated morale level from narrative and strength indicators.",
      provenance: unit.provenance
    },
    {
      field: "weapons_summary",
      label: "Weapons Summary",
      value: summary.weapons_summary,
      numeric: false,
      description: "High-level list of available key weapon systems.",
      provenance: unit.provenance
    }
  ];
}

function renderValue(row: SummaryRow) {
  if (row.value == null || row.value === "") {
    return <span className="text-[var(--fg2)]">—</span>;
  }
  if (typeof row.value === "number") {
    if (["combat_rating", "fatigue", "ammo", "morale"].includes(row.field)) {
      return <span>{formatPercent(row.value)}</span>;
    }
    return <span>{formatNumber(row.value)}</span>;
  }
  return <span>{String(row.value)}</span>;
}

export function SummaryTable({ unit }: { unit: Unit }) {
  const query = useAppStore((state) => state.search).trim().toLowerCase();
  const density = useAppStore((state) => state.density);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    field: true,
    value: true,
    source: true
  });

  const rows = useMemo(() => {
    const baseRows = fieldRows(unit);
    if (!query) {
      return baseRows;
    }
    return baseRows.filter((row) => `${row.field} ${row.label}`.toLowerCase().includes(query));
  }, [query, unit]);

  const allNull = rows.every((row) => row.value == null || row.value === "");

  const columns = useMemo<ColumnDef<SummaryRow>[]>(
    () => [
      {
        accessorKey: "field",
        header: ({ column }) => (
          <button
            type="button"
            className="interactive focus-ring inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Field
            <ChevronsUpDown size={12} />
          </button>
        ),
        cell: ({ row }) => (
          <Tooltip content={row.original.description}>
            <span className="cursor-help text-[var(--fg1)]">{row.original.label}</span>
          </Tooltip>
        ),
        size: 220
      },
      {
        accessorKey: "value",
        header: ({ column }) => (
          <button
            type="button"
            className="interactive focus-ring ml-auto inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Value
            <ChevronsUpDown size={12} />
          </button>
        ),
        cell: ({ row }) => <span className="mononum">{renderValue(row.original)}</span>,
        size: 140
      },
      {
        id: "source",
        header: "Source",
        cell: ({ row }) => (
          <Popover
            trigger={
              <Button size="sm" variant="ghost">
                source
              </Button>
            }
          >
            <div className="space-y-1">
              <div className="archive-label">SOURCE REFERENCE</div>
              <div className="mononum text-[11px] text-[var(--fg1)]">{row.original.provenance.source_id}</div>
              <div className="text-xs">{row.original.provenance.source_title ?? "SOURCE UNVERIFIED"}</div>
              <div className="text-xs text-[var(--fg1)]">confidence: {row.original.provenance.confidence}</div>
              {row.original.provenance.source_url ? (
                <a href={row.original.provenance.source_url} target="_blank" rel="noreferrer" className="text-xs text-[var(--accent)] hover:underline">
                  open citation
                </a>
              ) : null}
            </div>
          </Popover>
        ),
        size: 90
      }
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <section className="rounded-[var(--radius4)] border border-[var(--line0)] bg-[var(--bg1)]">
      <header className="flex h-9 items-center justify-between border-b border-[var(--line0)] px-2">
        <div className="archive-label">BATTALION SUMMARY</div>
        <Popover
          trigger={
            <Button variant="ghost" size="sm">
              <Eye size={12} />
              Columns
            </Button>
          }
        >
          <div className="space-y-1">
            {table.getAllLeafColumns().map((column) => (
              <label key={column.id} className="flex cursor-pointer items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                  className="h-3.5 w-3.5 accent-[var(--accent)]"
                />
                {column.id}
              </label>
            ))}
          </div>
        </Popover>
      </header>
      <div className="overflow-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="border-b border-[var(--line0)] text-[var(--fg1)]">
                {group.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-2 py-1.5 text-left font-medium",
                      header.column.id === "value" ? "text-right" : ""
                    )}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-[var(--line0)]",
                  density === "compact" ? "h-7" : "h-9",
                  "hover:bg-[color-mix(in_srgb,var(--accent)_6%,var(--bg1))]"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cn("px-2 py-1", cell.column.id === "value" ? "text-right" : "")}
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {allNull ? (
        <div className="border-t border-[var(--line0)] p-2">
          <NoDataState field="THIS SNAPSHOT" />
        </div>
      ) : null}
    </section>
  );
}
