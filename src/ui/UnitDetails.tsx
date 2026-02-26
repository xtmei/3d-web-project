import { ChevronRight, ExternalLink } from "lucide-react";
import { useAppStore, useSnapshot } from "@/app/store";
import { trailToRoot } from "@/data/units";
import { EmptyUnitState, TableSkeleton } from "./EmptyStates";
import { Badge, BadgeButton } from "./components/Badge";
import { Popover } from "./components/Popover";
import { ScrollArea } from "./components/ScrollArea";
import { Tooltip } from "./components/Tooltip";
import { CompanyTable } from "./tables/CompanyTable";
import { SummaryTable } from "./tables/SummaryTable";

function SourcePopover({
  sourceId,
  title,
  url,
  confidence
}: {
  sourceId: string;
  title?: string;
  url?: string;
  confidence: "high" | "medium" | "low";
}) {
  return (
    <div className="space-y-1">
      <div className="archive-label">SOURCE REFERENCE</div>
      <div className="mononum text-[11px] text-[var(--fg1)]">{sourceId}</div>
      <div className="text-xs text-[var(--fg0)]">{title ?? "SOURCE UNVERIFIED"}</div>
      <div className="text-xs text-[var(--fg1)]">confidence: {confidence}</div>
      {url ? (
        <a className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline" href={url} target="_blank" rel="noreferrer">
          open citation <ExternalLink size={11} />
        </a>
      ) : null}
    </div>
  );
}

export function UnitDetails() {
  const snapshot = useSnapshot();
  const selectedUnitId = useAppStore((state) => state.selectedUnitId);
  const setSelectedUnitId = useAppStore((state) => state.setSelectedUnitId);
  const loadState = useAppStore((state) => state.loadState);
  const unit = selectedUnitId ? snapshot.unitIndexById[selectedUnitId] : null;

  if (loadState === "loading") {
    return <TableSkeleton rows={12} />;
  }
  if (!unit) {
    return <EmptyUnitState />;
  }

  const breadcrumb = trailToRoot(unit.id, snapshot.unitIndexById);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-3">
        <section className="rounded-[var(--radius4)] border border-[var(--line0)] bg-[var(--bg1)] p-3">
          <div className="archive-label">UNIT DOSSIER</div>
          <div className="mt-1 text-sm font-semibold text-[var(--fg0)]">{unit.name}</div>
          <div className="mt-0.5 text-xs text-[var(--fg1)]">
            <span className="mononum">{unit.id}</span> · {unit.level} · {unit.side} · {unit.type}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {breadcrumb.map((node, index) => (
              <div key={node.id} className="flex items-center gap-1">
                <button
                  type="button"
                  className="interactive focus-ring rounded-[var(--radius2)] px-1 text-xs text-[var(--fg1)] hover:bg-[var(--bg2)] hover:text-[var(--fg0)]"
                  onClick={() => setSelectedUnitId(node.id)}
                >
                  {node.id}
                </button>
                {index < breadcrumb.length - 1 ? <ChevronRight size={11} className="text-[var(--fg2)]" /> : null}
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1">
            <Popover
              trigger={
                <BadgeButton kind="from_source" label={unit.provenance.generated_by_template ? "template-linked" : "from_source"} />
              }
            >
              <SourcePopover
                sourceId={unit.provenance.source_id}
                title={unit.provenance.source_title}
                url={unit.provenance.source_url}
                confidence={unit.provenance.confidence}
              />
            </Popover>
            <Badge
              kind="generated_by_template"
              label={unit.provenance.generated_by_template ? "generated_by_template" : "recorded_unit"}
            />
            <Tooltip content="Confidence on source granularity and historical verification quality">
              <span>
                <Badge kind={unit.provenance.confidence} label={unit.provenance.confidence} />
              </span>
            </Tooltip>
          </div>
        </section>
        <SummaryTable unit={unit} />
        <CompanyTable rows={unit.company_details ?? []} />
      </div>
    </ScrollArea>
  );
}
